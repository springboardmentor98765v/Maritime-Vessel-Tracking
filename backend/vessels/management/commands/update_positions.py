from django.core.management.base import BaseCommand
from vessels.models import Vessel, VesselEvent
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Background task to update vessel positions and clean old logs'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting background task...")
        
        # 1. Clean old logs
        cleanup_date = datetime.now() - timedelta(days=30)
        deleted_count, _ = VesselEvent.objects.filter(timestamp__lt=cleanup_date).delete()
        self.stdout.write(self.style.SUCCESS(f"Cleaned {deleted_count} old event logs."))
        
        # 2. Update Vessel positions (Mock implementation gracefully handling external sources)
        vessels = Vessel.objects.all()
        updates = 0
        for vessel in vessels:
            try:
                # Mock API fetch
                vessel.latitude += random.uniform(-0.1, 0.1)
                vessel.longitude += random.uniform(-0.1, 0.1)
                vessel.save(update_fields=['latitude', 'longitude', 'last_update'])
                updates += 1
            except Exception as e:
                # Log error gracefully as per Milestone 4 requirements (No break)
                self.stdout.write(self.style.ERROR(f"API failure for vessel {vessel.id}: {e}"))
                VesselEvent.objects.create(
                    vessel=vessel,
                    event_type="API Error",
                    details=f"Failed to fetch update for {vessel.vessel_name}: {e}"
                )
                
        self.stdout.write(self.style.SUCCESS(f"Successfully updated positions for {updates} vessels."))
