from django.core.management.base import BaseCommand
from apps.vessels.services import fetch_and_update_vessels

class Command(BaseCommand):
    help = 'Fetches real-time vessel data from external APIs and updates the database.'

    def handle(self, *args, **options):
        self.stdout.write('Starting vessel data fetch...')
        try:
            fetch_and_update_vessels()
            self.stdout.write(self.style.SUCCESS('Successfully fetched and updated vessel data.'))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'Error fetching vessel data: {e}'))
