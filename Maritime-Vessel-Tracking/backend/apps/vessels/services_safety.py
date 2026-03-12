import math
import random
from django.utils import timezone
from apps.vessels.models import Vessel, VesselEvent, SafetyEvent, VesselSubscription
from apps.notifications.models import Notification

def poll_noaa_safety_events():
    """
    Simulates polling NOAA Ocean Data to dynamically spawn new weather/piracy
    zones on the map and calculate proximity to active vessels.
    """
    print("Fetching active NOAA Safety and Piracy Risks...")

    # For demo purposes, we will randomly spawn/move a hurricane or piracy zone
    types = ['weather', 'piracy']
    severities = ['high', 'critical']
    now = timezone.now()

    # Drop old simulated events to keep the map fresh
    SafetyEvent.objects.filter(timestamp__lt=now - timezone.timedelta(days=1)).delete()

    # Spawn 1-2 new active risks globally
    for _ in range(random.randint(1, 2)):
        lat = random.uniform(-45.0, 45.0)
        lon = random.uniform(-180.0, 180.0)
        radius = random.uniform(50.0, 300.0) # nautical miles
        etype = random.choice(types)

        desc = ""
        if etype == 'weather':
            desc = "NOAA Severe Thunderstorm Warning" if radius < 150 else "NOAA Category 3 Hurricane"
        else:
            desc = "HRA (High Risk Area) Piracy Zone Expansion"

        new_risk = SafetyEvent.objects.create(
            event_type=etype,
            severity=random.choice(severities),
            latitude=lat,
            longitude=lon,
            radius_nm=radius,
            description=desc,
            timestamp=now
        )
        
        # Determine if any vessel is currently sailing inside this new danger zone
        evaluate_vessel_proximity(new_risk)

def evaluate_vessel_proximity(safety_event):
    """
    Calculates the Haversine distance between every active Vessel and a given
    SafetyEvent (Storm/Piracy). If the vessel is within the radius_nm,
    we trigger a 'weather' or 'piracy' emergency notification.
    """
    now = timezone.now()
    vessels = Vessel.objects.exclude(last_position_lat__isnull=True, last_position_lon__isnull=True)

    for vessel in vessels:
        dist_nm = haversine_distance(
            vessel.last_position_lat, vessel.last_position_lon,
            safety_event.latitude, safety_event.longitude
        )

        if dist_nm <= safety_event.radius_nm:
            
            # Anti-spam: check if we already warned this vessel in the last 4 hours
            recent_alert = VesselEvent.objects.filter(
                vessel=vessel, 
                event_type=safety_event.event_type,
                timestamp__gte=now - timezone.timedelta(hours=4)
            ).exists()

            if recent_alert:
                continue

            # 1. Spawn a VesselEvent logging that the ship is inside a danger zone
            alert_msg = f"DANGER: Vessel has entered a {safety_event.severity.upper()} {safety_event.event_type} zone: {safety_event.description}."
            event = VesselEvent.objects.create(
                vessel=vessel,
                event_type=safety_event.event_type,
                latitude=vessel.last_position_lat,
                longitude=vessel.last_position_lon,
                timestamp=now,
                details=alert_msg
            )

            # 2. Dispatch Notifications to Subscribers
            subs = VesselSubscription.objects.filter(vessel=vessel).select_related('user')
            for sub in subs:
                Notification.objects.create(
                    user=sub.user,
                    vessel=vessel,
                    event=event,
                    type=safety_event.event_type,
                    message=alert_msg,
                    timestamp=now
                )

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth surface.
    Returns distance in nautical miles (NM).
    """
    R = 3440.065 # Earth radius in NM
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi/2.0)**2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda/2.0)**2
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c
