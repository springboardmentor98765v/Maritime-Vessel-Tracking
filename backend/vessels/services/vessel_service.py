from vessels.models import Vessel


def get_all_vessels():

    vessels = Vessel.objects.all()

    data = []

    for v in vessels:
        data.append({
            "name": v.vessel_name,
            "latitude": v.latitude,
            "longitude": v.longitude,
            "speed": v.speed
        })

    return data