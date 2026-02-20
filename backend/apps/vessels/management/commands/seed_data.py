"""
Management command: seed_data
Populates the database with realistic dummy data for demo/dev purposes.
Usage:
    python manage.py seed_data
    python manage.py seed_data --clear   (clears existing seed data first)
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random


class Command(BaseCommand):
    help = 'Seed the database with realistic dummy maritime data'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Clear existing data before seeding')

    def handle(self, *args, **options):
        if options['clear']:
            self.clear_data()

        self.seed_ports()
        self.seed_vessels()
        self.seed_safety_events()
        self.seed_voyages()
        self.seed_vessel_events()
        self.stdout.write(self.style.SUCCESS('\n✅ All dummy data seeded successfully!'))

    # ------------------------------------------------------------------
    def clear_data(self):
        from apps.vessels.models import Vessel, VesselEvent, SafetyEvent
        from apps.ports.models import Port
        from apps.voyages.models import Voyage
        SafetyEvent.objects.all().delete()
        VesselEvent.objects.all().delete()
        Voyage.objects.all().delete()
        Vessel.objects.all().delete()
        Port.objects.all().delete()
        self.stdout.write('🗑  Cleared existing data.')

    # ------------------------------------------------------------------
    def seed_ports(self):
        from apps.ports.models import Port
        ports_data = [
            dict(name='Port of Singapore', location='1.2644° N, 103.8187° E', country='Singapore',
                 congestion_score=82, avg_wait_time=18.5, arrivals=340, departures=335),
            dict(name='Port of Shanghai', location='31.2304° N, 121.4737° E', country='China',
                 congestion_score=75, avg_wait_time=14.2, arrivals=520, departures=510),
            dict(name='Port of Rotterdam', location='51.9244° N, 4.4777° E', country='Netherlands',
                 congestion_score=42, avg_wait_time=8.0, arrivals=290, departures=285),
            dict(name='Port of Los Angeles', location='33.7396° N, 118.2640° W', country='USA',
                 congestion_score=90, avg_wait_time=24.0, arrivals=180, departures=172),
            dict(name='Port of Dubai (Jebel Ali)', location='24.9857° N, 55.0272° E', country='UAE',
                 congestion_score=55, avg_wait_time=10.5, arrivals=210, departures=205),
            dict(name='Port of Hamburg', location='53.5753° N, 10.0153° E', country='Germany',
                 congestion_score=38, avg_wait_time=6.5, arrivals=190, departures=188),
            dict(name='Port of Colombo', location='6.9271° N, 79.8612° E', country='Sri Lanka',
                 congestion_score=60, avg_wait_time=12.0, arrivals=95, departures=92),
            dict(name='Port of Mumbai (JNPT)', location='18.9300° N, 72.9200° E', country='India',
                 congestion_score=68, avg_wait_time=16.0, arrivals=140, departures=135),
        ]
        created = 0
        for p in ports_data:
            obj, new = Port.objects.get_or_create(name=p['name'], defaults={**p, 'last_update': timezone.now()})
            if new:
                created += 1
        self.stdout.write(f'⚓  Created {created} ports.')

    # ------------------------------------------------------------------
    def seed_vessels(self):
        from apps.vessels.models import Vessel
        vessels_data = [
            # (imo, name, type, flag, cargo, operator, lat, lon)
            ('IMO9795513', 'Ever Given', 'Container Ship', 'Panama', 'General Cargo', 'Evergreen Marine', 1.3521, 103.8198),
            ('IMO9765228', 'MSC Oscar', 'Container Ship', 'Panama', 'General Cargo', 'MSC', 51.9244, 4.4777),
            ('IMO9302152', 'Maersk Alabama', 'Container Ship', 'USA', 'Dry Goods', 'Maersk Line', 11.5500, 43.1400),
            ('IMO9311830', 'Berge Stahl', 'Bulk Carrier', 'Norway', 'Iron Ore', 'Bergesen', -5.7945, -35.2110),
            ('IMO9403781', 'Seawise Giant', 'Oil Tanker', 'Bahamas', 'Crude Oil', 'Shell Tankers', 24.9857, 55.0272),
            ('IMO9525532', 'Pacific Courage', 'LNG Carrier', 'Marshall Islands', 'LNG', 'Pacific Gas', 33.7396, -118.2640),
            ('IMO9228305', 'Star Iris', 'Bulk Carrier', 'Greece', 'Coal', 'Star Bulk', 37.9838, 23.7275),
            ('IMO9680779', 'CMA CGM Marco Polo', 'Container Ship', 'Malta', 'General Cargo', 'CMA CGM', -33.8688, 151.2093),
            ('IMO9757187', 'Britannia', 'Cruise Ship', 'Bermuda', 'Passengers', 'P&O Cruises', 50.8225, -0.1396),
            ('IMO9321483', 'Nordic Oshima', 'Car Carrier', 'Norway', 'Vehicles', 'Höegh Autoliners', 35.6762, 139.6503),
            ('IMO9562656', 'Arabian Princess', 'Oil Tanker', 'Saudi Arabia', 'Crude Oil', 'Saudi Aramco', 24.1500, 56.3500),
            ('IMO9401335', 'Hanjin Geneva', 'Container Ship', 'Korea', 'General Cargo', 'Hanjin Shipping', 22.3193, 114.1694),
        ]
        created = 0
        for v in vessels_data:
            imo, name, vtype, flag, cargo, operator, lat, lon = v
            obj, new = Vessel.objects.get_or_create(imo_number=imo, defaults={
                'name': name, 'type': vtype, 'flag': flag,
                'cargo_type': cargo, 'operator': operator,
                'last_position_lat': lat, 'last_position_lon': lon,
                'last_update': timezone.now() - timedelta(minutes=random.randint(1, 45)),
            })
            if new:
                created += 1
        self.stdout.write(f'🚢  Created {created} vessels.')

    # ------------------------------------------------------------------
    def seed_safety_events(self):
        from apps.vessels.models import SafetyEvent
        now = timezone.now()
        events = [
            dict(event_type='piracy', title='Gulf of Aden Piracy Zone', severity='critical',
                 latitude=12.5, longitude=47.5, radius_nm=150,
                 description='Active piracy threat zone. IMB advisory in effect. Vessels advised to use high-risk corridor protection measures.',
                 source='IMB', active_from=now - timedelta(days=30)),
            dict(event_type='storm', title='Tropical Cyclone BIPARJOY Remnant', severity='high',
                 latitude=22.0, longitude=68.0, radius_nm=200,
                 description='Post-cyclone sea state: 5-6m swells reported. Wind gusts up to 60 knots.',
                 source='NOAA', active_from=now - timedelta(days=2)),
            dict(event_type='piracy', title='Strait of Malacca — Armed Robbery Alert', severity='medium',
                 latitude=3.0, longitude=101.5, radius_nm=80,
                 description='Multiple crew robbery incidents reported. Increased vigilance required especially at anchor.',
                 source='ReCAAP', active_from=now - timedelta(days=7)),
            dict(event_type='accident', title='Vessel Collision NW of Bosphorus', severity='high',
                 latitude=41.5, longitude=28.5, radius_nm=30,
                 description='Container vessel and bulk carrier collision. Oil spill reported. Avoid 30nm radius. Coast guard active.',
                 source='EMSA', active_from=now - timedelta(hours=8)),
            dict(event_type='storm', title='North Atlantic Storm GARETH', severity='medium',
                 latitude=50.0, longitude=-30.0, radius_nm=400,
                 description='Deep Atlantic low-pressure system. Beaufort Force 9-10. Heavy swell 6-9m expected.',
                 source='NOAA', active_from=now - timedelta(days=1)),
            dict(event_type='restricted', title='US Navy Exercise Zone — Pacific', severity='low',
                 latitude=20.0, longitude=-155.0, radius_nm=120,
                 description='US Navy RIMPAC exercise zone. Restricted navigation until end of month.',
                 source='NOTAM', active_from=now - timedelta(days=10)),
            dict(event_type='accident', title='Oil Spill — Singapore Straits', severity='critical',
                 latitude=1.15, longitude=103.75, radius_nm=20,
                 description='Bunkering accident resulted in minor oil spill. MPA Singapore clean-up operations ongoing.',
                 source='MPA', active_from=now - timedelta(hours=3)),
        ]
        created = 0
        for e in events:
            obj, new = SafetyEvent.objects.get_or_create(
                title=e['title'],
                defaults={**e, 'is_active': True, 'active_until': None}
            )
            if new:
                created += 1
        self.stdout.write(f'⚠️  Created {created} safety events.')

    # ------------------------------------------------------------------
    def seed_voyages(self):
        from apps.vessels.models import Vessel
        from apps.ports.models import Port
        from apps.voyages.models import Voyage
        now = timezone.now()

        vessels = list(Vessel.objects.all())
        ports = list(Port.objects.all())
        if not vessels or len(ports) < 2:
            self.stdout.write('⏭  Skipping voyages (not enough vessels/ports).')
            return

        statuses = ['en_route', 'en_route', 'en_route', 'arrived', 'arrived', 'departed']
        created = 0
        for i, vessel in enumerate(vessels[:8]):
            port_from = ports[i % len(ports)]
            port_to = ports[(i + 2) % len(ports)]
            if port_from == port_to:
                port_to = ports[(i + 1) % len(ports)]
            dep = now - timedelta(days=random.randint(1, 10))
            arr = dep + timedelta(days=random.randint(3, 14))
            status = random.choice(statuses)
            _, new = Voyage.objects.get_or_create(
                vessel=vessel,
                port_from=port_from,
                port_to=port_to,
                defaults={'departure_time': dep, 'arrival_time': arr, 'status': status}
            )
            if new:
                created += 1
        self.stdout.write(f'🗺  Created {created} voyages.')

    # ------------------------------------------------------------------
    def seed_vessel_events(self):
        from apps.vessels.models import Vessel, VesselEvent
        now = timezone.now()
        events_data = [
            ('piracy', 'Armed robbery attempt repelled', 11.5, 43.1),
            ('accident', 'Minor engine malfunction — resolved', 1.35, 103.82),
            ('weather', 'Severe weather diversion: rerouted to alternate waypoint', 22.0, 68.0),
            ('piracy', 'Suspicious vessel approach — warning shots fired', 14.0, 50.0),
            ('accident', 'Crew injury during cargo ops — medical assistance requested', 31.23, 121.47),
            ('weather', 'Heavy fog: speed reduced, whistle signals active', 51.92, 4.48),
        ]
        vessels = list(Vessel.objects.all())
        created = 0
        for i, (etype, detail, lat, lon) in enumerate(events_data):
            v = vessels[i % len(vessels)]
            _, new = VesselEvent.objects.get_or_create(
                vessel=v,
                event_type=etype,
                timestamp=now - timedelta(hours=random.randint(1, 72)),
                defaults={
                    'location': f'{abs(lat):.2f}°{"N" if lat >= 0 else "S"} {abs(lon):.2f}°{"E" if lon >= 0 else "W"}',
                    'details': detail,
                }
            )
            if new:
                created += 1
        self.stdout.write(f'📋  Created {created} vessel events.')
