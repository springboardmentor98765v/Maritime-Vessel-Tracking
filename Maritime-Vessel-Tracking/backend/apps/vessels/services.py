import requests
import logging
from django.utils import timezone
from django.conf import settings
from .models import Vessel, VesselEvent, VesselSubscription
from apps.notifications.models import Notification

logger = logging.getLogger(__name__)

# Removed mock data generator as the platform transitions to live AIS Hub APIs.

def fetch_and_update_vessels():
    """
    Calls external AIS Hub API for vessel locational data using configured API keys.
    Updates the database models and triggers events/notifications.
    """
    try:
        from integrations.aishub import sync_vessel_positions
        
        # 1. Sync live positions directly to Vessel models using AISHub
        positions = sync_vessel_positions()
        
        if not positions:
            logger.info("No live vessel position updates received (API key missing or no active vessels).")
            return
            
        # 2. Process detected changes via our Event Engine
        for ship_position in positions:
            # Reformat dict to match Event Engine expectations
            mapped_data = {
                "imo": ship_position.get("mmsi"), # We mapped IMO > MMSI inside aishub.py
                "name": ship_position.get("name"),
                "lat": ship_position.get("lat"),
                "lon": ship_position.get("lon"),
                "speed": ship_position.get("speed"),
                "heading": ship_position.get("heading"),
                "destination": None # AISHub free tier doesn't always provide destination, so we skip route change logic for now
            }
            process_vessel_update(mapped_data)

    except Exception as e:
        logger.error(f"Failed to fetch external API data: {e}")

def process_vessel_update(ship_data):
    """
    Handles the core logic of updating a vessel, detecting changes (speed/route),
    creating events, and dispatching notifications to subscribed users.
    """
    now = timezone.now()
    imo = ship_data.get("imo")

    if not imo:
        logger.warning("Received ship data without IMO number. Skipping.")
        return

    # 1. Fetch current state to compare against (if exists)
    try:
        vessel = Vessel.objects.get(imo_number=imo)
        previous_lat = vessel.last_position_lat
        previous_lon = vessel.last_position_lon
        previous_speed = vessel.speed
        previous_destination = vessel.destination
        is_new = False
    except Vessel.DoesNotExist:
        vessel = Vessel(imo_number=imo)
        previous_lat = None
        previous_lon = None
        previous_speed = None
        previous_destination = None
        is_new = True

    # 2. Update model values safely
    vessel.name = ship_data.get("name", vessel.name)
    vessel.vessel_type = ship_data.get("type", vessel.vessel_type)
    vessel.flag = ship_data.get("flag", vessel.flag)
    vessel.cargo_type = ship_data.get("cargo", vessel.cargo_type)
    
    # 3. Handle location and movement
    new_lat = ship_data.get("lat")
    new_lon = ship_data.get("lon")
    new_speed = ship_data.get("speed")
    new_heading = ship_data.get("heading")
    new_destination = ship_data.get("destination")

    vessel.last_position_lat = new_lat
    vessel.last_position_lon = new_lon
    vessel.speed = new_speed
    vessel.heading = new_heading
    vessel.destination = new_destination
    vessel.last_update = now
    vessel.save()

    if is_new:
        logger.info(f"Registered new vessel: {vessel.name}")
        return  # No state change events to compute on first creation

    # 4. Event Detection Engine
    detected_events = []

    # Detect Speed Changes
    if previous_speed is not None and new_speed is not None:
        if previous_speed > 0 and new_speed == 0:
            detected_events.append({
                "type": "Stopped",
                "details": f"{vessel.name} has stopped moving."
            })
        elif previous_speed == 0 and new_speed > 0:
            detected_events.append({
                "type": "Underway",
                "details": f"{vessel.name} is now moving at {new_speed} knots."
            })

    # Detect Destination Changes
    if previous_destination and new_destination and previous_destination != new_destination:
        detected_events.append({
            "type": "Route Changed",
            "details": f"Destination changed from {previous_destination} to {new_destination}."
        })

    # 5. Process Notifications for Subscribers
    for evt in detected_events:
        event_record = VesselEvent.objects.create(
            vessel=vessel,
            event_type=evt["type"],
            latitude=new_lat,
            longitude=new_lon,
            timestamp=now,
            details=evt["details"]
        )
        
        subscriptions = VesselSubscription.objects.filter(vessel=vessel).select_related('user')
        
        # Dispatch notification to each subscribed user
        for sub in subscriptions:
            Notification.objects.create(
                user=sub.user,
                vessel=vessel,
                event=event_record,
                type=event_record.event_type,
                message=event_record.details,
                timestamp=now
            )
        
        if subscriptions.exists():
            logger.info(f"Generated {subscriptions.count()} notifications for event: {evt['type']} on {vessel.name}")
