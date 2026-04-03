import logging
from django.utils import timezone
from datetime import timedelta

from apps.vessels.models import Vessel
from apps.safety.models import SafetyZone, Safety
from apps.notifications.models import Subscription, Notification
from utils.geo import haversine

logger = logging.getLogger(__name__)


def detect_vessel_safety_risks(vessel: Vessel, create_notifications: bool = False) -> list:
    """
    Detect if a vessel is inside any safety zone from database.
    If create_notifications=True, create Safety event + notifications for subscribed users.
    """
    risks = []

    if vessel.last_position_lat is None or vessel.last_position_lon is None:
        return risks

    zones = SafetyZone.objects.all()

    for zone in zones:
        try:
            dist = haversine(
                vessel.last_position_lat,
                vessel.last_position_lon,
                zone.latitude,
                zone.longitude
            )

            if dist <= float(zone.radius):
                zone_type = (zone.zone_type or "").lower()

                if "storm" in zone_type:
                    risk_type = "STORM_ALERT"
                elif "cyclone" in zone_type:
                    risk_type = "CYCLONE_ALERT"
                elif "piracy" in zone_type:
                    risk_type = "PIRACY_ZONE_ALERT"
                else:
                    risk_type = "SAFETY_ALERT"

                risk_data = {
                    "vessel": vessel.name,
                    "imo_number": vessel.imo_number,
                    "risk": risk_type,
                    "zone_type": zone.zone_type,
                    "severity": zone.severity,
                    "message": f"Vessel {vessel.name} is inside {zone.zone_type} zone",
                    "zone_id": zone.id,
                    "distance_km": round(dist, 2),
                    "radius_km": zone.radius
                }

                risks.append(risk_data)

                # ✅ STEP 5: create safety event + notifications
                if create_notifications:
                    recent_safety = Safety.objects.filter(
                        vessel=vessel,
                        event_type=risk_type,
                        timestamp__gte=timezone.now() - timedelta(seconds=5)
                    ).first()

                    if not recent_safety:
                        safety_event = Safety.objects.create(
                            vessel=vessel,
                            event_type=risk_type,
                            severity=zone.severity,
                            latitude=zone.latitude,
                            longitude=zone.longitude,
                            location=f"{zone.zone_type} zone",
                            details=f"Vessel {vessel.name} entered {zone.zone_type} zone"
                        )

                        subscriptions = Subscription.objects.filter(vessel=vessel)

                        for sub in subscriptions:
                            Notification.objects.create(
                                user=sub.user,
                                vessel=vessel,
                                safety_event=safety_event,
                                message=f"{zone.zone_type} Alert: Vessel {vessel.name} entered risk zone",
                                type="alert",
                                is_read=False
                            )

        except Exception as e:
            logger.error(f"Error checking safety risk for vessel {vessel.id} and zone {zone.id}: {e}")

    return risks