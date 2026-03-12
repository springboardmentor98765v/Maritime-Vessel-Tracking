from django.core.management.base import BaseCommand
from apps.vessels.models import Vessel, VesselEvent, SafetyEvent
from apps.ports.models import Port
from apps.voyages.models import Voyage
from django.utils import timezone
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seed the database with dummy maritime data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. Seed Ports
        ports_data = [
            {'name': 'Port of Singapore', 'location': 'Singapore', 'country': 'Singapore', 'lat': 1.264, 'lon': 103.84, 'score': 85},
            {'name': 'Port of Rotterdam', 'location': 'Rotterdam', 'country': 'Netherlands', 'lat': 51.94, 'lon': 4.13, 'score': 45},
            {'name': 'Port of Shanghai', 'location': 'Shanghai', 'country': 'China', 'lat': 31.22, 'lon': 121.48, 'score': 92},
            {'name': 'Port of Los Angeles', 'location': 'Los Angeles', 'country': 'USA', 'lat': 33.74, 'lon': -118.26, 'score': 75},
            {'name': 'Port of Dubai', 'location': 'Dubai', 'country': 'UAE', 'lat': 25.27, 'lon': 55.33, 'score': 20},
        ]

        ports = []
        for p in ports_data:
            port, created = Port.objects.get_or_create(
                name=p['name'],
                defaults={
                    'location': p['location'],
                    'country': p['country'],
                    'congestion_score': p['score'],
                    'avg_wait_time': random.randint(5, 48),
                    'arrivals': random.randint(10, 100),
                    'departures': random.randint(10, 100),
                    'last_update': timezone.now()
                }
            )
            ports.append(port)
            if created:
                self.stdout.write(f'Created port: {port.name}')

        # 2. Seed Vessels
        vessels_data = [
            {'name': 'Ever Given', 'imo': '9811000', 'type': 'Container Ship', 'flag': 'Panama', 'cargo': 'General Cargo', 'lat': 30.01, 'lon': 32.58},
            {'name': 'Ocean Voyager', 'imo': '9123456', 'type': 'Oil Tanker', 'flag': 'Marshall Islands', 'cargo': 'Crude Oil', 'lat': 20.0, 'lon': -40.0},
            {'name': 'Global Express', 'imo': '9234567', 'type': 'Bulk Carrier', 'flag': 'Liberia', 'cargo': 'Iron Ore', 'lat': -10.0, 'lon': 110.0},
            {'name': 'Sea Breeze', 'imo': '9345678', 'type': 'Cruise Ship', 'flag': 'Bahamas', 'cargo': 'Passengers', 'lat': 25.0, 'lon': -77.0},
            {'name': 'Arctic Star', 'imo': '9456789', 'type': 'LNG Carrier', 'flag': 'Norway', 'cargo': 'LNG', 'lat': 70.0, 'lon': 20.0},
        ]

        vessels = []
        for v in vessels_data:
            vessel, created = Vessel.objects.get_or_create(
                imo_number=v['imo'],
                defaults={
                    'name': v['name'],
                    'vessel_type': v['type'],
                    'flag': v['flag'],
                    'cargo_type': v['cargo'],
                    'operator': 'Global Shipping Inc.',
                    'last_position_lat': v['lat'],
                    'last_position_lon': v['lon'],
                    'last_update': timezone.now()
                }
            )
            vessels.append(vessel)
            if created:
                self.stdout.write(f'Created vessel: {vessel.name}')

        # 3. Seed Safety Events
        safety_events_data = [
            {'type': 'piracy', 'title': 'Suspected Piracy Activity', 'lat': 12.0, 'lon': 45.0, 'severity': 'high'},
            {'type': 'storm', 'title': 'Tropical Cyclone Warning', 'lat': 15.0, 'lon': -60.0, 'severity': 'critical'},
            {'type': 'restricted', 'title': 'Military Exercise Area', 'lat': 35.0, 'lon': 130.0, 'severity': 'medium'},
        ]

        for s in safety_events_data:
            SafetyEvent.objects.get_or_create(
                title=s['title'],
                defaults={
                    'event_type': s['type'],
                    'severity': s['severity'],
                    'latitude': s['lat'],
                    'longitude': s['lon'],
                    'radius_nm': 100,
                    'active_from': timezone.now(),
                    'is_active': True
                }
            )
            self.stdout.write(f'Created safety event: {s["title"]}')

        # 4. Seed Vessel Events
        for vessel in vessels:
            VesselEvent.objects.create(
                vessel=vessel,
                event_type='Arrival',
                timestamp=timezone.now() - timedelta(days=1),
                details=f'{vessel.name} arrived at anchor.'
            )

        # 5. Seed Voyages
        for i in range(5):
            vessel = vessels[i % len(vessels)]
            p_from = ports[i % len(ports)]
            p_to = ports[(i + 1) % len(ports)]
            Voyage.objects.create(
                vessel=vessel,
                port_from=p_from,
                port_to=p_to,
                departure_time=timezone.now() - timedelta(days=5),
                arrival_time=timezone.now() + timedelta(days=3),
                status='In Transit'
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded dummy data'))
