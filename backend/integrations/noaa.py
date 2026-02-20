"""
NOAA Weather / Safety Data Integration
=======================================
Uses NOAA's publicly available REST APIs:
  - NWS Marine Alerts: https://api.weather.gov/alerts/active?area=...
  - NDBC Buoy Data (optional extension)

No API key required for basic NWS alerts.
Piracy data sourced from IMB (manual load — no public REST API available).
"""
import requests
from datetime import datetime, timezone

NOAA_ALERTS_URL = "https://api.weather.gov/alerts/active"
NOAA_HEADERS = {
    "User-Agent": "MaritimeVesselTracker/1.0 (maritime-app@example.com)",
    "Accept": "application/json",
}


def fetch_marine_alerts(area_codes: list[str] = None) -> list[dict]:
    """
    Fetch active NOAA marine weather alerts.
    area_codes: list of 2-letter US state/zone codes, e.g. ['GM', 'PZ'] for Gulf/Pacific.
    Returns list of normalized alert dicts.
    """
    params = {"status": "actual", "urgency": "Immediate,Expected"}
    if area_codes:
        params["area"] = ",".join(area_codes)

    try:
        resp = requests.get(NOAA_ALERTS_URL, params=params,
                            headers=NOAA_HEADERS, timeout=10)
        resp.raise_for_status()
        features = resp.json().get("features", [])

        results = []
        for f in features:
            props = f.get("properties", {})
            event_type = props.get("event", "").lower()
            severity = _map_severity(props.get("severity", "Minor"))

            # Map event to our type vocabulary
            if "hurricane" in event_type or "typhoon" in event_type or "storm" in event_type:
                our_type = "storm"
            elif "squall" in event_type or "fog" in event_type or "wind" in event_type:
                our_type = "storm"
            else:
                our_type = "other"

            # Try to extract a coordinate from the geometry
            lat, lon = None, None
            geom = f.get("geometry")
            if geom and geom.get("type") == "Point":
                lon, lat = geom["coordinates"][:2]
            elif geom and geom.get("type") == "Polygon":
                coords = geom["coordinates"][0]
                lat = sum(c[1] for c in coords) / len(coords)
                lon = sum(c[0] for c in coords) / len(coords)

            results.append({
                "source": "NOAA",
                "event_type": our_type,
                "title": props.get("event", "Marine Alert"),
                "description": props.get("description", "")[:500],
                "severity": severity,
                "latitude": lat,
                "longitude": lon,
                "radius_nm": 100.0,
                "active_from": props.get("onset") or props.get("sent"),
                "active_until": props.get("expires"),
            })

        return results

    except requests.RequestException as e:
        print(f"[NOAA] Request error: {e}")
    except (ValueError, KeyError) as e:
        print(f"[NOAA] Parse error: {e}")

    return []


def _map_severity(noaa_severity: str) -> str:
    mapping = {
        "Extreme": "critical",
        "Severe": "high",
        "Moderate": "medium",
        "Minor": "low",
        "Unknown": "low",
    }
    return mapping.get(noaa_severity, "low")


def sync_noaa_safety_events():
    """
    Pulls active NOAA marine weather alerts and upserts them into SafetyEvent.
    Only fetches storm / weather type events from NOAA. Piracy data is added manually.
    """
    from apps.vessels.safety_models import SafetyEvent
    from django.utils import timezone as dj_timezone

    alerts = fetch_marine_alerts(area_codes=["GM", "PZ", "AN", "AM"])
    created_count = 0

    for alert in alerts:
        if alert["latitude"] is None:
            continue

        # Simple dedup: title + date match within same day
        active_from = alert.get("active_from")
        if active_from:
            try:
                from dateutil import parser as dateparser
                dt = dateparser.parse(active_from)
            except Exception:
                dt = dj_timezone.now()
        else:
            dt = dj_timezone.now()

        _, created = SafetyEvent.objects.get_or_create(
            title=alert["title"],
            source="NOAA",
            active_from__date=dt.date(),
            defaults={
                "event_type": alert["event_type"],
                "description": alert["description"],
                "severity": alert["severity"],
                "latitude": alert["latitude"],
                "longitude": alert["longitude"],
                "radius_nm": alert["radius_nm"],
                "active_from": dt,
                "is_active": True,
            }
        )
        if created:
            created_count += 1

    print(f"[NOAA Sync] Created {created_count} new safety events.")
    return created_count