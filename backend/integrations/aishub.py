"""
AIS Hub API client — https://www.aishub.net/api
Free-tier accounts can query vessel positions by MMSI.

Set AISHUB_USERNAME in your environment / .env file.
"""
import os
import requests

AISHUB_BASE = "https://data.aishub.net/ws.php"
AISHUB_USERNAME = os.getenv("AISHUB_USERNAME", "")


def fetch_vessel_positions(mmsi_list: list[str]) -> list[dict]:
    """
    Fetch real-time positions for a list of MMSI numbers from AIS Hub.
    Returns a list of dicts with keys:
        mmsi, lat, lon, speed, course, heading, status, timestamp
    """
    if not AISHUB_USERNAME:
        return []

    mmsi_str = ",".join(mmsi_list)

    params = {
        "username": AISHUB_USERNAME,
        "format": 1,          # JSON format
        "output": "json",
        "compress": 0,
        "mmsi": mmsi_str,
    }

    try:
        response = requests.get(AISHUB_BASE, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # AIS Hub returns [{header}, [{vessel_data},...]]
        if isinstance(data, list) and len(data) >= 2:
            vessels_raw = data[1]
            results = []
            for v in vessels_raw:
                results.append({
                    "mmsi": str(v.get("MMSI", "")),
                    "lat": v.get("LATITUDE"),
                    "lon": v.get("LONGITUDE"),
                    "speed": v.get("SOG"),          # Speed Over Ground (knots)
                    "course": v.get("COG"),          # Course Over Ground
                    "heading": v.get("HEADING"),
                    "status": v.get("NAVSTAT"),      # Navigation status
                    "timestamp": v.get("TIME"),
                    "name": v.get("NAME", ""),
                })
            return results

    except requests.RequestException as e:
        print(f"[AIS Hub] Request error: {e}")
    except (ValueError, IndexError, KeyError) as e:
        print(f"[AIS Hub] Parse error: {e}")

    return []


def sync_vessel_positions():
    """
    Pull positions for all vessels in the DB that have an IMO number
    (used as a proxy for MMSI lookup — in production, store MMSI separately).
    Updates Vessel.last_position_lat/lon/last_update in the database.
    """
    from apps.vessels.models import Vessel
    from django.utils import timezone

    vessels = Vessel.objects.exclude(imo_number__exact="")
    # In a real scenario you'd store MMSI; here we pass IMO numbers as identifiers
    mmsi_list = list(vessels.values_list("imo_number", flat=True))

    if not mmsi_list:
        return

    positions = fetch_vessel_positions(mmsi_list)

    for pos in positions:
        if pos["lat"] is None or pos["lon"] is None:
            continue
        Vessel.objects.filter(imo_number=pos["mmsi"]).update(
            last_position_lat=pos["lat"],
            last_position_lon=pos["lon"],
            last_update=timezone.now(),
        )