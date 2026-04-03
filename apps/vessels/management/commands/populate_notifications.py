from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.vessels.models import Vessel
from apps.notifications.models import Notification, Event
from django.utils import timezone

class Command(BaseCommand):
    help = 'Populates the database with detailed demo notifications for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write("Populating demo notifications...")
        
        # 1. Get or Create Demo User
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            user, created = User.objects.get_or_create(username='admin_demo', defaults={'is_staff': True, 'is_superuser': True})
            if created:
                user.set_password('admin123')
                user.save()
                self.stdout.write(f"Created demo user: {user.username}")

        # 2. Get or Create Demo Vessels
        vessel1, _ = Vessel.objects.get_or_create(
            imo_number="1111111",
            defaults={"name": "STORM_CHASER", "vessel_type": "Research", "last_position_lat": 25.0, "last_position_lon": 60.0, "speed": 18.5}
        )
        vessel2, _ = Vessel.objects.get_or_create(
            imo_number="2222222",
            defaults={"name": "CARGO_MASTER", "vessel_type": "Cargo", "last_position_lat": 1.27, "last_position_lon": 103.85, "speed": 0.2}
        )

        demo_data = [
            {
                "vessel": vessel1,
                "type": "MOVED",
                "details": f"{vessel1.name} has start at Lat: {vessel1.last_position_lat}, Lon: {vessel1.last_position_lon}, Speed: {vessel1.speed} knots.",
                "notif_type": "alert"
            },
            {
                "vessel": vessel2,
                "type": "STOPPED",
                "details": f"{vessel2.name} has stop moving at Lat: {vessel2.last_position_lat}, Lon: {vessel2.last_position_lon}, Speed: {vessel2.speed} knots.",
                "notif_type": "alert"
            },
            {
                "vessel": vessel2,
                "type": "PORT_ENTERED",
                "details": f"{vessel2.name} has reached portal Singapore at Lat: {vessel2.last_position_lat}, Lon: {vessel2.last_position_lon}.",
                "notif_type": "alert"
            },
            {
                "vessel": vessel1,
                "type": "SUBSCRIBED",
                "details": f"User {user.username} subscribed to Vessel {vessel1.name} (IMO: {vessel1.imo_number})",
                "notif_type": "info"
            }
        ]

        for item in demo_data:
            event = Event.objects.create(
                vessel=item["vessel"],
                event_type=item["type"],
                latitude=item["vessel"].last_position_lat,
                longitude=item["vessel"].last_position_lon,
                details=item["details"]
            )
            Notification.objects.create(
                user=user,
                vessel=item["vessel"],
                tracking_event=event,
                message=item["details"],
                type=item["notif_type"]
            )

        self.stdout.write(self.style.SUCCESS(f"Successfully populated {len(demo_data)} demo notifications for user {user.username}."))
