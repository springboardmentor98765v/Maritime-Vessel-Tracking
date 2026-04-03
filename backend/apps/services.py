from django.utils import timezone
from .models import Vessel, Event, Position
from apps.notifications.models import Notification, AlertSubscription

class VesselService:
    @staticmethod
    def process_position_update(vessel, new_lat, new_lon, new_speed, new_course):
        # Determine if we should trigger an event
        previous_speed = vessel.speed
        
        # Create position record
        Position.objects.create(
            vessel=vessel,
            latitude=new_lat,
            longitude=new_lon,
            speed=new_speed,
            course=new_course,
            timestamp=timezone.now()
        )

        # Update vessel metadata
        vessel.last_position_lat = new_lat
        vessel.last_position_lon = new_lon
        vessel.speed = new_speed if new_speed is not None else vessel.speed
        vessel.heading = new_course if new_course is not None else vessel.heading
        vessel.save()

        # Simple Event Detection: Stopped
        if previous_speed is not None and previous_speed > 0 and new_speed == 0:
            event = Event.objects.create(
                vessel=vessel,
                event_type="Stopped",
                latitude=new_lat,
                longitude=new_lon,
                details="Vessel has stopped moving."
            )
            VesselService.notify_subscribers(vessel, event, "Vessel has stopped moving.")

    @staticmethod
    def notify_subscribers(vessel, event, message):
        subscriptions = AlertSubscription.objects.filter(vessel=vessel)
        notifications = []
        for sub in subscriptions:
            notifications.append(
                Notification(
                    user=sub.user,
                    vessel=vessel,
                    event_id=event.id if event else None,
                    message=message
                )
            )
        if notifications:
            Notification.objects.bulk_create(notifications)
