from datetime import timedelta
from django.utils import timezone

from apps.vessels.models import Vessel, VesselRoute, VesselAlert
from apps.ports.models import Port

print("Seeding vessel routes and alerts...")

vessels = list(Vessel.objects.all())
ports = list(Port.objects.all())

created_routes = 0
created_alerts = 0

for i, vessel in enumerate(vessels):

    origin = ports[i % len(ports)]
    destination = ports[(i + 1) % len(ports)]

    if origin == destination:
        destination = ports[(i + 2) % len(ports)]

    departure = timezone.now() - timedelta(days=i % 10)
    arrival = departure + timedelta(days=(i % 5) + 2)

    if not VesselRoute.objects.filter(vessel=vessel).exists():
        VesselRoute.objects.create(
            vessel=vessel,
            origin_port=origin,
            destination_port=destination,
            departure_time=departure,
            estimated_arrival=arrival,
        )
        created_routes += 1


# ALERTS
alert_types = ["weather", "piracy", "delay", "safety", "route_change"]

for i, vessel in enumerate(vessels[:200]):

    # prevent duplicate alerts
    if VesselAlert.objects.filter(vessel=vessel).exists():
        continue

    VesselAlert.objects.create(
        vessel=vessel,
        alert_type=alert_types[i % len(alert_types)],
        message=f"Alert for {vessel.name}"
    )

    created_alerts += 1


print("Routes created:", created_routes)
print("Alerts created:", created_alerts)
print("Done.")