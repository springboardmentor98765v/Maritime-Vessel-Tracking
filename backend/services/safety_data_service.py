"""
services/safety_data_service.py
────────────────────────────────
Simulates fetching NOAA ocean/weather hazard data (storms, cyclones, alerts).
In production, replace `fetch_safety_data()` body with a real NOAA/GFT API call.
"""

from __future__ import annotations
import random
from datetime import datetime, timedelta


def fetch_safety_data() -> list[dict]:
    """
    Return cleaned NOAA-style safety zone data.

    Returns:
        List of dicts, each containing:
            zone_type, title, latitude, longitude, radius_km, severity,
            source, active_from, active_until
    """
    # --- Simulated NOAA events ---
    EVENTS = [
        {
            "zone_type": "storm",
            "title": "Severe Storm — Bay of Bengal",
            "latitude": 14.5,
            "longitude": 89.3,
            "radius_km": 300,
            "severity": "high",
        },
        {
            "zone_type": "cyclone",
            "title": "Cyclone Warning — Arabian Sea",
            "latitude": 15.2,
            "longitude": 64.8,
            "radius_km": 450,
            "severity": "critical",
        },
        {
            "zone_type": "piracy",
            "title": "Piracy Alert — Gulf of Guinea",
            "latitude": 3.5,
            "longitude": 2.1,
            "radius_km": 200,
            "severity": "high",
        },
        {
            "zone_type": "accident",
            "title": "Maritime Accident Zone — Strait of Malacca",
            "latitude": 2.8,
            "longitude": 101.5,
            "radius_km": 50,
            "severity": "medium",
        },
    ]

    now = datetime.utcnow()
    results = []
    for ev in EVENTS:
        results.append({
            **ev,
            "source": "NOAA-SIM",
            "active_from": (now - timedelta(hours=random.randint(1, 24))).isoformat(),
            "active_until": (now + timedelta(days=random.randint(1, 5))).isoformat(),
        })
    return results
