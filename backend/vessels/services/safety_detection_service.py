from math import radians, cos, sin, asin, sqrt
from ..models import SafetyZone, Notification


def calculate_distance(lat1, lon1, lat2, lon2):

    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))

    r = 6371  # Earth radius km
    return c * r


def detect_safety_violations(vessel):

    zones = SafetyZone.objects.all()

    for zone in zones:

        distance = calculate_distance(
            vessel.latitude,
            vessel.longitude,
            zone.latitude,
            zone.longitude
        )

        if distance <= zone.radius_km:

            Notification.objects.create(
                message=f"{vessel.vessel_name} entered danger zone: {zone.name}"
            )

            return "DANGER"

    return "SAFE"