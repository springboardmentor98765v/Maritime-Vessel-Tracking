import os
import django
import random
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.vessels.models import Vessel, VesselPosition, VesselEvent

def fix_zeros():
    print("Fixing zero coordinates...")
    zero_vessels = Vessel.objects.filter(last_position_lat=0.0, last_position_lon=0.0)
    count = zero_vessels.count()
    print(f"Found {count} vessels at Null Island (0.0, 0.0).")

    for v in zero_vessels:
        # Give them some realistic ocean coordinates
        v.last_position_lat = random.uniform(-40.0, 40.0)
        v.last_position_lon = random.uniform(-100.0, 100.0)
        v.save(update_fields=['last_position_lat', 'last_position_lon'])

        # Create or update a VesselPosition to match
        pos = VesselPosition.objects.filter(vessel=v, latitude=0.0, longitude=0.0).first()
        if pos:
            pos.latitude = v.last_position_lat
            pos.longitude = v.last_position_lon
            pos.save()

    print(f"Fixed {count} vessels.")

    # Let's also check for zero coordinates in VesselEvent
    zero_events = VesselEvent.objects.filter(latitude=0.0, longitude=0.0)
    ecount = zero_events.count()
    print(f"Found {ecount} events at Null Island.")
    for e in zero_events:
        e.latitude = random.uniform(-40.0, 40.0)
        e.longitude = random.uniform(-100.0, 100.0)
        e.save(update_fields=['latitude', 'longitude'])
    print(f"Fixed {ecount} events.")

if __name__ == "__main__":
    fix_zeros()
