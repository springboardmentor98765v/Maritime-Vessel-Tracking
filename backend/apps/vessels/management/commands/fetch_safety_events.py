from django.core.management.base import BaseCommand
from integrations.noaa import sync_noaa_safety_events

class Command(BaseCommand):
    help = 'Fetches active maritime weather alerts from NOAA and updates the safety dashboard.'

    def handle(self, *args, **options):
        self.stdout.write('Starting NOAA safety data fetch...')
        try:
            count = sync_noaa_safety_events()
            self.stdout.write(self.style.SUCCESS(f'Successfully fetched and updated {count} new active alerts.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error fetching NOAA data: {e}'))
