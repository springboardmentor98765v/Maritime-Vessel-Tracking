from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.vessels.models import Vessel, VesselPosition
from apps.vessels.services import fetch_and_update_vessels
import random

class Command(BaseCommand):
    help = 'Simulates periodic updates for vessel positions (Mocked API Sync)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Running periodic vessel coordinate updates...")
        
        # 1. Attempt Live MarineTraffic Update First
        self.stdout.write("Attempting to fetch live data from MarineTraffic...")
        try:
            live_updated = fetch_and_update_vessels()
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Live fetch exception: {e}"))
            live_updated = 0

        if live_updated > 0:
            self.stdout.write(self.style.SUCCESS(f"Successfully integrated {live_updated} live vessel positions!"))
            # Optionally record position histories here if not done in services
            # But services process_update_vessel creates VesselEvents, so we are good.
            return

        self.stdout.write(self.style.WARNING("No live data retrieved (quota empty?). Falling back to accurate simulation logic."))

        # 2. Fallback to Simulation Logic
        vessels = Vessel.objects.exclude(speed__lte=0.5)[:10]  # Only move a few
        updated_count = 0
        now = timezone.now()
        
        for vessel in vessels:
            if vessel.last_position_lat is not None and vessel.last_position_lon is not None:
                lat_shift = random.uniform(-0.01, 0.01)
                lon_shift = random.uniform(-0.01, 0.01)

                vessel.last_position_lat += lat_shift
                vessel.last_position_lon += lon_shift
                vessel.last_update = now
                vessel.save(update_fields=['last_position_lat', 'last_position_lon', 'last_update'])

                VesselPosition.objects.create(
                    vessel=vessel,
                    latitude=vessel.last_position_lat,
                    longitude=vessel.last_position_lon,
                    timestamp=now
                )
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully simulated updates for {updated_count} vessels."))
