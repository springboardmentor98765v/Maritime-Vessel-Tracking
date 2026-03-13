"""
services/port_analytics_service.py
────────────────────────────────────
Calculates basic congestion metrics from port arrival/departure data.
"""

from __future__ import annotations


def calculate_congestion_score(arrivals: int, departures: int) -> float:
    """
    Simple congestion formula:
        score = (arrivals - departures) / arrivals  [0.0 – 1.0]

    Returns 0.0 when arrivals == 0 to avoid division by zero.
    """
    if arrivals <= 0:
        return 0.0
    raw = (arrivals - departures) / arrivals
    return round(max(0.0, min(1.0, raw)), 4)


def get_congestion_level(score: float) -> str:
    if score >= 0.8:
        return "critical"
    elif score >= 0.6:
        return "high"
    elif score >= 0.35:
        return "moderate"
    return "low"


def analyse_port(port_data: dict) -> dict:
    """
    Receive a port_data dict (from port_data_service) and return analytics.

    Args:
        port_data: {"port": str, "arrivals": int, "departures": int, ...}

    Returns:
        {
          "port": str,
          "arrivals": int,
          "departures": int,
          "congestion_score": float,
          "congestion_level": str,
        }
    """
    arrivals = port_data.get("arrivals", 0)
    departures = port_data.get("departures", 0)
    score = calculate_congestion_score(arrivals, departures)
    return {
        "port": port_data.get("port", "Unknown"),
        "arrivals": arrivals,
        "departures": departures,
        "congestion_score": score,
        "congestion_level": get_congestion_level(score),
    }


def analyse_all_ports(port_data_list: list[dict]) -> list[dict]:
    """Apply analyse_port to every entry and sort by score descending."""
    results = [analyse_port(p) for p in port_data_list]
    return sorted(results, key=lambda x: x["congestion_score"], reverse=True)
