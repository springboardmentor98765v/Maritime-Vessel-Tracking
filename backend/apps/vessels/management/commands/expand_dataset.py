from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone

import random
from faker import Faker
from datetime import timedelta

from apps.vessels.models import Vessel, VesselRoute, VesselAlert
from apps.voyages.models import Voyage, VoyageHistory
from apps.notifications.models import Notification, Subscription
from apps.ports.models import Port

fake = Faker()


class Command(BaseCommand):

    def handle(self, *args, **kwargs):

        USERS_TARGET = 1000
        VESSELS_TARGET = 3000
        NOTIFICATIONS_TARGET = 10000

        ports = list(Port.objects.all())
        vessels = list(Vessel.objects.all())
        users = list(User.objects.all())

        print("Current vessels:", len(vessels))
        print("Current users:", len(users))

        # --------------------------------------------------
        # USERS (FAST BULK CREATE)
        # --------------------------------------------------

        new_users = []

        FAST_PASSWORD = "pbkdf2_sha256$260000$test$3J9H2R8t7YQz6rjC4hQqS2vYp6Lw8nY5s8YgXzTqk0U="

        for i in range(len(users), USERS_TARGET):

            username = f"user{i}"

            new_users.append(
                User(
                    username=username,
                    email=f"{username}@mail.com",
                    password=FAST_PASSWORD
                )
            )

        User.objects.bulk_create(new_users, batch_size=1000)

        users = list(User.objects.all())

        print("Users created:", len(new_users))

        # --------------------------------------------------
        # VESSELS (FAST BULK CREATE)
        # --------------------------------------------------

        new_vessels = []

        vessel_types = ["Cargo", "Container", "Tanker", "Passenger", "Bulk Carrier"]
        flags = ["Liberia", "Panama", "Marshall Islands"]
        cargo_types = ["Coal", "Oil", "Grain", "Containers", "Mixed Cargo"]
        operators = ["Maersk", "COSCO", "CMA CGM", "Hapag-Lloyd"]

        for i in range(len(vessels), VESSELS_TARGET):

            new_vessels.append(

                Vessel(
                    name=f"Vessel-{i}",
                    imo_number=str(9000000 + i),
                    mmsi=str(800000000 + i),

                    vessel_type=random.choice(vessel_types),
                    flag=random.choice(flags),

                    status="in_transit",
                    destination=random.choice(["Dubai", "Singapore", "Shanghai", "Chennai"]),

                    cargo_type=random.choice(cargo_types),
                    operator=random.choice(operators),

                    last_position_lat=random.uniform(-70, 70),
                    last_position_lon=random.uniform(-180, 180),

                    speed=random.uniform(5, 30),
                    heading=random.uniform(0, 360),

                    last_update=timezone.now()
                )

            )

        Vessel.objects.bulk_create(new_vessels, batch_size=1000)

        vessels = list(Vessel.objects.all())

        print("Vessels created:", len(new_vessels))

        # --------------------------------------------------
        # ROUTES
        # --------------------------------------------------

        routes = []

        for vessel in vessels:

            origin = random.choice(ports)
            dest = random.choice(ports)

            routes.append(

                VesselRoute(
                    vessel=vessel,
                    origin_port=origin,
                    destination_port=dest,

                    departure_time=timezone.now() - timedelta(days=random.randint(1, 5)),
                    estimated_arrival=timezone.now() + timedelta(days=random.randint(2, 6))
                )

            )

        VesselRoute.objects.bulk_create(routes, batch_size=1000)

        print("Routes created:", len(routes))

        # --------------------------------------------------
        # ALERTS
        # --------------------------------------------------

        alerts = []

        alert_types = ["weather", "delay", "piracy", "safety", "route_change"]

        for vessel in vessels:

            if random.random() < 0.5:

                alerts.append(

                    VesselAlert(
                        vessel=vessel,
                        alert_type=random.choice(alert_types),
                        message=f"Alert for {vessel.name}"
                    )

                )

        VesselAlert.objects.bulk_create(alerts, batch_size=1000)

        print("Alerts created:", len(alerts))

        # --------------------------------------------------
        # VOYAGES
        # --------------------------------------------------

        voyages = []

        for _ in range(2000):

            vessel = random.choice(vessels)

            voyages.append(

                Voyage(
                    vessel=vessel,
                    port_from=random.choice(ports),
                    port_to=random.choice(ports),

                    departure_time=timezone.now() - timedelta(days=random.randint(5, 20)),
                    arrival_time=timezone.now(),

                    status=random.choice(["Completed", "In Progress"])
                )

            )

        Voyage.objects.bulk_create(voyages, batch_size=1000)

        voyages = list(Voyage.objects.all())

        print("Voyages created:", len(voyages))

        # --------------------------------------------------
        # VOYAGE HISTORY
        # --------------------------------------------------

        histories = []

        for voyage in voyages[:2000]:

            histories.append(

                VoyageHistory(
                    vessel=voyage.vessel,
                    port_from=voyage.port_from,
                    port_to=voyage.port_to,

                    departure_time=voyage.departure_time,
                    arrival_time=voyage.arrival_time,

                    distance_nm=random.randint(200, 2000)
                )

            )

        VoyageHistory.objects.bulk_create(histories, batch_size=1000)

        print("Voyage history created:", len(histories))

        # --------------------------------------------------
        # SUBSCRIPTIONS
        # --------------------------------------------------

        subs = []

        for user in users:

            subs.append(

                Subscription(
                    user=user,
                    vessel=random.choice(vessels)
                )

            )

        Subscription.objects.bulk_create(subs, batch_size=1000)

        print("Subscriptions created:", len(subs))

        # --------------------------------------------------
        # NOTIFICATIONS
        # --------------------------------------------------

      #  notifications = []

       # for _ in range(NOTIFICATIONS_TARGET):

        #    notifications.append(

         #       Notification(
          #          user=random.choice(users),
           #         vessel=random.choice(vessels),

            #        message=fake.sentence(),
             #       type="info",
              #      is_read=False
               # )

        #    )
        

        #Notification.objects.bulk_create(notifications, batch_size=2000)

        #print("Notifications created:", len(notifications))

        print("\nDATASET CREATED SUCCESSFULLY 🚀")