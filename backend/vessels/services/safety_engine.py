from vessels.models import Vessel, SafetyZone
from math import radians, cos, sin, asin, sqrt


def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))

    return R * c


def detect_zone_violations():
    alerts = []

    vessels = Vessel.objects.all()
    zones = SafetyZone.objects.all()

    for vessel in vessels:
        for zone in zones:

            distance = calculate_distance(
                vessel.latitude,
                vessel.longitude,
                zone.latitude,
                zone.longitude
            )

            if distance <= zone.radius_km:
                alerts.append({
                    "vessel": vessel.vessel_name,
                    "zone": zone.name,
                    "distance": round(distance, 2)
                })

    return alerts