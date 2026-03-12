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

import math

def haversine(lat1, lon1, lat2, lon2):
    """Calculate the great circle distance in nautical miles between two points"""
    R = 3440.065 # Radius of earth in nautical miles
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat/2) * math.sin(dLat/2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon/2) * math.sin(dLon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

@receiver(post_save, sender='vessels.SafetyEvent')
def notify_vessels_in_safety_zone(sender, instance, created, **kwargs):
    """
    When a new Safety Event (storm, piracy) is detected, find all vessels 
    currently inside its radius and alert their subscribers.
    """
    if not created or not instance.is_active:
        return

    from apps.vessels.models import Vessel, VesselSubscription
    from apps.notifications.models import Notification

    # Find all vessels with known recent positions
    vessels = Vessel.objects.exclude(last_position_lat__isnull=True)
    
    notifications = []
    
    for vessel in vessels:
        distance = haversine(
            instance.latitude, instance.longitude,
            vessel.last_position_lat, vessel.last_position_lon
        )
        
        # If vessel is inside the hazard radius
        if distance <= instance.radius_nm:
            subscriptions = VesselSubscription.objects.filter(vessel=vessel).select_related('user')
            for sub in subscriptions:
                notifications.append(
                    Notification(
                        user=sub.user,
                        vessel=vessel,
                        event=None,
                        type=f"Safety: {instance.event_type}",
                        message=f"WARNING: {vessel.name} is currently {round(distance, 1)} nm from a new {instance.severity.upper()} {instance.event_type} event: {instance.title}."
                    )
                )
                
    if notifications:
        Notification.objects.bulk_create(notifications)
