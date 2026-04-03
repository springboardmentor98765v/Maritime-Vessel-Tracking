import random
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model

from apps.vessels.models import Vessel, VesselPosition
from apps.ports.models import Port, PortTrafficHistory
from apps.voyages.models import Voyage
from apps.safety.models import SafetyZone, ExternalSafetyData, ApiIntegrationLog


User = get_user_model()


def rand_dt(days_back=60):
    return timezone.now() - timedelta(
        days=random.randint(0, days_back),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )


def ensure_users(target=100):
    current = User.objects.count()
    needed = max(0, target - current)
    for i in range(needed):
        n = current + i + 1
        User.objects.create_user(
            username=f"demo_user_{n}",
            email=f"demo_user_{n}@example.com",
            password="Demo@12345"
        )
    print("Users:", User.objects.count())


def ensure_vessels(target=800):
    current = Vessel.objects.count()
    needed = max(0, target - current)

    operators = ["Maersk", "MSC", "COSCO", "CMA CGM", "Hapag-Lloyd"]
    vessel_types = ["Cargo", "Tanker", "Container", "Bulk Carrier", "Passenger"]
    flags = ["India", "Panama", "Liberia", "Singapore", "Marshall Islands"]
    cargo_types = ["Oil", "Coal", "Containers", "Grain", "Mixed Cargo"]
    destinations = ["Singapore", "Rotterdam", "Dubai", "Mumbai", "Chennai", "Shanghai"]

    for i in range(needed):
        n = current + i + 1
        Vessel.objects.create(
            imo_number=str(8000000 + n),
            mmsi=str(900000000 + n),
            name=f"Vessel-{n}",
            vessel_type=random.choice(vessel_types),
            flag=random.choice(flags),
            cargo_type=random.choice(cargo_types),
            last_position_lat=round(random.uniform(-60, 60), 6),
            last_position_lon=round(random.uniform(-170, 170), 6),
            speed=round(random.uniform(0, 30), 2),
            heading=round(random.uniform(0, 359), 2),
            destination=random.choice(destinations),
            operator=random.choice(operators),
            last_update=timezone.now(),
            updated_at=timezone.now(),
            created_at=timezone.now(),
        )
    print("Vessels:", Vessel.objects.count())


def ensure_ports(target=300):
    current = Port.objects.count()
    needed = max(0, target - current)

    countries = ["India", "Singapore", "Netherlands", "UAE", "China", "USA"]
    for i in range(needed):
        n = current + i + 1
        Port.objects.create(
            name=f"Port-{n}",
            location=f"City-{n}",
            country=random.choice(countries),
            congestion_score=round(random.uniform(0.1, 0.95), 2),
            avg_wait_time=round(random.uniform(2, 48), 2),
            arrivals=random.randint(20, 300),
            departures=random.randint(10, 250),
            last_analytics_update=timezone.now(),
        )
    print("Ports:", Port.objects.count())


def ensure_positions(target=2000):
    current = VesselPosition.objects.count()
    needed = max(0, target - current)

    vessels = list(Vessel.objects.all())
    for _ in range(needed):
        vessel = random.choice(vessels)
        VesselPosition.objects.create(
            vessel=vessel,
            latitude=round(random.uniform(-60, 60), 6),
            longitude=round(random.uniform(-170, 170), 6),
            speed=round(random.uniform(0, 30), 2),
            heading=round(random.uniform(0, 359), 2),
            timestamp=rand_dt(90),
            created_at=timezone.now(),
        )
    print("VesselPosition:", VesselPosition.objects.count())


def ensure_voyages(target=1000):
    current = Voyage.objects.count()
    needed = max(0, target - current)

    vessels = list(Vessel.objects.all())
    ports = list(Port.objects.all())
    statuses = ["Completed", "In Progress", "Delayed"]

    for _ in range(needed):
        vessel = random.choice(vessels)
        port_from = random.choice(ports)
        port_to = random.choice(ports)
        while port_to.id == port_from.id:
            port_to = random.choice(ports)

        dep = rand_dt(120)
        arr = dep + timedelta(hours=random.randint(4, 120))

        Voyage.objects.create(
            vessel=vessel,
            port_from=port_from,
            port_to=port_to,
            departure_time=dep,
            arrival_time=arr,
            status=random.choice(statuses),
        )
    print("Voyages:", Voyage.objects.count())


def ensure_port_history(target=1000):
    current = PortTrafficHistory.objects.count()
    needed = max(0, target - current)

    ports = list(Port.objects.all())
    for _ in range(needed):
        port = random.choice(ports)
        arrivals = random.randint(20, 300)
        departures = random.randint(10, arrivals)
        congestion = round((arrivals - departures) / max(arrivals, 1), 2)
        PortTrafficHistory.objects.create(
            port=port,
            timestamp=rand_dt(120),
            arrivals=arrivals,
            departures=departures,
            congestion_score=congestion,
        )
    print("PortTrafficHistory:", PortTrafficHistory.objects.count())


def ensure_safety_zones(target=150):
    current = SafetyZone.objects.count()
    needed = max(0, target - current)

    zone_types = ["storm", "piracy", "accident"]
    severities = ["low", "medium", "high"]

    for _ in range(needed):
        SafetyZone.objects.create(
            zone_type=random.choice(zone_types),
            latitude=round(random.uniform(-60, 60), 6),
            longitude=round(random.uniform(-170, 170), 6),
            radius=round(random.uniform(50, 600), 2),
            severity=random.choice(severities),
            created_at=timezone.now(),
            expires_at=timezone.now() + timedelta(days=random.randint(1, 15)),
        )
    print("SafetyZone:", SafetyZone.objects.count())


def ensure_external_safety(target=150):
    current = ExternalSafetyData.objects.count()
    needed = max(0, target - current)

    zone_types = ["storm", "piracy", "accident"]
    severities = ["low", "medium", "high"]
    existing = ExternalSafetyData.objects.count()

    for i in range(needed):
        n = existing + i + 1
        ExternalSafetyData.objects.create(
            source=random.choice(["NOAA", "MarineTraffic", "InternalFeed"]),
            external_id=f"EXT-{n}",
            zone_type=random.choice(zone_types),
            latitude=round(random.uniform(-60, 60), 6),
            longitude=round(random.uniform(-170, 170), 6),
            radius=round(random.uniform(50, 600), 2),
            severity=random.choice(severities),
            fetched_at=timezone.now(),
            raw_payload={"demo": True, "row": n},
        )
    print("ExternalSafetyData:", ExternalSafetyData.objects.count())


def ensure_api_logs(target=100):
    current = ApiIntegrationLog.objects.count()
    needed = max(0, target - current)

    statuses = ["success", "failed"]
    sources = ["NOAA", "UNCTAD", "MarineTraffic"]
    for i in range(needed):
        status = random.choice(statuses)
        ApiIntegrationLog.objects.create(
            source=random.choice(sources),
            endpoint="https://demo-endpoint.example/api",
            status=status,
            message="Fetched successfully" if status == "success" else "Temporary API failure",
            created_at=timezone.now(),
        )
    print("ApiIntegrationLog:", ApiIntegrationLog.objects.count())


ensure_users(100)              # change to 500 only if you really need it
ensure_vessels(800)
ensure_ports(300)
ensure_positions(2000)
ensure_voyages(1000)
ensure_port_history(1000)
ensure_safety_zones(150)
ensure_external_safety(150)
ensure_api_logs(100)
print("Bulk demo data generation complete.")