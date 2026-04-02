from vessels.models import VesselEvent, Subscription, Notification

def detect_events(vessel):

    if vessel.speed > 30:
        VesselEvent.objects.create(
            vessel=vessel,
            event_type="High Speed"
        )

    if vessel.speed == 0:
        event = VesselEvent.objects.create(
            vessel=vessel,
            event_type="Stopped",
            latitude=vessel.latitude,
            longitude=vessel.longitude
        )

        subscriptions = Subscription.objects.filter(vessel=vessel)
        for sub in subscriptions:
            Notification.objects.create(
                user=sub.user,
                vessel=vessel,
                event=event,
                message=f"{vessel.vessel_name} has stopped moving."
            )