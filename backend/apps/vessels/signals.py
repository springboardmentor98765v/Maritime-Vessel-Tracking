# signals.py — auto-create Notification for subscribed users when a VesselEvent is created
from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender='vessels.VesselEvent')
def notify_vessel_subscribers(sender, instance, created, **kwargs):
    if not created:
        return

    from apps.vessels.models import VesselSubscription
    from apps.notifications.models import Notification

    subscriptions = VesselSubscription.objects.filter(
        vessel=instance.vessel
    ).select_related('user')

    notifications = [
        Notification(
            user=sub.user,
            vessel=instance.vessel,
            event=instance,
            type=instance.event_type,
            message=(
                f"New {instance.event_type} event for {instance.vessel.name}"
                + (f" at {instance.location}" if instance.location else "")
                + "."
            ),
        )
        for sub in subscriptions
    ]
    if notifications:
        Notification.objects.bulk_create(notifications)
