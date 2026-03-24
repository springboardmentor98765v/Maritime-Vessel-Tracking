"""
services/port_data_service.py
─────────────────────────────
Simulates fetching UNCTAD port statistics (arrivals, departures, trade flow).
In production, replace the body of `fetch_port_data()` with a real HTTP call.
"""

from __future__ import annotations
import random
from datetime import datetime


def fetch_port_data(port_name: str | None = None) -> list[dict]:
    """
    Return cleaned UNCTAD-style port statistics.

    Args:
        port_name: optional filter; if None returns all simulated ports.

    Returns:
        List of dicts, each containing:
            port, arrivals, departures, trade_flow_usd, recorded_at
    """
    # --- Simulated dataset (replace with requests.get(UNCTAD_API_URL, ...) in prod) ---
    SIMULATED_PORTS = [
        "Singapore", "Rotterdam", "Shanghai", "Busan", "Dubai",
        "Los Angeles", "Mumbai", "Hamburg", "Jakarta", "Sydney",
    ]

    results = []
    try:
        for name in SIMULATED_PORTS:
            if port_name and name.lower() != port_name.lower():
                continue
            arrivals = random.randint(80, 200)
            departures = random.randint(70, arrivals)
            results.append({
                "port": name,
                "arrivals": arrivals,
                "departures": departures,
                "trade_flow_usd": round(random.uniform(1e8, 5e9), 2),
                "recorded_at": datetime.utcnow().isoformat(),
            })
    except Exception as e:
        from apps.admin.models import ApiLog
        ApiLog.objects.create(source="UNCTAD", error_message=str(e))
        
    return results
