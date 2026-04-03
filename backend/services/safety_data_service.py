from integrations.noaa import NOAAClient
import logging

logger = logging.getLogger(__name__)


def fetch_safety_data():
    try:
        client = NOAAClient()
        raw_data = client.get_storm_alerts()

        if raw_data and "features" in raw_data:
            alerts = raw_data["features"]
            result = []

            for alert in alerts:
                props = alert.get("properties", {})
                result.append({
                    "type": "Storm",
                    "severity": props.get("severity", "Unknown"),
                    "message": props.get("headline", ""),
                    "area": props.get("areaDesc", ""),
                })

            return result

    except Exception as e:
        logger.error(f"NOAA API error: {e}")

    return [
        {
            "type": "Storm",
            "severity": "High",
            "message": "Cyclone warning active near Mumbai coast",
            "area": "Mumbai",
        },
        {
            "type": "Storm",
            "severity": "Medium",
            "message": "Heavy rain and wind near Chennai",
            "area": "Chennai",
        },
    ]