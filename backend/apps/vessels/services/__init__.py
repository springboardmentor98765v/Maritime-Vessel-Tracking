"""
apps/vessels/services/__init__.py
==================================
Core vessel business-logic services:

    fetch_and_update_vessels()  — fetches live AIS data from MarineTraffic and
                                   calls process_vessel_update() for each result.

    process_vessel_update(data) — applies a single AIS payload to the database:
                                   updates position/speed/heading/destination and
                                   fires VesselEvent records for detected state changes.

Both functions are imported by:
  - apps/vessels/tasks.py          (Celery periodic task every 5 min)
  - management/commands/fetch_vessels.py
  - management/commands/simulate_live_api.py
"""

from __future__ import annotations

import logging
from django.utils import timezone

logger = logging.getLogger(__name__)


# ─── Public API ───────────────────────────────────────────────────────────────


def fetch_and_update_vessels() -> int:
    """
    Pull live AIS data from MarineTraffic and persist updates to the database.

    Returns:
        Number of vessels successfully updated.

    Fails gracefully — if MarineTraffic returns no data (quota exhausted,
    network error, API key missing) the function logs a warning and returns 0.
    This keeps the Celery task and management command from raising exceptions.
    """
    from integrations.marinetraffic import fetch_vessel_positions

    positions = fetch_vessel_positions()

    if not positions:
        logger.warning(
            "[VesselService] fetch_and_update_vessels: MarineTraffic returned 0 positions. "
            "Check MARINETRAFFIC_API_KEY and API credits."
        )
        return 0

    updated = 0
    for pos in positions:
        try:
            process_vessel_update(pos)
            updated += 1
        except Exception as exc:
            logger.error(
                "[VesselService] Failed to process update for vessel %s: %s",
                pos.get("imo") or pos.get("mmsi", "unknown"),
                exc,
            )

    logger.info("[VesselService] fetch_and_update_vessels: updated %d vessels.", updated)
    return updated


def process_vessel_update(data: dict) -> object | None:
    """
    Apply a single AIS update payload to the database.

    The ``data`` dict can come from MarineTraffic, AIS Hub, or the simulator.
    Required key:
        imo  (str)  — IMO number, used as the primary vessel lookup key.

    Optional keys (any subset):
        lat, lon, speed, heading, destination,
        name, type (vessel_type), flag, cargo, mmsi

    Side-effects:
        - Updates Vessel fields in-place.
        - Creates VesselEvent records for state changes:
            * speed drops to 0              → "stopped"
            * speed goes from 0 to non-zero → "underway"
            * destination field changes      → "route_changed"
        - Django signal in signals.py then fires Notification objects for
          all users subscribed to this vessel.

    Returns:
        The updated Vessel instance, or None if the IMO is unknown.
    """
    from apps.vessels.models import Vessel, VesselEvent

    imo = str(data.get("imo") or data.get("IMO") or "").strip()
    if not imo:
        # Try falling back to MMSI if no IMO supplied
        imo = str(data.get("mmsi") or data.get("MMSI") or "").strip()

    if not imo:
        logger.debug("[VesselService] process_vessel_update: skipping record with no IMO/MMSI.")
        return None

    try:
        vessel = Vessel.objects.get(imo_number=imo)
    except Vessel.DoesNotExist:
        # Unknown vessel — skip. We don't auto-create to avoid polluting the DB
        # with vessels that haven't been seeded/approved.
        logger.debug("[VesselService] Unknown vessel IMO %s — skipping.", imo)
        return None

    # ── Snapshot current state for change detection ──────────────────────────
    prev_speed = vessel.speed or 0.0
    prev_destination = vessel.destination or ""

    # ── Apply position / nav updates ─────────────────────────────────────────
    lat = _safe_float(data.get("lat") or data.get("LAT") or data.get("LATITUDE"))
    lon = _safe_float(data.get("lon") or data.get("LON") or data.get("LONGITUDE"))
    speed = _safe_float(data.get("speed") or data.get("SPEED") or data.get("SOG"))
    heading = _safe_float(data.get("heading") or data.get("HEADING") or data.get("COG"))
    destination = str(data.get("destination") or data.get("DESTINATION") or "").strip()

    update_fields: list[str] = ["last_update"]
    vessel.last_update = timezone.now()

    if lat is not None:
        vessel.last_position_lat = lat
        update_fields.append("last_position_lat")
    if lon is not None:
        vessel.last_position_lon = lon
        update_fields.append("last_position_lon")
    if speed is not None:
        vessel.speed = speed
        update_fields.append("speed")
    if heading is not None:
        vessel.heading = heading
        update_fields.append("heading")
    if destination:
        vessel.destination = destination
        update_fields.append("destination")

    # Optional: update static fields if provided by the API
    name = str(data.get("name") or data.get("NAME") or data.get("SHIPNAME") or "").strip()
    vessel_type = str(data.get("type") or data.get("vessel_type") or data.get("TYPE_NAME") or "").strip()
    flag = str(data.get("flag") or data.get("FLAG") or data.get("COUNTRY") or "").strip()

    if name and name != vessel.name:
        vessel.name = name
        update_fields.append("name")
    if vessel_type and vessel_type != vessel.vessel_type:
        vessel.vessel_type = vessel_type
        update_fields.append("vessel_type")
    if flag and flag != vessel.flag:
        vessel.flag = flag
        update_fields.append("flag")

    vessel.save(update_fields=list(set(update_fields)))

    # ── Event detection ───────────────────────────────────────────────────────
    now = timezone.now()
    events_to_create: list[VesselEvent] = []

    if speed is not None:
        new_speed = speed
        # Stopped: was moving, now stationary
        if prev_speed > 0.5 and new_speed <= 0.5:
            events_to_create.append(VesselEvent(
                vessel=vessel,
                event_type="stopped",
                latitude=lat,
                longitude=lon,
                location=destination or "",
                timestamp=now,
                details=f"Vessel stopped. Previous speed: {prev_speed:.1f} kn.",
            ))
        # Underway: was stationary, now moving
        elif prev_speed <= 0.5 and new_speed > 0.5:
            events_to_create.append(VesselEvent(
                vessel=vessel,
                event_type="underway",
                latitude=lat,
                longitude=lon,
                location=destination or "",
                timestamp=now,
                details=f"Vessel underway at {new_speed:.1f} kn.",
            ))

    # Route changed: destination updated to a different (non-empty) value
    if (
        destination
        and prev_destination
        and destination.lower() != prev_destination.lower()
    ):
        events_to_create.append(VesselEvent(
            vessel=vessel,
            event_type="route_changed",
            latitude=lat,
            longitude=lon,
            location=destination,
            timestamp=now,
            details=f"Destination changed from '{prev_destination}' to '{destination}'.",
        ))

    if events_to_create:
        # bulk_create won't trigger post_save signals — create them one by one
        # so that the signals.py notification logic fires for each event.
        for event in events_to_create:
            event.save()

    return vessel


# ─── Internal helpers ─────────────────────────────────────────────────────────

def _safe_float(val) -> float | None:
    """Convert a value to float, returning None if the conversion fails."""
    if val is None or val == "":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None
