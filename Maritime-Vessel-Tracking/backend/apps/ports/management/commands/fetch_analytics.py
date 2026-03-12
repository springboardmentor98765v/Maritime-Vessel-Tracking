from django.core.management.base import BaseCommand
from apps.ports.services import poll_unctad_port_stats
from apps.vessels.services_safety import poll_noaa_safety_events

class Command(BaseCommand):
    help = 'Fetches real-time port analytics from UNCTAD and safety events from NOAA.'

    def handle(self, *args, **options):
        self.stdout.write('Starting Milestone 3 Analytics Engines (Ports & Safety)...')
        try:
            # 1. Update Port Congestion & Trigger Destination Alerts
            poll_unctad_port_stats()
            self.stdout.write(self.style.SUCCESS('[✔] Successfully analyzed Port Congestion from UNCTAD.'))

            # 2. Update Safety Hazards & Trigger Radius Proximity Alerts
            poll_noaa_safety_events()
            self.stdout.write(self.style.SUCCESS('[✔] Successfully mapped active NOAA Safety Risks & Hazards.'))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error executing analytics engines: {e}'))
