"""
MarineTraffic API v2 Client
============================
Docs: https://www.marinetraffic.com/en/ais-api-services

Endpoint: getVesselLatestPosition
  GET https://services.marinetraffic.com/api/getvessel/{API_KEY}

Set MARINETRAFFIC_API_KEY in your .env file.
API is pay-per-use; returns [] gracefully if key is missing or quota is spent.
"""
import os
import logging
import requests

logger = logging.getLogger(__name__)

MARINETRAFFIC_BASE = "https://services.marinetraffic.com/api/exportvessel"
MARINETRAFFIC_API_KEY = os.getenv("MARINETRAFFIC_API_KEY", "")


def fetch_vessel_positions(mmsi_list: list[str] | None = None) -> list[dict]:
    """
    Fetch real-time AIS vessel positions from MarineTraffic v2.

    Args:
        mmsi_list: Optional list of MMSI numbers to filter by.
                   If None, fetches the most recent positions for
                   all vessels the API key has access to.

    Returns:
        List of normalised dicts with keys:
            mmsi, imo, name, lat, lon, speed, heading,
            destination, vessel_type, flag, timestamp
        Returns [] on any error so callers always get a valid list.
    """
    if not MARINETRAFFIC_API_KEY:
        logger.warning("[MarineTraffic] MARINETRAFFIC_API_KEY is not set. Skipping live fetch.")
        return []

    url = f"{MARINETRAFFIC_BASE}/{MARINETRAFFIC_API_KEY}"
    params = {
        "v": 2,
        "protocol": "jsono",   # one JSON object per line (easier to parse than CSV)
    }
    if mmsi_list:
        params["mmsi"] = ",".join(mmsi_list)

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        raw = response.json()

        # MarineTraffic jsono v2 returns a list of vessel dicts
        if not isinstance(raw, list):
            logger.error("[MarineTraffic] Unexpected response format: %s", type(raw))
            return []

        results = []
        for v in raw:
            try:
                lat = _safe_float(v.get("LAT") or v.get("LATITUDE"))
                lon = _safe_float(v.get("LON") or v.get("LONGITUDE"))
                if lat is None or lon is None:
                    continue  # skip vessels with no position

                results.append({
                    "mmsi":        str(v.get("MMSI", "")),
                    "imo":         str(v.get("IMO", "") or ""),
                    "name":        v.get("SHIPNAME", "") or v.get("NAME", ""),
                    "lat":         lat,
                    "lon":         lon,
                    "speed":       _safe_float(v.get("SPEED") or v.get("SOG")),
                    "heading":     _safe_float(v.get("HEADING") or v.get("COG")),
                    "destination": v.get("DESTINATION", "") or "",
                    "vessel_type": _map_vessel_type(v.get("SHIPTYPE") or v.get("TYPE_NAME", "")),
                    "flag":        v.get("FLAG") or v.get("COUNTRY", ""),
                    "timestamp":   v.get("TIMESTAMP") or v.get("TIME", ""),
                })
            except Exception as parse_err:
                logger.debug("[MarineTraffic] Skipping vessel record due to parse error: %s", parse_err)
                continue

        logger.info("[MarineTraffic] Fetched %d vessel positions.", len(results))
        return results

    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 402:
            logger.warning("[MarineTraffic] HTTP 402 – API quota exhausted or invalid key.")
            from apps.admin.models import ApiLog
            ApiLog.objects.create(source="MarineTraffic", error_message="HTTP 402 API quota exhausted")
        else:
            logger.error("[MarineTraffic] HTTP error: %s", e)
            from apps.admin.models import ApiLog
            ApiLog.objects.create(source="MarineTraffic", error_message=f"HTTP error: {str(e)}")
    except requests.ConnectionError:
        logger.error("[MarineTraffic] Could not connect to MarineTraffic API.")
        from apps.admin.models import ApiLog
        ApiLog.objects.create(source="MarineTraffic", error_message="Could not connect to API")
    except requests.Timeout:
        logger.error("[MarineTraffic] Request timed out after 15 s.")
        from apps.admin.models import ApiLog
        ApiLog.objects.create(source="MarineTraffic", error_message="Request timed out")
    except (ValueError, KeyError) as e:
        logger.error("[MarineTraffic] JSON parse error: %s", e)
        from apps.admin.models import ApiLog
        ApiLog.objects.create(source="MarineTraffic", error_message=f"Parse error: {str(e)}")

    return []


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _safe_float(val) -> float | None:
    """Convert a value to float, returning None if conversion fails."""
    if val is None or val == "":
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None


_SHIPTYPE_MAP = {
    # MarineTraffic numeric SHIPTYPE codes → our vocabulary
    "70": "Cargo",
    "71": "Cargo",
    "72": "Cargo",
    "73": "Cargo",
    "74": "Cargo",
    "80": "Tanker",
    "81": "Tanker",
    "82": "Tanker",
    "83": "Tanker",
    "84": "Tanker",
    "60": "Passenger",
    "61": "Passenger",
    "69": "Passenger",
    "30": "Fishing",
    "35": "Military",
    "36": "Sailing",
    "37": "Pleasure Craft",
    "50": "Pilot Vessel",
    "51": "Search and Rescue",
    "52": "Tug",
    "55": "Law Enforcement",
    "90": "Other",
}

def _map_vessel_type(raw) -> str:
    """Convert a MarineTraffic SHIPTYPE code or string to our vocabulary."""
    if raw is None:
        return "Unknown"
    raw_str = str(raw).strip()
    # If it's a numeric code, look it up
    mapped = _SHIPTYPE_MAP.get(raw_str)
    if mapped:
        return mapped
    # If it's already a string label, use it directly (capitalised)
    if raw_str and not raw_str.isdigit():
        return raw_str.title()
    return "Unknown"