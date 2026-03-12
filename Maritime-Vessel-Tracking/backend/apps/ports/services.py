import random
from django.utils import timezone
from .models import Port
from apps.vessels.models import Vessel, VesselEvent, VesselSubscription
from apps.notifications.models import Notification

def poll_unctad_port_stats():
    """
    Simulates fetching real-time Analytics from UNCTAD port stats APIs.
    We shuffle port congestion, wait times, and traffic metrics.
    If a port hits 'Critical' (>=80), we find ships headed there and alert them.
    """
    ports = Port.objects.all()
    if not ports.exists():
        return

    now = timezone.now()

    for port in ports:
        # Simulate traffic and congestion changing 
        port.arrivals += random.randint(0, 5)
        port.departures += random.randint(0, 4)
        
        # Fluctuate congestion score between 10 (low) and 95 (critical)
        variance = random.uniform(-15, 15)
        new_score = max(10, min(95, port.congestion_score + variance))
        port.congestion_score = round(new_score, 1)

        # Wait time directly correlates to congestion score
        port.avg_wait_time = round((port.congestion_score / 100) * 48.0, 1) # up to 48 hours
        port.last_update = now
        port.save()

        # CONGESTION ALERT LOGIC
        if port.congestion_score >= 80.0:
            trigger_port_delay_alerts(port, now)


def trigger_port_delay_alerts(port, timestamp):
    """
    Finds all vessels whose destination matches this Port's name,
    generates a 'Port Delay' Event, and instantly notifies subscribed users.
    """
    # Find active vessels headed to this congested port
    affected_vessels = Vessel.objects.filter(destination__icontains=port.name)

    for vessel in affected_vessels:
        # Prevent spamming the same event within an hour
        recent_alert = VesselEvent.objects.filter(
            vessel=vessel, 
            event_type='port_delay',
            timestamp__gte=timestamp - timezone.timedelta(hours=1)
        ).exists()

        if recent_alert:
            continue

        details = f"CRITICAL CONGESTION: {port.name} is experiencing severe delays. Estimated wait time is now {port.avg_wait_time} hours."
        
        # 1. Create the Vessel Event
        event = VesselEvent.objects.create(
            vessel=vessel,
            event_type='port_delay',
            latitude=vessel.last_position_lat,
            longitude=vessel.last_position_lon,
            timestamp=timestamp,
            details=details
        )

        # 2. Dispatch Notifications to Subscribers
        subs = VesselSubscription.objects.filter(vessel=vessel).select_related('user')
        for sub in subs:
            Notification.objects.create(
                user=sub.user,
                vessel=vessel,
                event=event,
                type='port_delay',
                message=details,
                timestamp=timestamp
            )
