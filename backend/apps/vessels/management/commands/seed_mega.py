"""
Management command: seed_mega
Usage:
    python manage.py seed_mega
    python manage.py seed_mega --clear

Seeds the database with:
  - 5 000  vessels
  - 1 000  users (operator / analyst / admin mix)
  - 10 000 voyages
  - 25 000 vessel events
  - 100 000 notifications  (distributed across users)

All inserts use bulk_create in batches of 500 for speed.
"""

import random
import string
from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.authentication.models import User
from apps.notifications.models import Notification
from apps.ports.models import Port
from apps.vessels.models import Vessel, VesselEvent, SafetyEvent
from apps.voyages.models import Voyage

# ──────────────────────────────────────────────────────────────
# REFERENCE DATA
# ──────────────────────────────────────────────────────────────

VESSEL_TYPES = [
    "Tanker", "Cargo", "Container Ship", "Bulk Carrier",
    "Passenger", "Tug", "Ferry", "Chemical Tanker",
    "LNG Carrier", "Ro-Ro", "Offshore Supply", "Research",
    "Dredger", "Icebreaker", "FPSO", "Heavy Lift",
]

CARGO_TYPES = [
    "Crude Oil", "Refined Products", "Chemicals", "Dry Bulk",
    "Containers", "General Cargo", "Liquefied Gas", "Passengers",
    "Vehicle", "Grain", "Coal", "Iron Ore", "Timber", "Cement",
]

FLAGS = [
    "Panama", "Liberia", "Marshall Islands", "Bahamas",
    "Singapore", "Malta", "Cyprus", "Hong Kong",
    "Greece", "China", "Norway", "United Kingdom",
    "Japan", "Germany", "South Korea", "India",
    "United States", "Turkey", "Denmark", "Netherlands",
    "Italy", "France", "Brazil", "Russia", "UAE",
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
    "BOURBON Marine", "Solstad Offshore", "BW Group",
    "Pacific Basin", "Scorpio Tankers", "Ardmore Shipping",
    "Safe Bulkers", "Diana Shipping", "Excel Maritime",
]

PREFIXES = [
    "MSC", "MV", "MT", "SS", "CMA", "COSCO", "Hapag",
    "Nordic", "Pacific", "Atlantic", "Indian", "Arctic",
    "Global", "Ocean", "Sea", "Marina", "Maersk", "Star",
    "Royal", "Golden", "Baltic", "Eastern", "Western",
    "Northern", "Southern", "Imperial", "Maritime", "Trans",
    "Inter", "Allied", "United", "National", "Continental",
]

SUFFIXES = [
    "Voyager", "Explorer", "Pioneer", "Navigator", "Endeavour",
    "Alliance", "Horizon", "Enterprise", "Champion", "Spirit",
    "Pride", "Freedom", "Victory", "Legacy", "Courage", "Destiny",
    "Fortune", "Prestige", "Aurora", "Resolute", "Eagle", "Falcon",
    "Condor", "Titan", "Atlas", "Zeus", "Apollo", "Hermes", "Poseidon",
    "Thetis", "Nereid", "Triton", "Aegean", "Marina", "Warrior",
    "Guardian", "Sentinel", "Ranger", "Crusader", "Valor", "Vanguard",
    "Meridian", "Zenith", "Apex", "Crest", "Summit", "Peak",
]

DESTINATIONS = [
    "Rotterdam", "Singapore", "Shanghai", "Busan", "Antwerp",
    "Hamburg", "Hong Kong", "Los Angeles", "Long Beach", "Dubai",
    "Ningbo", "Guangzhou", "Tianjin", "Port Klang", "Felixstowe",
    "New York", "Savannah", "Seattle", "Santos", "Chennai",
    "Colombo", "Piraeus", "Valencia", "Tanjung Pelepas", "Kaohsiung",
    "Tokyo", "Yokohama", "Kobe", "Mumbai", "Jakarta",
    "Sydney", "Melbourne", "Durban", "Lagos", "Mombasa",
    "Cape Town", "Genoa", "Barcelona", "Le Havre", "Oslo",
]

EVENT_TYPES = [
    "underway", "route_changed", "weather", "inspection",
    "port_delay", "stopped", "entered_port", "ais_lost", "piracy",
]

EVENT_DETAILS = [
    "Standard transit waypoint recorded.",
    "Position updated via AIS transponder.",
    "Speed adjustment made due to weather conditions.",
    "Course correction applied — 5 degrees port.",
    "Vessel entered Traffic Separation Scheme.",
    "Checkpoint passed. ETA on schedule.",
    "Minor delay — awaiting berth assignment.",
    "Security watch increased — piracy advisory zone.",
    "Port health clearance obtained.",
    "Crew change completed at anchorage.",
    "Bunkering operation completed successfully.",
    "Engine maintenance carried out at sea.",
    "Cargo inspection by port authorities.",
    "Rough weather encountered — speed reduced.",
    "Pilot boarded for port approach.",
    "Anchor dropped — awaiting berth availability.",
    "Pre-arrival checklist completed.",
    "Security drill conducted per ISPS code.",
    "AIS signal restored after maintenance.",
    "Route updated due to restricted zone ahead.",
]

NOTIF_TYPES = [
    "vessel_update", "voyage_status", "safety_alert",
    "port_congestion", "weather_warning", "piracy_alert",
    "inspection_due", "eta_change", "ais_gap", "cargo_status",
]

NOTIF_MESSAGES = [
    "Vessel {name} has updated its position.",
    "Voyage for {name} status changed to in_transit.",
    "Safety alert issued near {name}'s current position.",
    "Port congestion detected on {name}'s route.",
    "Severe weather warning ahead for {name}.",
    "Piracy advisory issued — {name} rerouting.",
    "Scheduled inspection approaching for vessel {name}.",
    "ETA for {name} has changed by +6 hours.",
    "AIS signal gap detected for {name}.",
    "Cargo loaded on {name} — departure imminent.",
    "{name} has arrived at destination port.",
    "{name} has departed from origin port.",
    "Speed deviation detected for {name}.",
    "{name} is approaching a restricted zone.",
    "Crew alert issued aboard {name}.",
]

ROLES = ["operator"] * 70 + ["analyst"] * 25 + ["admin"] * 5  # 70/25/5 split


def bulk_insert(model, objs, batch=500):
    """Insert in batches of `batch` using bulk_create."""
    total = 0
    for i in range(0, len(objs), batch):
        chunk = objs[i: i + batch]
        created = model.objects.bulk_create(chunk, ignore_conflicts=True)
        total += len(created)
    return total


def rand_name(used: set) -> str:
    """Generate a unique vessel name."""
    for _ in range(1000):
        roman = random.choice(["", " I", " II", " III", " IV", " V", " VI", " VII", " VIII"])
        name = f"{random.choice(PREFIXES)} {random.choice(SUFFIXES)}{roman}"
        if name not in used:
            used.add(name)
            return name
    # Fallback with random 5-digit suffix
    name = f"Vessel {random.randint(10000, 99999)}"
    used.add(name)
    return name


class Command(BaseCommand):
    help = "Mega-seed: 5000 vessels, 1000 users, 100k notifications."

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true",
                            help="Clear existing vessels/notifications/users before seeding")
        parser.add_argument("--vessels", type=int, default=5000)
        parser.add_argument("--users", type=int, default=1000)
        parser.add_argument("--notifications", type=int, default=100_000)

    def handle(self, *args, **options):
        now = timezone.now()
        n_vessels = options["vessels"]
        n_users = options["users"]
        n_notifs = options["notifications"]

        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            Notification.objects.all().delete()
            VesselEvent.objects.all().delete()
            Voyage.objects.all().delete()
            Vessel.objects.all().delete()
            SafetyEvent.objects.all().delete()
            # Delete non-superuser, non-staff users created by seeder
            User.objects.filter(is_superuser=False, is_staff=False,
                                username__startswith="mariner_").delete()
            self.stdout.write(self.style.WARNING("Cleared."))

        # ── 1. PORTS ──────────────────────────────────────────────────────
        self.stdout.write("Ensuring ports exist...")
        ports = list(Port.objects.all())
        if not ports:
            self.stdout.write(self.style.ERROR(
                "No ports found — run seed_large_data first!"))
            return
        self.stdout.write(f"  {len(ports)} ports available.")

        # ── 2. VESSELS ────────────────────────────────────────────────────
        existing_vessels = Vessel.objects.count()
        to_create = max(0, n_vessels - existing_vessels)
        self.stdout.write(
            f"Seeding vessels ({existing_vessels} existing -> target {n_vessels})...")

        used_names: set = set(Vessel.objects.values_list("name", flat=True))
        used_imos: set = set(Vessel.objects.values_list("imo_number", flat=True))

        imo_counter = 8000000
        while str(imo_counter) in used_imos:
            imo_counter += 1

        vessel_batch = []
        for _ in range(to_create):
            while str(imo_counter) in used_imos:
                imo_counter += 1
            imo = str(imo_counter)
            imo_counter += 1
            used_imos.add(imo)

            lat = round(random.uniform(-60.0, 70.0), 4)
            lon = round(random.uniform(-170.0, 170.0), 4)
            vessel_batch.append(Vessel(
                imo_number=imo,
                name=rand_name(used_names),
                vessel_type=random.choice(VESSEL_TYPES),
                flag=random.choice(FLAGS),
                cargo_type=random.choice(CARGO_TYPES),
                operator=random.choice(OPERATORS),
                last_position_lat=lat,
                last_position_lon=lon,
                speed=round(random.uniform(0.0, 24.5), 1),
                heading=random.randint(0, 359),
                destination=random.choice(DESTINATIONS),
                last_update=now - timedelta(minutes=random.randint(1, 300)),
            ))

        created_v = bulk_insert(Vessel, vessel_batch)
        total_vessels = Vessel.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"  {created_v} new vessels. Total: {total_vessels}"))

        vessel_ids = list(Vessel.objects.values_list("id", flat=True))

        # ── 3. VOYAGES ────────────────────────────────────────────────────
        self.stdout.write("Seeding voyages (2 per vessel)...")
        voyage_bulk = []
        status_choices = ["completed", "in_transit", "delayed", "cancelled"]
        for vid in vessel_ids:
            for _ in range(2):
                p_from, p_to = random.sample(ports, 2)
                days_ago = random.randint(2, 90)
                dep = now - timedelta(days=days_ago)
                dur = random.randint(3, 25)
                arr = dep + timedelta(days=dur)
                vstatus = random.choice(status_choices)
                arr_final = None if arr > now else arr
                if arr > now:
                    vstatus = "in_transit"
                voyage_bulk.append(Voyage(
                    vessel_id=vid,
                    port_from=p_from,
                    port_to=p_to,
                    departure_time=dep,
                    arrival_time=arr_final,
                    status=vstatus,
                ))
        created_voyages = bulk_insert(Voyage, voyage_bulk)
        self.stdout.write(self.style.SUCCESS(
            f"  {created_voyages} voyages. Total: {Voyage.objects.count()}"))

        # ── 4. VESSEL EVENTS ──────────────────────────────────────────────
        self.stdout.write("Seeding vessel events (5 per vessel)...")
        event_bulk = []
        for vid in vessel_ids:
            base_lat = round(random.uniform(-60, 70), 4)
            base_lon = round(random.uniform(-170, 170), 4)
            for w in range(5):
                ev_time = now - timedelta(hours=random.randint(1, 1440))
                event_bulk.append(VesselEvent(
                    vessel_id=vid,
                    event_type=random.choice(EVENT_TYPES),
                    location=f"At sea — zone {random.randint(1, 99)}",
                    latitude=round(base_lat + random.uniform(-5, 5), 4),
                    longitude=round(base_lon + random.uniform(-5, 5), 4),
                    timestamp=ev_time,
                    details=random.choice(EVENT_DETAILS),
                ))
        created_events = bulk_insert(VesselEvent, event_bulk)
        self.stdout.write(self.style.SUCCESS(
            f"  {created_events} vessel events. Total: {VesselEvent.objects.count()}"))

        vessel_event_ids = list(
            VesselEvent.objects.values_list("id", flat=True)[:50000])

        # ── 5. USERS ──────────────────────────────────────────────────────
        existing_users = User.objects.count()
        to_create_u = max(0, n_users - existing_users)
        self.stdout.write(
            f"Seeding users ({existing_users} existing -> target {n_users})...")

        existing_usernames: set = set(
            User.objects.values_list("username", flat=True))
        hashed_pw = make_password("Password123!")  # same hash for all — fast

        user_batch = []
        created_user_count = 0
        for i in range(to_create_u):
            uname = f"mariner_{i + 1:05d}"
            if uname in existing_usernames:
                continue
            existing_usernames.add(uname)
            role = random.choice(ROLES)
            user_batch.append(User(
                username=uname,
                email=f"{uname}@maritimevista.com",
                first_name=random.choice([
                    "James", "Maria", "Liu", "Elena", "Ahmed",
                    "Sarah", "Carlos", "Yuki", "Omar", "Priya",
                    "Raj", "Anna", "Wei", "Ivan", "Fatima",
                ]),
                last_name=random.choice([
                    "Smith", "Rodriguez", "Chen", "Ivanova", "Hassan",
                    "Johnson", "Martinez", "Tanaka", "Abdullah", "Patel",
                    "Kumar", "Novak", "Wang", "Petrov", "Al-Rashid",
                ]),
                password=hashed_pw,
                role=role,
                is_verified=True,
                is_active=True,
            ))
            created_user_count += 1

        created_u = bulk_insert(User, user_batch)
        self.stdout.write(self.style.SUCCESS(
            f"  {created_u} new users. Total: {User.objects.count()}"))

        # ── 6. NOTIFICATIONS ──────────────────────────────────────────────
        existing_notifs = Notification.objects.count()
        to_create_n = max(0, n_notifs - existing_notifs)
        self.stdout.write(
            f"Seeding notifications ({existing_notifs} existing -> target {n_notifs})...")

        user_ids = list(User.objects.values_list("id", flat=True))
        if not user_ids:
            self.stdout.write(self.style.ERROR("No users found for notifications!"))
        elif not vessel_ids:
            self.stdout.write(self.style.ERROR("No vessels found for notifications!"))
        else:
            notif_bulk = []
            batch_size = 5000
            total_notif_created = 0

            for i in range(to_create_n):
                vid = random.choice(vessel_ids)
                template = random.choice(NOTIF_MESSAGES)
                # vessel name lookup would be slow — use placeholder
                msg = template.replace("{name}", f"Vessel-{vid}")
                notif_type = random.choice(NOTIF_TYPES)
                evt_id = random.choice(vessel_event_ids) if vessel_event_ids else None

                notif_bulk.append(Notification(
                    user_id=random.choice(user_ids),
                    vessel_id=vid,
                    event_id=evt_id,
                    message=msg,
                    type=notif_type,
                    is_read=random.choice([True, False]),
                    # timestamp is auto_now_add=True, so we omit it for bulk_create
                ))

                # Flush every batch_size to avoid memory issues
                if len(notif_bulk) >= batch_size:
                    created = Notification.objects.bulk_create(
                        notif_bulk, ignore_conflicts=True)
                    total_notif_created += len(created)
                    notif_bulk = []
                    self.stdout.write(
                        f"    ... {total_notif_created:,} notifications inserted so far")

            # Final flush
            if notif_bulk:
                created = Notification.objects.bulk_create(
                    notif_bulk, ignore_conflicts=True)
                total_notif_created += len(created)

            self.stdout.write(self.style.SUCCESS(
                f"  {total_notif_created:,} new notifications. "
                f"Total: {Notification.objects.count():,}"))

        # ── SUMMARY ───────────────────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS(
            f"\n{'=' * 50}\n"
            f"MEGA SEED COMPLETE\n"
            f"{'=' * 50}\n"
            f"  Vessels       : {Vessel.objects.count():>10,}\n"
            f"  Ports         : {Port.objects.count():>10,}\n"
            f"  Voyages       : {Voyage.objects.count():>10,}\n"
            f"  Vessel Events : {VesselEvent.objects.count():>10,}\n"
            f"  Users         : {User.objects.count():>10,}\n"
            f"  Notifications : {Notification.objects.count():>10,}\n"
            f"{'=' * 50}"
        ))
