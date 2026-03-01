from vessels.models import VesselSubscription, Notification


def create_notifications(vessel, events):
    subscribers = VesselSubscription.objects.filter(vessel=vessel)

    for subscription in subscribers:
        for event in events:
            Notification.objects.create(
                user=subscription.user,
                vessel=vessel,
                message=f"{vessel.name}: {event.description}"
            )