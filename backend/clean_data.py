import os
import django
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.vessels.models import Vessel, VesselEvent, VesselPosition
from apps.voyages.models import Voyage
from apps.ports.models import Port

def run_cleanup():
    print("🧹 Cleaning and standardizing data...")

    # 1. Vessels: set lat/lon to 0.0 if missing, set last_update if missing
    bad_vessels = Vessel.objects.filter(last_position_lat__isnull=True)
    bad_vessels.update(last_position_lat=0.0)

    bad_vessels_lon = Vessel.objects.filter(last_position_lon__isnull=True)
    bad_vessels_lon.update(last_position_lon=0.0)

    bad_vessels_time = Vessel.objects.filter(last_update__isnull=True)
    bad_vessels_time.update(last_update=timezone.now())

    print("✔ Cleaned Vessels")

    # 2. Add current vessel positions to VesselPosition if not already there
    for v in Vessel.objects.exclude(last_update__isnull=True):
        if v.last_position_lat is not None and v.last_position_lon is not None:
            VesselPosition.objects.get_or_create(
                vessel=v,
                timestamp=v.last_update,
                defaults={
                    'latitude': v.last_position_lat,
                    'longitude': v.last_position_lon
                }
            )
    print("✔ Populated initial VesselPositions")

    # 3. VesselEvents: clean coordinates
    bad_events_lat = VesselEvent.objects.filter(latitude__isnull=True)
    bad_events_lat.update(latitude=0.0)

    bad_events_lon = VesselEvent.objects.filter(longitude__isnull=True)
    bad_events_lon.update(longitude=0.0)
    print("✔ Cleaned VesselEvents")

    # 4. Ports: clean data if any nulls (congestion_score, avg_wait_time, etc)
    # The models use FloatField (no null=True by default) so it shouldn't be null, but just in case
    # No changes needed for standard ports based on model definition.

if __name__ == "__main__":
    run_cleanup()
