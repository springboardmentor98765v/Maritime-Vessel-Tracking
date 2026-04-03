import math
import logging

logger = logging.getLogger(__name__)


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(dlon / 2) ** 2
    )
    distance = R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return distance


def detect_vessel_risks(vessel_name, vessel_lat, vessel_lon):
    from apps.safety.models import SafetyZone, SafetyAlert

    alerts = []

    try:
        zones = SafetyZone.objects.all()

        for zone in zones:
            distance = calculate_distance(
                vessel_lat,
                vessel_lon,
                zone.latitude,
                zone.longitude,
            )

            if distance <= zone.radius:
                alert_data = {
                    "vessel": vessel_name,
                    "risk": zone.zone_type,
                    "severity": zone.severity,
                    "message": (
                        f"{vessel_name} is inside "
                        f"{zone.zone_type} zone. "
                        f"{zone.message}"
                    ),
                }
                alerts.append(alert_data)

                SafetyAlert.objects.get_or_create(
                    vessel_name=vessel_name,
                    zone=zone,
                    defaults={
                        "alert_type": zone.zone_type,
                        "severity": zone.severity,
                        "message": alert_data["message"],
                    }
                )

    except Exception as e:
        logger.error(f"Safety detection error: {e}")

    return alerts