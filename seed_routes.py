from datetime import timedelta
from django.utils import timezone

from apps.vessels.models import Vessel, VesselRoute
from apps.ports.models import Port

print("Creating vessel routes...")

vessels = list(Vessel.objects.all())
ports = list(Port.objects.all())

created = 0

for i, vessel in enumerate(vessels):
    if VesselRoute.objects.filter(vessel=vessel).exists():
        continue

    origin = ports[i % len(ports)]
    destination = ports[(i + 1) % len(ports)]

    if origin == destination:
        destination = ports[(i + 2) % len(ports)]

    departure = timezone.now() - timedelta(days=(i % 10))
    arrival = departure + timedelta(days=((i % 5) + 2))

    VesselRoute.objects.create(
        vessel=vessel,
        origin_port=origin,
        destination_port=destination,
        departure_time=departure,
        estimated_arrival=arrival,
    )

    created += 1

print("Routes created:", created)
print("Done.")