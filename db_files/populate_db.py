import os
import sys
import django
import random
from datetime import datetime, timedelta

# Add the backend directory to the python path so we can import Django modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from vessels.models import Vessel, VesselEvent, SafetyZone
from voyages.models import Voyage, VoyageHistory

def populate_vessels_and_voyages():
    print("Starting database population according to Milestones 1-4...")

    ports = [
        {"name": "Port of Shanghai", "lat": 31.22, "lon": 121.48},
        {"name": "Port of Singapore", "lat": 1.27, "lon": 103.84},
        {"name": "Port of Rotterdam", "lat": 51.95, "lon": 4.05},
        {"name": "Port of Chennai", "lat": 13.09, "lon": 80.29},
        {"name": "Port of Los Angeles", "lat": 33.74, "lon": -118.26},
        {"name": "Port of Hamburg", "lat": 53.53, "lon": 9.96},
        {"name": "Port of New York", "lat": 40.68, "lon": -74.01},
        {"name": "Port of Busan", "lat": 35.10, "lon": 129.04},
        {"name": "Port of Dubai", "lat": 25.01, "lon": 55.06},
        {"name": "Port of Antwerp", "lat": 51.27, "lon": 4.35},
    ]

    vessel_types = ['Container Ship', 'Tanker', 'Bulk Carrier', 'Passenger', 'Fishing']
    flags = ['PAN', 'LBR', 'MHL', 'SGP', 'HKG', 'GRC', 'NOR', 'USA', 'CHN', 'JPN']
    statuses = ['In Port', 'In Transit', 'Anchored']

    # Generate 1000 vessels
    vessel_objs = []
    print("Populating 1000 Vessels...")
    for i in range(1, 1001):
        imo = 1000000 + i
        v, created = Vessel.objects.get_or_create(
            imo_number=str(imo),
            defaults={
                'vessel_name': f'Maritime Explorer {i}',
                'mmsi': str(200000000 + i),
                'vessel_type': random.choice(vessel_types),
                'flag': random.choice(flags),
                'latitude': random.uniform(-60, 60),
                'longitude': random.uniform(-180, 180),
                'speed': random.uniform(10, 25),
            }
        )
        if hasattr(v, 'status'):
            v.status = random.choice(statuses)
            v.owner = "Global Shipping Co."
            v.year_built = random.randint(2000, 2023)
            v.save()
        vessel_objs.append(v)

    # Generate Voyages for ALL vessels
    print("Populating Voyages and History for ALL remaining vessels...")
    now = datetime.now()
    
    vessels_without_voyages = Vessel.objects.exclude(voyages__isnull=False)
    print(f"Found {vessels_without_voyages.count()} vessels without voyages. Generating now...")
    
    new_voyages = []
    for vessel in vessels_without_voyages:
        start_port = random.choice(ports)
        end_port = random.choice([p for p in ports if p != start_port])
        start_time = now - timedelta(days=random.randint(5, 15))
        is_completed = random.choice([True, False])
        end_time = start_time + timedelta(days=random.randint(4, 10)) if is_completed else None
        
        new_voyages.append(Voyage(
            vessel=vessel,
            start_port=start_port["name"],
            end_port=end_port["name"],
            start_time=start_time,
            end_time=end_time,
            status="COMPLETED" if is_completed else "ONGOING"
        ))
    Voyage.objects.bulk_create(new_voyages)
    
    # Reload the new voyages to get their IDs
    created_voyages = Voyage.objects.filter(history__isnull=True)
    
    new_histories = []
    for voyage in created_voyages:
        start_p_list = [p for p in ports if p["name"] == voyage.start_port]
        end_p_list = [p for p in ports if p["name"] == voyage.end_port]
        if not start_p_list or not end_p_list:
            continue
            
        start_port = start_p_list[0]
        end_port = end_p_list[0]
        
        steps = 25
        lat_step = (end_port["lat"] - start_port["lat"]) / steps
        lon_step = (end_port["lon"] - start_port["lon"]) / steps
        
        for step in range(steps):
            pt_time = voyage.start_time + timedelta(hours=step*12)
            cur_lat = start_port["lat"] + (lat_step * step)
            cur_lon = start_port["lon"] + (lon_step * step)
            
            new_histories.append(VoyageHistory(
                voyage=voyage,
                latitude=cur_lat + random.uniform(-0.5, 0.5),
                longitude=cur_lon + random.uniform(-0.5, 0.5),
                timestamp=pt_time
            ))
            
    # Bulk insert history points chunks of 5000
    print(f"Bulk inserting {len(new_histories)} history points...")
    VoyageHistory.objects.bulk_create(new_histories, batch_size=5000)

    # Create Safety Zones
    if not SafetyZone.objects.filter(zone_type="PIRACY").exists():
        SafetyZone.objects.create(name="Gulf of Aden Risk", latitude=12.0, longitude=45.0, radius_km=300, zone_type="PIRACY", severity="HIGH")
    if not SafetyZone.objects.filter(zone_type="STORM").exists():
        SafetyZone.objects.create(name="Typhoon Warning", latitude=20.0, longitude=130.0, radius_km=500, zone_type="STORM", severity="DANGER")

    print("Database Population Complete! 1000 Vessels and accurate routes created.")

if __name__ == '__main__':
    populate_vessels_and_voyages()
