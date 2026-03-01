from vessels.models import VesselEvent, Notification, VesselSubscription


def detect_events(vessel):
    if vessel.speed == 0:
        event = VesselEvent.objects.create(
            vessel=vessel,
            event_type="STOPPED",
            description=f"{vessel.name} has stopped."
        )

        subscribers = VesselSubscription.objects.filter(vessel=vessel)

        for sub in subscribers:
            Notification.objects.create(
                user=sub.user,
                vessel=vessel,
                message=f"Alert: {vessel.name} has stopped."
            )