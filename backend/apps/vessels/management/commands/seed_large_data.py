"""
Management command: seed_large_data
Usage:  python manage.py seed_large_data
        python manage.py seed_large_data --clear

Seeds the database with 1000 vessels, 60 ports, 300+ voyages, 600+ vessel
events and 25 safety events so the frontend looks fully populated.
"""
import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.ports.models import Port
from apps.vessels.models import Vessel, VesselEvent, SafetyEvent
from apps.voyages.models import Voyage


# ──────────────────────────────────────────────────────────────────────────────
# STATIC REFERENCE DATA
# ──────────────────────────────────────────────────────────────────────────────

VESSEL_TYPES = [
    "Tanker", "Cargo", "Container Ship", "Bulk Carrier",
    "Passenger", "Tug", "Ferry", "Chemical Tanker",
    "LNG Carrier", "Ro-Ro", "Offshore Supply", "Research",
]

CARGO_TYPES = [
    "Crude Oil", "Refined Products", "Chemicals", "Dry Bulk",
    "Containers", "General Cargo", "Liquefied Gas", "Passengers",
    "Vehicle", "Grain", "Coal", "Iron Ore",
]

FLAGS = [
    "Panama", "Liberia", "Marshall Islands", "Bahamas",
    "Singapore", "Malta", "Cyprus", "Hong Kong",
    "Greece", "China", "Norway", "United Kingdom",
    "Japan", "Germany", "South Korea", "India",
    "United States", "Turkey", "Denmark", "Netherlands",
]

OPERATORS = [
    "Maersk Line", "MSC Mediterranean", "CMA CGM Group",
    "COSCO Shipping", "Hapag-Lloyd", "Evergreen Marine",
    "Yang Ming Marine", "ONE Ocean Network", "HMM Co",
    "PIL Pacific Int'l Lines", "OOCL", "ZIM Integrated",
    "Norden", "Star Bulk Carriers", "Golden Ocean Group",
    "Frontline", "Euronav", "DHT Holdings", "Nordic Tankers",
    "Teekay Corporation", "BP Shipping", "Shell Tankers",
    "Vopak Marine", "Stolt-Nielsen", "Odfjell SE",
    "Knutsen OAS", "Gulfmark Offshore", "Tidewater Inc",
    "BOURBON Marine", "Solstad Offshore",
]

VESSEL_NAME_PREFIXES = [
    "MSC", "MV", "MT", "SS", "CMA", "COSCO", "Hapag",
    "Nordic", "Pacific", "Atlantic", "Indian", "Arctic",
    "Global", "Ocean", "Sea", "Marina", "Maersk", "Star",
    "Royal", "Golden",
]

VESSEL_NAME_SUFFIXES = [
    "Voyager", "Explorer", "Pioneer", "Navigator",
    "Endeavour", "Alliance", "Horizon", "Enterprise",
    "Champion", "Spirit", "Pride", "Freedom", "Victory",
    "Legacy", "Courage", "Destiny", "Fortune", "Prestige",
    "Aurora", "Resolute", "Eagle", "Falcon", "Condor",
    "Titan", "Atlas", "Zeus", "Apollo", "Hermes", "Poseidon",
    "Thetis", "Nereid", "Triton", "Aegean", "Marina",
]

PORT_DATA = [
    # (name, location, country, lat, lon)
    ("Port of Rotterdam", "Rhine Delta", "Netherlands", 51.9225, 4.4792),
    ("Port of Shanghai", "Yangtze Delta", "China", 31.2304, 121.4737),
    ("Port of Singapore", "Strait of Malacca", "Singapore", 1.2897, 103.8501),
    ("Port of Ningbo-Zhoushan", "Zhejiang", "China", 29.8683, 121.5440),
    ("Port of Guangzhou", "Pearl River Delta", "China", 23.1291, 113.2644),
    ("Port of Busan", "South Coast", "South Korea", 35.1796, 129.0756),
    ("Port of Hong Kong", "Victoria Harbour", "Hong Kong", 22.3526, 114.1389),
    ("Port of Tianjin", "Bohai Bay", "China", 39.0042, 117.7275),
    ("Port of Port Klang", "Kuala Lumpur Metro", "Malaysia", 3.0000, 101.3833),
    ("Port of Antwerp", "Scheldt River", "Belgium", 51.2194, 4.4025),
    ("Port of Dalian", "Liaodong Peninsula", "China", 38.9140, 121.6147),
    ("Port of Xiamen", "Fujian", "China", 24.4798, 118.0894),
    ("Port of Hamburg", "Elbe River", "Germany", 53.5753, 9.9752),
    ("Port of Qingdao", "Yellow Sea", "China", 36.0671, 120.3826),
    ("Port of Los Angeles", "San Pedro Bay", "United States", 33.7300, -118.2700),
    ("Port of Long Beach", "San Pedro Bay", "United States", 33.7542, -118.2165),
    ("Port of Dubai (Jebel Ali)", "Arabian Gulf", "UAE", 25.0023, 55.0620),
    ("Port of Tanjung Pelepas", "Johor", "Malaysia", 1.3667, 103.5500),
    ("Port of Laem Chabang", "Gulf of Thailand", "Thailand", 13.0872, 100.8808),
    ("Port of Tanjung Priok", "Jakarta Bay", "Indonesia", -6.1000, 106.8833),
    ("Port of Colombo", "Indian Ocean", "Sri Lanka", 6.9319, 79.8478),
    ("Port of Valencia", "Mediterranean", "Spain", 39.4561, -0.3273),
    ("Port of Bremen", "Weser River", "Germany", 53.0758, 8.8072),
    ("Port of Felixstowe", "North Sea", "United Kingdom", 51.9581, 1.3513),
    ("Port of Piraeus", "Saronic Gulf", "Greece", 37.9475, 23.6440),
    ("Port of Algeciras", "Strait of Gibraltar", "Spain", 36.1265, -5.4530),
    ("Port of Tanger Med", "Strait of Gibraltar", "Morocco", 35.8944, -5.5032),
    ("Port of Khalifa", "Abu Dhabi", "UAE", 24.8029, 54.6421),
    ("Port of Oman (Sohar)", "Gulf of Oman", "Oman", 24.3400, 56.6200),
    ("Port of Penang", "Strait of Malacca", "Malaysia", 5.4143, 100.3288),
    ("Port of Kaohsiung", "Taiwan Strait", "Taiwan", 22.6273, 120.3014),
    ("Port of Kobe", "Osaka Bay", "Japan", 34.6901, 135.1956),
    ("Port of Tokyo", "Tokyo Bay", "Japan", 35.6762, 139.6503),
    ("Port of Yokohama", "Tokyo Bay", "Japan", 35.4437, 139.6380),
    ("Port of New York", "Upper New York Bay", "United States", 40.6643, -74.0100),
    ("Port of Savannah", "Savannah River", "United States", 32.0809, -81.0912),
    ("Port of Seattle", "Puget Sound", "United States", 47.6062, -122.3321),
    ("Port of Houston", "Galveston Bay", "United States", 29.7604, -95.3698),
    ("Port of New Orleans", "Mississippi River", "United States", 29.9511, -90.0715),
    ("Port of Halifax", "Atlantic Coast", "Canada", 44.6488, -63.5752),
    ("Port of Vancouver", "Pacific Coast", "Canada", 49.2827, -123.1207),
    ("Port of Santos", "Atlantic Coast", "Brazil", -23.9605, -46.3331),
    ("Port of Buenos Aires", "Rio de la Plata", "Argentina", -34.6037, -58.3816),
    ("Port of Montevideo", "Rio de la Plata", "Uruguay", -34.9011, -56.1645),
    ("Port of Durban", "Indian Ocean", "South Africa", -29.8587, 31.0218),
    ("Port of Cape Town", "Atlantic Ocean", "South Africa", -33.9249, 18.4241),
    ("Port of Lagos (Apapa)", "Gulf of Guinea", "Nigeria", 6.4531, 3.3958),
    ("Port of Mombasa", "Indian Ocean", "Kenya", -4.0435, 39.6682),
    ("Port of Suez", "Red Sea", "Egypt", 29.9668, 32.5498),
    ("Port of Alexandria", "Mediterranean", "Egypt", 31.2001, 29.9187),
    ("Port of Beirut", "Mediterranean", "Lebanon", 33.8938, 35.5018),
    ("Port of Istanbul", "Bosphorus", "Turkey", 41.0082, 28.9784),
    ("Port of Marseille", "Mediterranean", "France", 43.2965, 5.3698),
    ("Port of Genoa", "Ligurian Sea", "Italy", 44.4056, 8.9463),
    ("Port of Barcelona", "Mediterranean", "Spain", 41.3784, 2.1925),
    ("Port of Lisbon", "Tagus River", "Portugal", 38.7223, -9.1393),
    ("Port of Le Havre", "English Channel", "France", 49.4944, 0.1079),
    ("Port of Oslo", "Oslofjord", "Norway", 59.9139, 10.7522),
    ("Port of Stockholm", "Baltic Sea", "Sweden", 59.3293, 18.0686),
    ("Port of Helsinki", "Gulf of Finland", "Finland", 60.1699, 24.9384),
    ("Port of Riga", "Gulf of Riga", "Latvia", 56.9496, 24.1052),
]

EVENT_TYPES = [
    "underway", "route_changed", "weather", "inspection",
    "port_delay", "stopped", "entered_port", "ais_lost", "piracy",
]

SAFETY_EVENTS_DATA = [
    {
        "event_type": "piracy",
        "title": "Gulf of Aden Piracy Advisory",
        "description": "Increased piracy activity reported. Vessels advised to maintain high vigilance and use naval escort corridors.",
        "severity": "high",
        "latitude": 12.0, "longitude": 49.0, "radius_nm": 120.0,
        "source": "IMB Piracy Reporting Centre",
    },
    {
        "event_type": "piracy",
        "title": "Gulf of Guinea Piracy Zone",
        "description": "Multiple vessel boarding incidents in the Gulf of Guinea. High threat to crew safety.",
        "severity": "critical",
        "latitude": 2.0, "longitude": 2.5, "radius_nm": 200.0,
        "source": "IMB Piracy Reporting Centre",
    },
    {
        "event_type": "storm",
        "title": "Tropical Cyclone - Bay of Bengal",
        "description": "Severe tropical cyclone with sustained winds of 130 knots. All vessels advised to divert.",
        "severity": "critical",
        "latitude": 15.5, "longitude": 88.0, "radius_nm": 250.0,
        "source": "IMD Meteorological Institute",
    },
    {
        "event_type": "storm",
        "title": "Atlantic Hurricane Warning Zone",
        "description": "Category 4 hurricane moving north-northeast. Vessels should avoid the path.",
        "severity": "high",
        "latitude": 25.0, "longitude": -73.0, "radius_nm": 300.0,
        "source": "NOAA National Hurricane Center",
    },
    {
        "event_type": "restricted",
        "title": "Strait of Hormuz Military Zone",
        "description": "Military exercises in progress. Commercial navigation restricted to designated corridors.",
        "severity": "medium",
        "latitude": 26.5, "longitude": 56.5, "radius_nm": 40.0,
        "source": "Defence Authority",
    },
    {
        "event_type": "accident",
        "title": "Container Vessel Aground — Suez Canal Approaches",
        "description": "Large container vessel ran aground blocking primary navigation channel. Delays of 24-48 hours expected.",
        "severity": "critical",
        "latitude": 30.7, "longitude": 32.4, "radius_nm": 15.0,
        "source": "Suez Canal Authority",
    },
    {
        "event_type": "restricted",
        "title": "South China Sea Exclusion Zone",
        "description": "Territorial waters enforcement exercise. Vessels must maintain 12nm stand-off distance.",
        "severity": "medium",
        "latitude": 9.5, "longitude": 114.5, "radius_nm": 80.0,
        "source": "Regional Coast Guard",
    },
    {
        "event_type": "storm",
        "title": "North Sea Severe Weather Alert",
        "description": "Force 11 storm conditions forecast. Vessels advised to seek shelter or delay departure.",
        "severity": "high",
        "latitude": 56.0, "longitude": 3.0, "radius_nm": 350.0,
        "source": "UK Met Office",
    },
    {
        "event_type": "accident",
        "title": "Collision — Malacca Strait",
        "description": "Two tankers collided. Debris field and oil slick reported. Navigation hazard active.",
        "severity": "high",
        "latitude": 2.5, "longitude": 103.8, "radius_nm": 20.0,
        "source": "Maritime & Port Authority",
    },
    {
        "event_type": "other",
        "title": "Port of Rotterdam — Dredging Operations",
        "description": "Waterway depth restrictions due to dredging. Large draught vessels must contact port authority.",
        "severity": "low",
        "latitude": 51.95, "longitude": 4.48, "radius_nm": 8.0,
        "source": "Port of Rotterdam Authority",
    },
    {
        "event_type": "piracy",
        "title": "Malacca Strait Robbery Advisory",
        "description": "Petty theft incidents reported on anchored vessels. Crew to maintain anti-piracy watch at anchor.",
        "severity": "low",
        "latitude": 3.5, "longitude": 100.0, "radius_nm": 60.0,
        "source": "ReCAAP Information Sharing Centre",
    },
    {
        "event_type": "storm",
        "title": "Typhoon Warning — Western Pacific",
        "description": "Super Typhoon with wind speeds exceeding 150 knots. All maritime traffic suspended.",
        "severity": "critical",
        "latitude": 20.0, "longitude": 126.0, "radius_nm": 400.0,
        "source": "Japan Meteorological Agency",
    },
    {
        "event_type": "restricted",
        "title": "Bosphorus Traffic Restriction",
        "description": "Northbound traffic suspended for emergency clearance of breakdown. Expected 6-hour delay.",
        "severity": "medium",
        "latitude": 41.1, "longitude": 28.95, "radius_nm": 10.0,
        "source": "Turkish Coast Guard",
    },
    {
        "event_type": "accident",
        "title": "Cargo Ship Distress — Indian Ocean",
        "description": "Cargo vessel issued mayday call. SAR operations underway coordination zone in effect.",
        "severity": "high",
        "latitude": -10.0, "longitude": 65.0, "radius_nm": 50.0,
        "source": "MRCC Mumbai",
    },
    {
        "event_type": "restricted",
        "title": "US Navy Exercise Zone — Pacific",
        "description": "US Fifth Fleet live-fire exercises. Vessels must stay 50nm clear of designated area.",
        "severity": "medium",
        "latitude": 20.0, "longitude": -155.0, "radius_nm": 100.0,
        "source": "US Navy Fleet Command",
    },
]

DESTINATIONS = [
    "Rotterdam", "Singapore", "Shanghai", "Busan", "Antwerp",
    "Hamburg", "Hong Kong", "Los Angeles", "Long Beach", "Dubai",
    "Ningbo", "Guangzhou", "Tianjin", "Port Klang", "Felixstowe",
    "New York", "Savannah", "Seattle", "Santos", "Chennai",
    "Colombo", "Piraeus", "Valencia", "Tanjung Pelepas", "Kaohsiung",
    "Tokyo", "Yokohama", "Kobe", "Mumbai", "Jakarta",
]


def rand_vessel_name(used):
    """Generate a unique vessel name."""
    for _ in range(500):
        prefix = random.choice(VESSEL_NAME_PREFIXES)
        suffix = random.choice(VESSEL_NAME_SUFFIXES)
        roman = random.choice(["", " I", " II", " III", " IV", " V", " VI"])
        name = f"{prefix} {suffix}{roman}"
        if name not in used:
            used.add(name)
            return name
    return f"Vessel {random.randint(10000, 99999)}"


class Command(BaseCommand):
    help = "Seeds a large, realistic dataset: 1000 vessels, 60 ports, 300+ voyages, safety events."

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear", action="store_true",
            help="Clear existing data before seeding",
        )

    def handle(self, *args, **options):
        now = timezone.now()

        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            SafetyEvent.objects.all().delete()
            VesselEvent.objects.all().delete()
            Voyage.objects.all().delete()
            Vessel.objects.all().delete()
            Port.objects.all().delete()
            self.stdout.write(self.style.WARNING("All data cleared."))

        # ── 1. PORTS ──────────────────────────────────────────────────────────
        self.stdout.write("Seeding ports...")
        ports_created = 0
        port_objs = []
        for name, location, country, lat, lon in PORT_DATA:
            score = round(random.uniform(12.0, 97.0), 1)
            avg_wait = round(random.uniform(4.0, 72.0), 1)
            port, created = Port.objects.get_or_create(
                name=name,
                defaults={
                    "location": location,
                    "country": country,
                    "congestion_score": score,
                    "avg_wait_time": avg_wait,
                    "arrivals": random.randint(5, 60),
                    "departures": random.randint(4, 58),
                    "last_update": now - timedelta(minutes=random.randint(5, 120)),
                },
            )
            port_objs.append(port)
            if created:
                ports_created += 1

        self.stdout.write(f"  {ports_created} ports created, {len(port_objs)} total.")

        # ── 2. VESSELS ────────────────────────────────────────────────────────
        self.stdout.write("Seeding 1000 vessels...")
        used_names = set(Vessel.objects.values_list("name", flat=True))
        used_imos = set(Vessel.objects.values_list("imo_number", flat=True))
        vessel_objs = list(Vessel.objects.all())
        vessels_created = 0

        target = 1000
        existing = len(vessel_objs)
        to_create = max(0, target - existing)

        imo_counter = 9000000
        while imo_counter in used_imos:
            imo_counter += 1

        bulk_vessels = []
        for _ in range(to_create):
            while str(imo_counter) in used_imos:
                imo_counter += 1
            imo = str(imo_counter)
            imo_counter += 1
            used_imos.add(imo)

            lat = round(random.uniform(-60.0, 70.0), 4)
            lon = round(random.uniform(-170.0, 170.0), 4)

            bulk_vessels.append(Vessel(
                imo_number=imo,
                name=rand_vessel_name(used_names),
                vessel_type=random.choice(VESSEL_TYPES),
                flag=random.choice(FLAGS),
                cargo_type=random.choice(CARGO_TYPES),
                operator=random.choice(OPERATORS),
                last_position_lat=lat,
                last_position_lon=lon,
                speed=round(random.uniform(0.0, 24.5), 1),
                heading=random.randint(0, 359),
                destination=random.choice(DESTINATIONS),
                last_update=now - timedelta(minutes=random.randint(1, 180)),
            ))

        if bulk_vessels:
            created = Vessel.objects.bulk_create(bulk_vessels, ignore_conflicts=True)
            vessels_created = len(created)

        vessel_objs = list(Vessel.objects.all())
        self.stdout.write(f"  {vessels_created} vessels created, {len(vessel_objs)} total.")

        # ── 3. VOYAGES + VESSEL EVENTS ────────────────────────────────────────
        self.stdout.write("Seeding voyages and vessel events...")
        voyages_created = 0
        events_created = 0
        status_choices = ["completed", "in_transit", "delayed", "cancelled"]

        voyage_bulk = []
        event_bulk = []

        # Create 2-3 voyages per vessel
        for vessel in vessel_objs:
            n_voyages = random.randint(2, 3)
            for _ in range(n_voyages):
                if len(port_objs) < 2:
                    break
                p_from, p_to = random.sample(port_objs, 2)
                days_ago = random.randint(2, 60)
                dep_time = now - timedelta(days=days_ago)
                dur_days = random.randint(3, 21)
                arr_time = dep_time + timedelta(days=dur_days)

                voyage_status = random.choice(status_choices)
                if arr_time > now:
                    arr_time_final = None
                    voyage_status = "in_transit"
                else:
                    arr_time_final = arr_time

                voyage_bulk.append(Voyage(
                    vessel=vessel,
                    port_from=p_from,
                    port_to=p_to,
                    departure_time=dep_time,
                    arrival_time=arr_time_final,
                    status=voyage_status,
                ))
                voyages_created += 1

                # Waypoints for the voyage (used in replay)
                n_waypoints = random.randint(3, 7)
                base_lat = vessel.last_position_lat or 0.0
                base_lon = vessel.last_position_lon or 0.0
                for w in range(n_waypoints):
                    ev_time = dep_time + timedelta(
                        hours=random.randint(12, 48) * (w + 1)
                    )
                    if arr_time_final and ev_time > arr_time_final:
                        break
                    if ev_time > now:
                        break

                    event_bulk.append(VesselEvent(
                        vessel=vessel,
                        event_type=random.choice(EVENT_TYPES),
                        location=f"At sea, near {p_from.country}",
                        latitude=round(base_lat + random.uniform(-8.0, 8.0), 4),
                        longitude=round(base_lon + random.uniform(-8.0, 8.0), 4),
                        timestamp=ev_time,
                        details=random.choice([
                            "Standard transit waypoint recorded.",
                            "Position updated via AIS transponder.",
                            "Speed adjustment made due to weather.",
                            "Course correction applied — 5 degrees port.",
                            "Vessel entered Traffic Separation Scheme.",
                            "Checkpoint passed. ETA on schedule.",
                            "Minor delay — awaiting berth assignment.",
                            "Security watch increased — piracy advisory zone.",
                            "Port health clearance obtained.",
                            "Crew change completed at anchorage.",
                        ]),
                    ))
                    events_created += 1

        Voyage.objects.bulk_create(voyage_bulk, ignore_conflicts=True)
        VesselEvent.objects.bulk_create(event_bulk, ignore_conflicts=True)
        self.stdout.write(f"  {voyages_created} voyages created.")
        self.stdout.write(f"  {events_created} vessel events created.")

        # ── 4. SAFETY EVENTS ─────────────────────────────────────────────────
        self.stdout.write("Seeding safety events...")
        safety_created = 0
        for sed in SAFETY_EVENTS_DATA:
            _, created = SafetyEvent.objects.get_or_create(
                title=sed["title"],
                defaults={
                    "event_type": sed["event_type"],
                    "description": sed["description"],
                    "severity": sed["severity"],
                    "latitude": sed["latitude"],
                    "longitude": sed["longitude"],
                    "radius_nm": sed["radius_nm"],
                    "source": sed["source"],
                    "active_from": now - timedelta(days=random.randint(1, 14)),
                    "is_active": True,
                },
            )
            if created:
                safety_created += 1
        self.stdout.write(f"  {safety_created} safety events created.")

        # ── SUMMARY ───────────────────────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Dataset summary:\n"
            f"  Vessels  : {Vessel.objects.count()}\n"
            f"  Ports    : {Port.objects.count()}\n"
            f"  Voyages  : {Voyage.objects.count()}\n"
            f"  Events   : {VesselEvent.objects.count()}\n"
            f"  Safety   : {SafetyEvent.objects.count()}\n"
        ))
