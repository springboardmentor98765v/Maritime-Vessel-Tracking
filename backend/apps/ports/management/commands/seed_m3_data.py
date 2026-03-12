from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.ports.models import Port, PortTrafficHistory
from apps.vessels.models import SafetyZones
import random

class Command(BaseCommand):
    help = 'Seeds MS3 DB tables (PortTrafficHistory and SafetyZones)'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding Milestone 3 data...")

        now = timezone.now()

        # 1. Seed SafetyZones
        SafetyZones.objects.all().delete()

        zones = [
            {'type': 'storm',    'lat': 14.5,  'lon':  89.3,  'rad': 300, 'sev': 'high'},
            {'type': 'cyclone',  'lat': 15.2,  'lon':  64.8,  'rad': 450, 'sev': 'critical'},
            {'type': 'piracy',   'lat':  3.5,  'lon':   2.1,  'rad': 200, 'sev': 'high'},
            {'type': 'accident', 'lat':  2.8,  'lon': 101.5,  'rad':  50, 'sev': 'medium'},
        ]

        for z in zones:
            SafetyZones.objects.create(
                zone_type=z['type'],
                latitude=z['lat'],
                longitude=z['lon'],
                radius=z['rad'],
                severity=z['sev'],
                expires_at=now + timedelta(days=random.randint(2, 7))
            )
        self.stdout.write(self.style.SUCCESS(f"Created {len(zones)} active SafetyZones."))

        # 2. Seed PortTrafficHistory + stamp last_analytics_update
        PortTrafficHistory.objects.all().delete()
        ports = list(Port.objects.all())

        if not ports:
            self.stdout.write(self.style.WARNING("No ports found. Run seed_vessels_ports first."))
            return

        history_count = 0
        ports_to_update = []

        for port in ports:
            for day in range(7, 0, -1):
                timestamp = now - timedelta(days=day)
                arr = max(10, port.arrivals + random.randint(-20, 20))
                dep = max(5, min(arr - 1, port.departures + random.randint(-20, 20)))
                score = round(max(0.0, min(1.0, (arr - dep) / arr)), 4)

                PortTrafficHistory.objects.create(
                    port=port,
                    timestamp=timestamp,
                    arrivals=arr,
                    departures=dep,
                    congestion_score=score
                )
                history_count += 1

            # Stamp last_analytics_update on port
            port.last_analytics_update = now
            ports_to_update.append(port)

        Port.objects.bulk_update(ports_to_update, ['last_analytics_update'])

        self.stdout.write(self.style.SUCCESS(f"Created {history_count} PortTrafficHistory records."))
        self.stdout.write(self.style.SUCCESS(
            f"Stamped last_analytics_update on {len(ports_to_update)} ports."
        ))
        self.stdout.write(self.style.SUCCESS("Milestone 3 seeding complete!"))
