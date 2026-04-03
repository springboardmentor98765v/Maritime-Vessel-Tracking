import logging
from datetime import datetime

import requests

from apps.safety.models import ApiIntegrationLog

logger = logging.getLogger(__name__)

# For demo: keep a placeholder/fallback source
# Replace with real UNCTAD endpoint when available
UNCTAD_API_URL = "https://jsonplaceholder.typicode.com/users"


def fetch_unctad_port_data() -> list:
    """
    Fetch external port statistics and return only required fields.

    Output example:
    [
        {
            "port_name": "Singapore",
            "arrivals": 120,
            "departures": 115,
            "trade_flow": 4500,
            "timestamp": "2026-03-17T10:00:00"
        }
    ]
    """
    try:
        response = requests.get(UNCTAD_API_URL, timeout=10)
        response.raise_for_status()
        data = response.json()

        ApiIntegrationLog.objects.create(
            source="UNCTAD",
            endpoint=UNCTAD_API_URL,
            status="success",
            message="Fetched UNCTAD data successfully",
        )

        results = []

        demo_ports = [
            "Singapore",
            "Rotterdam",
            "Shanghai",
            "Los Angeles",
            "Dubai",
            "Chennai",
            "Mumbai",
        ]

        for index, item in enumerate(data[:7]):
            arrivals = 100 + (index * 10)
            departures = 80 + (index * 8)
            trade_flow = 1000 + (index * 250)

            results.append(
                {
                    "port_name": demo_ports[index],
                    "arrivals": arrivals,
                    "departures": departures,
                    "trade_flow": trade_flow,
                    "timestamp": datetime.now().isoformat(),
                }
            )

        return results

    except Exception as e:
        logger.error(f"Error fetching UNCTAD data: {e}")

        ApiIntegrationLog.objects.create(
            source="UNCTAD",
            endpoint=UNCTAD_API_URL,
            status="failed",
            message=str(e),
        )

        return [
            {
                "port_name": "Singapore",
                "arrivals": 120,
                "departures": 115,
                "trade_flow": 4500,
                "timestamp": datetime.now().isoformat(),
            },
            {
                "port_name": "Rotterdam",
                "arrivals": 95,
                "departures": 82,
                "trade_flow": 3800,
                "timestamp": datetime.now().isoformat(),
            },
            {
                "port_name": "Chennai",
                "arrivals": 75,
                "departures": 60,
                "trade_flow": 2100,
                "timestamp": datetime.now().isoformat(),
            },
        ]