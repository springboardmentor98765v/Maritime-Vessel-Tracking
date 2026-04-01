"""
Management command: seed_vessel_destinations
Usage:  python manage.py seed_vessel_destinations

Assigns realistic destination port names to all vessels that have None/blank destinations.
"""
import random
from django.core.management.base import BaseCommand
from apps.vessels.models import Vessel

# Realistic maritime destinations used globally
DESTINATIONS = [
    "Port of Shanghai", "Port of Singapore", "Port of Rotterdam",
    "Port of Antwerp", "Port of Hamburg", "Port of Los Angeles",
    "Port of Long Beach", "Port of New York", "Port of Busan",
    "Port of Shenzhen", "Port of Ningbo-Zhoushan", "Port of Guangzhou",
    "Port of Tianjin", "Port of Dubai (Jebel Ali)", "Port of Port Klang",
    "Port of Felixstowe", "Port of Tanjung Pelepas", "Port of Piraeus",
    "Port of Algeciras", "Port of Valencia", "Port of Barcelona",
    "Port of Kaohsiung", "Port of Tokyo", "Port of Yokohama",
    "Port of Hong Kong", "Port of Colombo", "Port of Mumbai",
    "Port of Chennai", "Port of Karachi", "Port of Bandar Abbas",
    "Port of Jeddah", "Port of Dammam", "Port of Mombasa",
    "Port of Durban", "Port of Cape Town", "Port of Lagos (Apapa)",
    "Port of Santos", "Port of Buenos Aires", "Port of Callao",
    "Port of Sydney", "Port of Melbourne", "Port of Auckland",
    "Port of Haiphong", "Port of Manila", "Port of Jakarta",
    "Port of Surabaya", "Port of Bangkok", "Port of Ho Chi Minh City",
    "Port of Genoa", "Port of Marseille", "Port of Lisbon",
    "Port of Helsinki", "Port of Gothenburg", "Port of Oslo",
    "Port of Constanta", "Port of Istanbul", "Port of Alexandria",
    "Port of Dakar", "Port of Fremantle", "Port of Brisbane",
    "Port of Vancouver", "Port of Montreal", "Port of Houston",
    "Port of New Orleans", "Port of Savannah", "Port of Chittagong",
    "Port of Vladivostok", "Port of St. Petersburg", "Port of Odessa",
    "Port of Novorossiysk", "Port of Laem Chabang", "Port of Da Nang",
    "Port of Aqaba", "Port of Salalah", "Port of Djibouti",
    "Port of Colon", "Port of Balboa", "Port of Veracruz",
]


class Command(BaseCommand):
    help = "Seeds realistic destination port names for vessels with missing destinations."

    def handle(self, *args, **options):
        vessels = Vessel.objects.filter(destination__isnull=True) | Vessel.objects.filter(destination='') | Vessel.objects.filter(destination__iexact='unknown')
        count = vessels.count()
        self.stdout.write(f"Updating {count} vessels with missing destinations...")

        # Bulk update in batches
        batch = []
        for vessel in vessels.iterator(chunk_size=200):
            vessel.destination = random.choice(DESTINATIONS)
            batch.append(vessel)
            if len(batch) >= 200:
                Vessel.objects.bulk_update(batch, ['destination'])
                batch = []
        if batch:
            Vessel.objects.bulk_update(batch, ['destination'])

        self.stdout.write(self.style.SUCCESS(
            f"Done! Updated {count} vessels with realistic destinations."
        ))
