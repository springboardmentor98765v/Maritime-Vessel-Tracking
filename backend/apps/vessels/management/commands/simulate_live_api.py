from django.core.management.base import BaseCommand
from apps.vessels.models import Vessel
from apps.vessels.services import process_vessel_update
from django.utils import timezone
import time
import random

class Command(BaseCommand):
    help = "Simulates a continuous, real-time AIS feed by moving baseline vessels incrementally. This provides live API data to the frontend."

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=5,
            help='Seconds to wait between updates (default 5)'
        )
        parser.add_argument(
            '--batch',
            type=int,
            default=5,
            help='Number of vessels to move per interval (default 5)'
        )

    def handle(self, *args, **options):
        interval = options['interval']
        batch_size = options['batch']
        
        self.stdout.write(self.style.SUCCESS('Starting Simulated Live Data Feed...'))
        self.stdout.write(self.style.WARNING(f'Updating {batch_size} vessels every {interval} seconds.'))
        self.stdout.write('Press CTRL+C to stop.')

        vessels = list(Vessel.objects.all())
        if not vessels:
            self.stdout.write(self.style.ERROR('No baseline vessels found. Run seed_baseline first.'))
            return

        try:
            while True:
                # Pick a random subset to "move" in this tick
                moving_vessels = random.sample(vessels, min(batch_size, len(vessels)))
                
                for vessel in moving_vessels:
                    # Current coords
                    lat = vessel.last_position_lat or 0.0
                    lon = vessel.last_position_lon or 0.0
                    
                    # Alter coordinates slightly to simulate movement (approximately 1-5 miles)
                    new_lat = lat + random.uniform(-0.1, 0.1)
                    new_lon = lon + random.uniform(-0.1, 0.1)
                    
                    # Keep them bounded so they don't fall off the earth
                    new_lat = max(-90.0, min(90.0, new_lat))
                    new_lon = max(-180.0, min(180.0, new_lon))

                    # Fluctuating Speed (10% chance to stop)
                    if random.random() < 0.1:
                        new_speed = 0.0
                    else:
                        new_speed = round(random.uniform(5.5, 24.5), 1)

                    # Optional: Simulate destination change occasionally (2% chance)
                    new_destination = vessel.destination
                    if random.random() < 0.02:
                        destinations = ["Rotterdam", "Singapore", "Shanghai", "Los Angeles", "Hamburg", "Dubai"]
                        new_destination = random.choice(destinations)

                    # We hook securely into the backend's Event Engine `process_vessel_update`
                    # so that all notifications, subscriptions, and DB logic execute accurately 
                    # exactly as if it came from the real AIS Hub.
                    mocked_api_payload = {
                        "imo": vessel.imo_number,
                        "name": vessel.name,
                        "type": vessel.vessel_type,
                        "flag": vessel.flag,
                        "cargo": vessel.cargo_type,
                        "lat": new_lat,
                        "lon": new_lon,
                        "speed": new_speed,
                        "heading": random.randint(0, 359),
                        "destination": new_destination
                    }

                    process_vessel_update(mocked_api_payload)
                    
                    # Update the in-memory vessel object so future simulation ticks build on this new position
                    vessel.last_position_lat = new_lat
                    vessel.last_position_lon = new_lon
                    
                self.stdout.write(f"[{timezone.now().strftime('%H:%M:%S')}] Pushed live positional updates for {len(moving_vessels)} vessels.")
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            self.stdout.write(self.style.ERROR('\nLive Feed Simulation Stopped by User.'))
