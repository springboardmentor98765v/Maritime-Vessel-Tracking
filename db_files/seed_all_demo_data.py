from datetime import timedelta
from django.utils import timezone
import random
from apps.vessels.models import Vessel, VesselRoute, VesselAlert, VesselPosition
from apps.ports.models import Port
from apps.voyages.models import Voyage, VoyageHistory

print("Seeding all demo data...")

vessels = list(Vessel.objects.all().order_by("id"))
ports = list(Port.objects.all().order_by("id"))
voyages = list(Voyage.objects.select_related("vessel", "port_from", "port_to").order_by("id"))

created_routes = 0
created_positions = 0
created_alerts = 0
created_histories = 0

# 1) VesselRoute for all vessels
for i, vessel in enumerate(vessels):
    if not VesselRoute.objects.filter(vessel=vessel).exists():
        origin = ports[i % len(ports)]
        destination = ports[(i + 1) % len(ports)]

        if origin == destination:
            destination = ports[(i + 2) % len(ports)]

        departure = timezone.now() - timedelta(days=i % 10)
        arrival = departure + timedelta(days=(i % 5) + 2)

        VesselRoute.objects.create(
            vessel=vessel,
            origin_port=origin,
            destination_port=destination,
            departure_time=departure,
            estimated_arrival=arrival,
        )
        created_routes += 1

# 2) VesselPosition -> 5 positions per vessel
for i, vessel in enumerate(vessels):
    existing_count = VesselPosition.objects.filter(vessel=vessel).count()

    if existing_count >= 5:
        continue

    if vessel.last_position_lat is None or vessel.last_position_lon is None:
        continue

    base_lat = float(vessel.last_position_lat)
    base_lon = float(vessel.last_position_lon)
    base_time = timezone.now() - timedelta(hours=1)

    needed = 5 - existing_count

    for j in range(needed, 0, -1):
        lat = max(-89.9, min(89.9, base_lat - (0.2 * j)))
        lon = max(-179.9, min(179.9, base_lon - (0.3 * j)))
        ts = base_time + timedelta(minutes=(10 * (5 - j)))

        VesselPosition.objects.create(
            vessel=vessel,
            latitude=lat,
            longitude=lon,
            speed=float(vessel.speed or 0),
            heading=float(vessel.heading or 0),
            timestamp=ts,
        )
        created_positions += 1

# 3) VesselAlert for first 300 vessels
alert_types = ["weather", "piracy", "delay", "safety", "route_change"]

for i, vessel in enumerate(vessels[:300]):
    if VesselAlert.objects.filter(vessel=vessel).exists():
        continue

    VesselAlert.objects.create(
        vessel=vessel,
        alert_type=alert_types[i % len(alert_types)],
        message=f"Demo {alert_types[i % len(alert_types)]} alert for {vessel.name}"
    )
    created_alerts += 1

# 4) VoyageHistory -> up to 1500 rows
# 6) Force some voyages to be delayed

import random

delayed_count = 0

for voyage in voyages[:200]:   # delay first 200 voyages

    delay_days = random.randint(3, 10)

    # estimated arrival (normal)
    voyage.estimated_arrival = voyage.departure_time + timedelta(days=2)

    # actual arrival (delayed)
    voyage.arrival_time = voyage.departure_time + timedelta(days=2 + delay_days)

    voyage.status = "Delayed"
    voyage.save()

    delayed_count += 1

print("Delayed voyages updated:", delayed_count)

print("Routes created:", created_routes)
print("Positions created:", created_positions)
print("Alerts created:", created_alerts)
print("VoyageHistory created:", created_histories)


# Notifications
from apps.notifications.models import Notification
from django.contrib.auth.models import User
import random

users = list(User.objects.all())
notifications_created = 0

ports_list = [
    "Singapore",
    "Rotterdam",
    "Shanghai",
    "Dubai",
    "Los Angeles",
    "Mumbai",
    "Chennai"
]

storms = [
    "Cyclone",
    "Tropical Storm",
    "Heavy Rain",
    "High Waves"
]

for i in range(10000):

    vessel = random.choice(vessels)
    user = random.choice(users)

    event_type = random.choice(["PORT", "STORM"])

    if event_type == "PORT":
        port = random.choice(ports_list)
        message = f" Vessel {vessel.name} entered Port {port}"
    else:
        storm = random.choice(storms)
        message = f" {storm} detected near vessel {vessel.name}"

    Notification.objects.create(
        user=user,
        vessel=vessel,
        message=message,
        type="warning"
    )

    notifications_created += 1


print("Notifications created:", notifications_created)

# 6) Force some voyages to be delayed

import random

delayed_count = 0

for voyage in voyages[:200]:   # delay first 200 voyages

    delay_days = random.randint(2, 10)

    new_arrival = voyage.departure_time + timedelta(days=delay_days)

    voyage.arrival_time = new_arrival
    voyage.status = "Delayed"
    voyage.save()

    delayed_count += 1

print("Delayed voyages updated:", delayed_count)


print("Done.")
