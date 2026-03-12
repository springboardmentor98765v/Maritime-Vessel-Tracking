"""
services/safety_detection_service.py
──────────────────────────────────────
Detects whether a vessel's current position lies inside any safety zone.
Uses the Haversine formula for accurate great-circle distance calculation.
"""

from __future__ import annotations
import math


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance in kilometres between two lat/lon points."""
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


ZONE_TYPE_LABEL = {
    "storm": "Storm Warning",
    "cyclone": "Cyclone Alert",
    "piracy": "Piracy Zone Alert",
    "accident": "Accident Zone Warning",
    "restricted": "Restricted Area",
}


def check_vessel_risk(vessel: dict, safety_zones: list[dict]) -> list[dict]:
    """
    Check one vessel against all safety zones.

    Args:
        vessel: dict with at least {"name": str, "lat": float, "lon": float}
        safety_zones: list of zone dicts with keys:
                      zone_type, latitude, longitude, radius_km, severity

    Returns:
        List of risk alert dicts. Empty list = no risk detected.
    """
    lat = vessel.get("lat") or vessel.get("last_position_lat")
    lon = vessel.get("lon") or vessel.get("last_position_lon")
    if lat is None or lon is None:
        return []

    alerts = []
    for zone in safety_zones:
        dist_km = _haversine_km(lat, lon, zone["latitude"], zone["longitude"])
        if dist_km <= zone.get("radius_km", 100):
            alerts.append({
                "vessel": vessel.get("name", "Unknown"),
                "vessel_id": vessel.get("id"),
                "risk": ZONE_TYPE_LABEL.get(zone["zone_type"], zone["zone_type"]),
                "zone_type": zone["zone_type"],
                "severity": zone.get("severity", "medium"),
                "zone_title": zone.get("title", zone["zone_type"]),
                "distance_km": round(dist_km, 2),
            })
    return alerts


def detect_all_risks(vessels: list[dict], safety_zones: list[dict]) -> list[dict]:
    """Run risk detection across all vessels and all zones."""
    all_alerts = []
    for vessel in vessels:
        all_alerts.extend(check_vessel_risk(vessel, safety_zones))
    # Sort by severity (critical first)
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    all_alerts.sort(key=lambda a: severity_order.get(a["severity"], 9))
    return all_alerts
