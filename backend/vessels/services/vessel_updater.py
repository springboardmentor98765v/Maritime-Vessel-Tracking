import random

from ..models import Vessel
from .event_engine import detect_events
from .safety_detection_service import detect_safety_violations


def update_vessels():

    vessels = Vessel.objects.all()

    # First run → create demo vessels
    if not vessels.exists():

        for i in range(5):
            Vessel.objects.create(
                imo_number=f"IMO100{i}",
                name=f"Demo Vessel {i}",
                latitude=20 + i,
                longitude=70 + i,
                speed=random.randint(0, 20),
                course=random.randint(0, 360),
                vessel_type="Cargo"
            )

        return

    # Update vessel positions
    for vessel in vessels:

        vessel.latitude += random.uniform(-0.1, 0.1)
        vessel.longitude += random.uniform(-0.1, 0.1)
        vessel.speed = random.randint(0, 20)

        vessel.save()

        # Detect events
        detect_events(vessel)

        # Detect safety violations
        detect_safety_violations(vessel)