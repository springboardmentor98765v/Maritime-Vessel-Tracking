from django.core.management.base import BaseCommand
from apps.vessels.models import SafetyEvent
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Fixes null active_until arrays in SafetyEvent by populating them with a future date relative to active_from'

    def handle(self, *args, **kwargs):
        null_events = SafetyEvent.objects.filter(active_until__isnull=True)
        count = null_events.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No null 'active_until' records found."))
            return
            
        self.stdout.write(f"Found {count} records with null active_until. Fixing...")
        fixed = 0
        for event in null_events:
            if event.active_from:
                event.active_until = event.active_from + timedelta(days=random.randint(2, 14))
                event.save(update_fields=['active_until'])
                fixed += 1
                
        self.stdout.write(self.style.SUCCESS(f"Successfully fixed {fixed} SafetyEvent records!"))
