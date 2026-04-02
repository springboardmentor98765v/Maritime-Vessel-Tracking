import requests
from django.core.management.base import BaseCommand
from vessels.models import Vessel
from vessels.services.event_engine import detect_events
from vessels.services.marine_api import fetch_live_vessels

class Command(BaseCommand):
    help = 'Fetches vessel data from external API and updates the database'

    def handle(self, *args, **options):
        
        # Simulate external API call
        data = fetch_live_vessels()

        for ship in data:
            vessel, created = Vessel.objects.update_or_create(
                imo_number=ship["imo"],
                defaults={
                    "vessel_name": ship["name"],
                    "vessel_type": ship["vessel_type"],
                    "flag": ship["flag"],
                    "latitude": ship["latitude"],
                    "longitude": ship["longitude"],
                    "speed": ship["speed"],
                }
            )

            # Milestone 2 Requirement: detect events after updating
            detect_events(vessel)

        self.stdout.write(self.style.SUCCESS('Successfully fetched and updated vessels.'))
