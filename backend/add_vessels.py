import os
import django
import random
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from vessels.models import Vessel

def generate_random_vessel_data(index):
    vessel_types = ['Cargo', 'Tanker', 'Container', 'Bulk Carrier', 'Passenger', 'Fishing', 'Tug', 'Other']
    flags = ['Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Hong Kong', 'Greece', 'Norway', 'USA', 'China', 'Japan']
    cargo_types = ['Oil', 'Gas', 'Containers', 'Coal', 'Iron Ore', 'Grain', 'Chemicals', 'General Cargo', '']

    return {
        'vessel_name': f'Vessel_{index}',
        'mmsi': f'{random.randint(100000000, 999999999)}',  # 9-digit MMSI
        'imo_number': f'{random.randint(1000000, 9999999)}',  # 7-digit IMO
        'latitude': random.uniform(-90, 90),
        'longitude': random.uniform(-180, 180),
        'speed': random.uniform(0, 30),
        'vessel_type': random.choice(vessel_types),
        'flag': random.choice(flags),
        'cargo_type': random.choice(cargo_types),
        'heading': random.uniform(0, 360) if random.random() > 0.5 else None,
        'destination': f'Destination_{index}' if random.random() > 0.5 else None,
    }

# Add 100 vessels
for i in range(1, 101):
    data = generate_random_vessel_data(i)
    try:
        vessel = Vessel.objects.create(**data)
        print(f'Created vessel: {vessel.vessel_name}')
    except Exception as e:
        print(f'Error creating vessel {i}: {e}')

print('Finished adding 100 vessels.')