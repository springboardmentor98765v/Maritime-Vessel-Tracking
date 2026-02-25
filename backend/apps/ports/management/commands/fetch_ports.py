from django.core.management.base import BaseCommand
from integrations.unctad import sync_port_congestion_data

class Command(BaseCommand):
    help = 'Fetches real-time port analytics/congestion data from UNCTAD.'

    def handle(self, *args, **options):
        self.stdout.write('Starting UNCTAD port data fetch...')
        try:
            count = sync_port_congestion_data()
            self.stdout.write(self.style.SUCCESS(f'Successfully fetched and updated {count} ports.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error fetching UNCTAD data: {e}'))
