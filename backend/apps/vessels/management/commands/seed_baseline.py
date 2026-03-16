from django.core.management.base import BaseCommand
from apps.ports.models import Port
from apps.vessels.models import Vessel, VesselEvent
from apps.voyages.models import Voyage
from integrations.noaa import sync_noaa_safety_events
from integrations.unctad import sync_port_congestion_data
from integrations.aishub import sync_vessel_positions
from django.utils import timezone
import random
from datetime import timedelta

class Command(BaseCommand):
    help = 'Seeds realistic baseline data for Milestones 3 & 4 (Analytics & Voyages).'

    def handle(self, *args, **options):
        self.stdout.write("Seeding Live APIs & Baseline DB...")

        # 1. Fetch live Ports
        sync_port_congestion_data()
        ports = list(Port.objects.all())
        if not ports:
            self.stdout.write("No ports created. Aborting.")
            return

        # 2. Sync NOAA Events
        sync_noaa_safety_events()

        # 3. Create Baseline Vessels (Since AIS Hub hasn't triggered yet)
        vessel_types = ['Container Ship', 'Oil Tanker', 'Bulk Carrier', 'Ro-Ro', 'Cruise Ship']
        flags = ['Panama', 'Liberia', 'Marshall Islands', 'Singapore', 'Malta']
        
        vessels_created = 0
        vessels = list(Vessel.objects.all())
        
        # Clear existing vessels to start fresh with 1200
        Vessel.objects.all().delete()
        vessels = []
        
        for i in range(1, 1201):
            v = Vessel.objects.create(
                imo_number=f"IMO900{i:04d}",
                name=f"Global Voyager {i}",
                vessel_type=random.choice(vessel_types),
                flag=random.choice(flags),
                cargo_type="General Cargo" if i % 2 == 0 else "Crude Oil",
                operator=f"TransGlobal Line {chr(65 + i % 5)}",
                last_position_lat=round(random.uniform(-60, 60), 4),
                last_position_lon=round(random.uniform(-180, 180), 4),
                speed=round(random.uniform(10.0, 22.0), 1),
                heading=random.randint(0, 359),
                last_update=timezone.now()
            )
            vessels.append(v)
            vessels_created += 1

        self.stdout.write(f"Created {vessels_created} baseline vessels.")

        # 4. Create Historical Voyages and Events for Replay/Analytics
        voyages_created = 0
        now = timezone.now()
        
        # Clear old voyages
        Voyage.objects.all().delete()
        VesselEvent.objects.all().delete()

        status_choices = ['completed', 'in_transit', 'delayed', 'cancelled']

        TARGET_VOYAGES = 1500
        TARGET_EVENTS_TOTAL = 3000
        events_per_voyage = TARGET_EVENTS_TOTAL // TARGET_VOYAGES # exactly 2

        for i in range(TARGET_VOYAGES):
            v = random.choice(vessels)
            p_from, p_to = random.sample(ports, 2)
            
            # Historic voyage (1 to 30 days ago)
            days_ago = random.randint(1, 40)
            dep_time = now - timedelta(days=days_ago)
            arr_time = dep_time + timedelta(days=random.randint(3, 14))
            
            status = random.choice(status_choices)
            if arr_time > now:
                arr_time = None
                status = 'in_transit'

            voyage = Voyage.objects.create(
                vessel=v,
                port_from=p_from,
                port_to=p_to,
                departure_time=dep_time,
                arrival_time=arr_time,
                status=status
            )
            voyages_created += 1

            # Generate exactly 2 waypoints (Events) for the Replay timeline
            for w in range(events_per_voyage):
                event_time = dep_time + timedelta(days=w*2 + 1)
                
                event_types = ['underway', 'route_changed', 'weather', 'inspection']
                
                VesselEvent.objects.create(
                    vessel=v,
                    event_type=random.choice(event_types),
                    location=f"Navigating near {p_from.country} Sector {w+1}",
                    latitude=v.last_position_lat + random.uniform(-5, 5),
                    longitude=v.last_position_lon + random.uniform(-5, 5),
                    timestamp=event_time,
                    details="Standard transit waypoint recorded autonomously."
                )

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded {voyages_created} Historical Voyages & {TARGET_EVENTS_TOTAL} Waypoints."))
