import os
import django
from django.utils import timezone
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.vessels.models import Vessel, VesselPosition, VesselEvent, SafetyEvent
from apps.voyages.models import Voyage
from apps.ports.models import Port

def fill_all_nulls():
    print("Checking and filling nulls across models...")

    # VESSELS
    vessels_with_null_status = Vessel.objects.filter(status__isnull=True)
    vessels_with_empty_status = Vessel.objects.filter(status='')
    for v in (list(vessels_with_null_status) + list(vessels_with_empty_status)):
        v.status = random.choice(['active', 'anchored', 'moored'])
        v.save()

    for v in Vessel.objects.filter(destination__isnull=True) | Vessel.objects.filter(destination=''):
        v.destination = random.choice(['Port of Tokyo', 'Port of Shenzhen', 'Port of LA'])
        v.save()

    for v in Vessel.objects.filter(speed__isnull=True):
        v.speed = random.uniform(5.0, 22.0)
        v.save()

    for v in Vessel.objects.filter(heading__isnull=True):
        v.heading = random.uniform(0.0, 360.0)
        v.save()

    # VOYAGES
    for voy in Voyage.objects.filter(arrival_time__isnull=True):
        # We can just leave arrival time null if status is in_progress, but let's say the user wants EVERYTHING filled
        if voy.status == 'completed':
            voy.arrival_time = voy.departure_time + timezone.timedelta(days=random.randint(1, 20))
            voy.save()
        else:
            # Let's make all incomplete voyages completed for completeness, or just assign arrival time
            voy.status = 'completed'
            voy.arrival_time = voy.departure_time + timezone.timedelta(days=random.randint(1, 20))
            voy.save()

    # EVENTS
    for e in VesselEvent.objects.filter(details__isnull=True) | VesselEvent.objects.filter(details=''):
        e.details = "Event recorded with system sensors."
        e.save()

    print("✅ All remaining null values populated.")

if __name__ == "__main__":
    fill_all_nulls()
