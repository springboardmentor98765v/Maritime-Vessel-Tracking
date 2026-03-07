from vessels.models import Vessel, VesselEvent


def detect_events(vessel):

    if vessel.speed == 0:

        VesselEvent.objects.create(
            vessel=vessel,
            event_type="STOPPED",
            description="Vessel stopped moving"
        )