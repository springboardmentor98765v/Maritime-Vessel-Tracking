"""
Management command: seed_vessel_flags
Usage:  python manage.py seed_vessel_flags

Diversifies the vessel flags to include a realistic mix of maritime registry nations,
including countries like India, China, UK, USA, etc.
"""
import random
from django.core.management.base import BaseCommand
from apps.vessels.models import Vessel

# Realistic distribution of maritime flags (weighted by real-world frequency)
MARITIME_FLAGS = [
    # Top maritime registries (higher weight = more vessels)
    ("Panama", 18),
    ("Liberia", 12),
    ("Marshall Islands", 10),
    ("Bahamas", 8),
    ("Malta", 7),
    ("Singapore", 7),
    ("China", 6),
    ("Hong Kong", 5),
    ("Cayman Islands", 4),
    ("Cyprus", 4),
    # Important shipping nations
    ("India", 4),
    ("Japan", 3),
    ("South Korea", 3),
    ("Greece", 3),
    ("Norway", 2),
    ("United Kingdom", 2),
    ("Germany", 2),
    ("Italy", 2),
    ("Turkey", 2),
    ("Russia", 2),
    # Additional nations
    ("USA", 1),
    ("Australia", 1),
    ("Brazil", 1),
    ("Indonesia", 1),
    ("Malaysia", 1),
    ("Philippines", 1),
    ("Vietnam", 1),
    ("Saudi Arabia", 1),
    ("UAE", 1),
    ("Iran", 1),
]

# Expand into a weighted list
WEIGHTED_FLAGS = []
for flag, weight in MARITIME_FLAGS:
    WEIGHTED_FLAGS.extend([flag] * weight)


class Command(BaseCommand):
    help = "Diversifies vessel flags with a realistic global distribution including India."

    def handle(self, *args, **options):
        vessels = list(Vessel.objects.all())
        count = len(vessels)
        self.stdout.write(f"Updating flags for {count} vessels...")

        batch = []
        for vessel in vessels:
            vessel.flag = random.choice(WEIGHTED_FLAGS)
            batch.append(vessel)
            if len(batch) >= 200:
                Vessel.objects.bulk_update(batch, ['flag'])
                batch = []
        if batch:
            Vessel.objects.bulk_update(batch, ['flag'])

        # Verify distribution
        from django.db.models import Count
        dist = Vessel.objects.values('flag').annotate(count=Count('flag')).order_by('-count')
        self.stdout.write(self.style.SUCCESS(f"\nDone! Updated {count} vessel flags."))
        self.stdout.write("Flag distribution:")
        for row in dist[:10]:
            self.stdout.write(f"  {row['flag']}: {row['count']}")
