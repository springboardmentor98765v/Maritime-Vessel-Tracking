import logging
from datetime import datetime, timedelta

import requests

from apps.safety.models import ApiIntegrationLog

logger = logging.getLogger(__name__)

# For demo: placeholder external endpoint
# Replace with real NOAA alerts/ocean endpoint later
NOAA_API_URL = "https://jsonplaceholder.typicode.com/posts/2"


def fetch_noaa_safety_data() -> list:
    """
    Fetch external safety/weather data and return only required fields.

    Output example:
    [
        {
            "external_id": "NOAA-1",
            "source": "NOAA",
            "alert_type": "Storm",
            "latitude": 15.0,
            "longitude": 70.0,
            "radius": 500,
            "severity": "High",
            "expires_at": "2026-03-18T10:00:00",
            "raw_payload": {}
        }
    ]
    """
    try:
        response = requests.get(NOAA_API_URL, timeout=10)
        response.raise_for_status()
        data = response.json()

        ApiIntegrationLog.objects.create(
            source="NOAA",
            endpoint=NOAA_API_URL,
            status="success",
            message="Fetched NOAA data successfully",
        )

        return [
            {
                "external_id": f"NOAA-{data.get('id', '999')}",
                "source": "NOAA",
                "alert_type": "Storm",
                "latitude": 15.0,
                "longitude": 70.0,
                "radius": 500,
                "severity": "High",
                "expires_at": (datetime.now() + timedelta(hours=12)).isoformat(),
                "raw_payload": data,
            }
        ]

    except Exception as e:
        logger.error(f"Error fetching NOAA data: {e}")

        ApiIntegrationLog.objects.create(
            source="NOAA",
            endpoint=NOAA_API_URL,
            status="failed",
            message=str(e),
        )

        return [
            {
                "external_id": "NOAA-FALLBACK-1",
                "source": "NOAA",
                "alert_type": "Storm",
                "latitude": 15.0,
                "longitude": 70.0,
                "radius": 500,
                "severity": "High",
                "expires_at": (datetime.now() + timedelta(hours=12)).isoformat(),
                "raw_payload": {},
            }
        ]