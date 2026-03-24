"""
Management command: seed_corporate
Usage:
    python manage.py seed_corporate
    python manage.py seed_corporate --clear
    python manage.py seed_corporate --vessels 10000 --users 500 --notifications 50000

Seeds the database with corporate-scale live data:
  - 10,000+ vessels
  - 100  ports
  - 30,000+ voyages
  - 150,000+ vessel events
  - 30    safety events
  - 500   users
  - 50,000 notifications

SQLite Note: Batch sizes are capped at 80 rows to stay within
SQLite's 999-variable limit (fields_per_row * batch_size < 999).
"""
import random
import string
from datetime import timedelta

from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.db.models.signals import post_save
from django.utils import timezone

from apps.authentication.models import User
from apps.notifications.models import Notification
from apps.ports.models import Port
from apps.vessels.models import Vessel, VesselEvent, SafetyEvent, VesselSubscription
from apps.voyages.models import Voyage

# ──────────────────────────────────────────────────────────────────────────────
# SQLite-safe batch size (999 vars / ~12 fields = 83 → use 80)
# ──────────────────────────────────────────────────────────────────────────────
SQLITE_BATCH = 80

# ──────────────────────────────────────────────────────────────────────────────
# REFERENCE DATA
# ──────────────────────────────────────────────────────────────────────────────

VESSEL_TYPES = [
    "Tanker", "Cargo", "Container Ship", "Bulk Carrier",
    "Passenger", "Tug", "Ferry", "Chemical Tanker",
    "LNG Carrier", "Ro-Ro", "Offshore Supply", "Research",
    "Dredger", "Fishing", "Military", "Sailing",
]

CARGO_TYPES = [
    "Crude Oil", "Refined Products", "Chemicals", "Dry Bulk",
    "Containers", "General Cargo", "Liquefied Gas", "Passengers",
    "Vehicle", "Grain", "Coal", "Iron Ore",
    "Timber", "Cement", "Steel", "Livestock",
]

FLAGS = [
    "Panama", "Liberia", "Marshall Islands", "Bahamas",
    "Singapore", "Malta", "Cyprus", "Hong Kong",
    "Greece", "China", "Norway", "United Kingdom",
    "Japan", "Germany", "South Korea", "India",
    "United States", "Turkey", "Denmark", "Netherlands",
    "Belgium", "Italy", "France", "Portugal",
    "Brazil", "Australia", "Canada", "Russia",
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
    "BOURBON Marine", "Solstad Offshore", "Pacific Basin",
    "Diana Shipping", "Safe Bulkers", "Scorpio Tankers",
    "Ardmore Shipping", "Tsakos Navigation", "Navios Maritime",
    "Eagle Bulk Shipping", "Genco Shipping", "Grindrod Shipping",
]

PREFIXES = [
    "MSC", "MV", "MT", "SS", "CMA", "COSCO", "Hapag",
    "Nordic", "Pacific", "Atlantic", "Indian", "Arctic",
    "Global", "Ocean", "Sea", "Marina", "Maersk", "Star",
    "Royal", "Golden", "Silver", "Emerald", "Diamond", "Sapphire",
    "Titan", "Apex", "Summit", "Crest", "Pioneer", "Frontier",
]

SUFFIXES = [
    "Voyager", "Explorer", "Pioneer", "Navigator",
    "Endeavour", "Alliance", "Horizon", "Enterprise",
    "Champion", "Spirit", "Pride", "Freedom", "Victory",
    "Legacy", "Courage", "Destiny", "Fortune", "Prestige",
    "Aurora", "Resolute", "Eagle", "Falcon", "Condor",
    "Titan", "Atlas", "Zeus", "Apollo", "Hermes", "Poseidon",
    "Thetis", "Nereid", "Triton", "Aegean", "Marina",
    "Monarch", "Sovereign", "Regent", "Ascendant", "Meridian",
    "Beacon", "Vanguard", "Pathfinder", "Trailblazer", "Skyline",
    "Pinnacle", "Zenith", "Stellar", "Celestial", "Nova",
]

NUMERICS = ["", " I", " II", " III", " IV", " V", " VI", " VII", " VIII", " IX", " X"]

PORT_DATA = [
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
    ("Port of Sohar", "Gulf of Oman", "Oman", 24.3400, 56.6200),
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
    ("Port of Lagos Apapa", "Gulf of Guinea", "Nigeria", 6.4531, 3.3958),
    ("Port of Mombasa", "Indian Ocean", "Kenya", -4.0435, 39.6682),
    ("Port of Suez", "Red Sea", "Egypt", 29.9668, 32.5498),
    ("Port of Alexandria", "Mediterranean", "Egypt", 31.2001, 29.9187),
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
    ("Port of Mumbai", "Arabian Sea", "India", 18.9220, 72.8347),
    ("Port of Chennai", "Bay of Bengal", "India", 13.0827, 80.2707),
    ("Port of Kolkata", "Hooghly River", "India", 22.5726, 88.3639),
    ("Port of Mundra", "Gulf of Kutch", "India", 22.8398, 69.7024),
    ("Port of Karachi", "Arabian Sea", "Pakistan", 24.8607, 67.0104),
    ("Port of Chittagong", "Bay of Bengal", "Bangladesh", 22.3300, 91.8000),
    ("Port of Fremantle", "Indian Ocean", "Australia", -32.0500, 115.7500),
    ("Port of Sydney", "Pacific Ocean", "Australia", -33.8688, 151.2093),
    ("Port of Melbourne", "Port Phillip Bay", "Australia", -37.8136, 144.9631),
    ("Port of Auckland", "Waitemata Harbour", "New Zealand", -36.8485, 174.7633),
    ("Port of Vladivostok", "Sea of Japan", "Russia", 43.1144, 131.8823),
    ("Port of St Petersburg", "Gulf of Finland", "Russia", 59.9311, 30.3609),
    ("Port of Novorossiysk", "Black Sea", "Russia", 44.7237, 37.7697),
    ("Port of Gdansk", "Baltic Sea", "Poland", 54.3520, 18.6466),
    ("Port of Constanta", "Black Sea", "Romania", 44.1597, 28.6348),
    ("Port of Dakar", "Atlantic Ocean", "Senegal", 14.6928, -17.4467),
    ("Port of Abidjan", "Gulf of Guinea", "Ivory Coast", 5.3536, -4.0083),
    ("Port of Dar es Salaam", "Indian Ocean", "Tanzania", -6.7924, 39.2083),
    ("Port of Casablanca", "Atlantic Ocean", "Morocco", 33.5731, -7.5898),
    ("Port of Tunis", "Mediterranean", "Tunisia", 36.8065, 10.1815),
    ("Port of Aden", "Gulf of Aden", "Yemen", 12.7797, 45.0095),
    ("Port of Muscat", "Arabian Sea", "Oman", 23.6139, 58.5500),
    ("Port of Kuwait", "Arabian Gulf", "Kuwait", 29.3721, 47.9822),
    ("Port of Bahrain", "Arabian Gulf", "Bahrain", 26.0667, 50.5578),
    ("Port of Doha", "Arabian Gulf", "Qatar", 25.2970, 51.5330),
    ("Port of Bandar Abbas", "Strait of Hormuz", "Iran", 27.1832, 56.2666),
    ("Port of Basra", "Shatt al-Arab", "Iraq", 30.5001, 47.7832),
    ("Port of Beirut", "Mediterranean", "Lebanon", 33.8938, 35.5018),
    ("Port of Izmir", "Aegean Sea", "Turkey", 38.4189, 27.1287),
    ("Port of Venice", "Adriatic Sea", "Italy", 45.4408, 12.3155),
    ("Port of Naples", "Tyrrhenian Sea", "Italy", 40.8518, 14.2681),
    ("Port of Bilbao", "Bay of Biscay", "Spain", 43.2632, -2.9340),
    ("Port of Sines", "Atlantic Ocean", "Portugal", 37.9534, -8.8660),
    ("Port of Gothenburg", "Kattegat", "Sweden", 57.7089, 11.9746),
    ("Port of Aarhus", "Kattegat", "Denmark", 56.1572, 10.2107),
    ("Port of Copenhagen", "Oresund", "Denmark", 55.6761, 12.5683),
    ("Port of Tallinn", "Gulf of Finland", "Estonia", 59.4370, 24.7536),
]

SAFETY_EVENTS_DATA = [
    {"event_type": "piracy", "title": "Gulf of Aden Piracy Advisory", "description": "Increased piracy activity. Vessels advised to maintain high vigilance.", "severity": "high", "latitude": 12.0, "longitude": 49.0, "radius_nm": 120.0, "source": "IMB Piracy Reporting Centre"},
    {"event_type": "piracy", "title": "Gulf of Guinea Active Piracy Zone", "description": "Multiple vessel boarding incidents. High threat to crew safety.", "severity": "critical", "latitude": 2.0, "longitude": 2.5, "radius_nm": 200.0, "source": "IMB Piracy Reporting Centre"},
    {"event_type": "storm", "title": "Tropical Cyclone Bay of Bengal", "description": "Sustained winds of 130 knots. All vessels advised to divert immediately.", "severity": "critical", "latitude": 15.5, "longitude": 88.0, "radius_nm": 250.0, "source": "IMD Meteorological Institute"},
    {"event_type": "storm", "title": "Atlantic Hurricane Warning Zone", "description": "Category 4 hurricane moving north-northeast.", "severity": "high", "latitude": 25.0, "longitude": -73.0, "radius_nm": 300.0, "source": "NOAA National Hurricane Center"},
    {"event_type": "restricted", "title": "Strait of Hormuz Military Zone", "description": "Military exercises in progress. Commercial navigation restricted.", "severity": "medium", "latitude": 26.5, "longitude": 56.5, "radius_nm": 40.0, "source": "Defence Authority"},
    {"event_type": "accident", "title": "Container Vessel Aground Suez Canal", "description": "Large container vessel ran aground blocking primary navigation channel.", "severity": "critical", "latitude": 30.7, "longitude": 32.4, "radius_nm": 15.0, "source": "Suez Canal Authority"},
    {"event_type": "restricted", "title": "South China Sea Exclusion Zone", "description": "Territorial waters enforcement exercise.", "severity": "medium", "latitude": 9.5, "longitude": 114.5, "radius_nm": 80.0, "source": "Regional Coast Guard"},
    {"event_type": "storm", "title": "North Sea Severe Weather Alert", "description": "Force 11 storm conditions forecast. Vessels advised to seek shelter.", "severity": "high", "latitude": 56.0, "longitude": 3.0, "radius_nm": 350.0, "source": "UK Met Office"},
    {"event_type": "accident", "title": "Tanker Collision Malacca Strait", "description": "Two tankers collided. Debris field and oil slick active.", "severity": "high", "latitude": 2.5, "longitude": 103.8, "radius_nm": 20.0, "source": "Maritime Port Authority"},
    {"event_type": "other", "title": "Rotterdam Dredging Operations Active", "description": "Waterway depth restrictions. Large draught vessels contact port authority.", "severity": "low", "latitude": 51.95, "longitude": 4.48, "radius_nm": 8.0, "source": "Port of Rotterdam Authority"},
    {"event_type": "piracy", "title": "Malacca Strait Robbery Advisory", "description": "Petty theft incidents on anchored vessels.", "severity": "low", "latitude": 3.5, "longitude": 100.0, "radius_nm": 60.0, "source": "ReCAAP Information Sharing Centre"},
    {"event_type": "storm", "title": "Typhoon Warning Western Pacific", "description": "Super Typhoon with wind speeds exceeding 150 knots.", "severity": "critical", "latitude": 20.0, "longitude": 126.0, "radius_nm": 400.0, "source": "Japan Meteorological Agency"},
    {"event_type": "restricted", "title": "Bosphorus Traffic Restriction", "description": "Northbound traffic suspended for emergency clearance.", "severity": "medium", "latitude": 41.1, "longitude": 28.95, "radius_nm": 10.0, "source": "Turkish Coast Guard"},
    {"event_type": "accident", "title": "Cargo Ship Distress Indian Ocean", "description": "Cargo vessel issued mayday call. SAR operations underway.", "severity": "high", "latitude": -10.0, "longitude": 65.0, "radius_nm": 50.0, "source": "MRCC Mumbai"},
    {"event_type": "restricted", "title": "US Navy Exercise Zone Pacific", "description": "Live-fire exercises. Vessels must stay 50nm clear.", "severity": "medium", "latitude": 20.0, "longitude": -155.0, "radius_nm": 100.0, "source": "US Navy Fleet Command"},
    {"event_type": "storm", "title": "Mediterranean Cyclone Medicane Warning", "description": "Mediterranean tropical-like cyclone. Winds to 85 knots.", "severity": "high", "latitude": 34.5, "longitude": 22.0, "radius_nm": 180.0, "source": "ECMWF Weather Centre"},
    {"event_type": "piracy", "title": "Somali Coast High Risk Zone", "description": "Elevated kidnap-for-ransom risk within 600nm of Somali coast.", "severity": "high", "latitude": 7.5, "longitude": 52.0, "radius_nm": 600.0, "source": "MSCHOA"},
    {"event_type": "accident", "title": "Ferry Capsize Java Sea", "description": "Passenger ferry capsized. Extensive debris field.", "severity": "critical", "latitude": -5.5, "longitude": 106.5, "radius_nm": 10.0, "source": "BASARNAS Indonesia"},
    {"event_type": "restricted", "title": "Arctic Shipping Lane Ice Advisory", "description": "Extensive ice forming on Northern Sea Route. Icebreaker escort mandatory.", "severity": "medium", "latitude": 75.0, "longitude": 50.0, "radius_nm": 500.0, "source": "Arctic MRCC"},
    {"event_type": "storm", "title": "Black Sea Storm Alert", "description": "Force 10 conditions in Black Sea basin.", "severity": "high", "latitude": 43.5, "longitude": 33.0, "radius_nm": 250.0, "source": "Turkish Met Office"},
    {"event_type": "piracy", "title": "Yemen Houthi Missile Attack Zone", "description": "Commercial vessels targeted by anti-ship missile attacks in Red Sea corridor.", "severity": "critical", "latitude": 15.0, "longitude": 42.0, "radius_nm": 300.0, "source": "UKMTO"},
    {"event_type": "restricted", "title": "Kiel Canal Maintenance Closure", "description": "Canal closed for lock maintenance.", "severity": "low", "latitude": 54.3, "longitude": 9.9, "radius_nm": 5.0, "source": "Kiel Canal Authority"},
    {"event_type": "accident", "title": "Bulk Carrier Fire Arabian Sea", "description": "Bulk carrier hold fire reported. Crew evacuated.", "severity": "high", "latitude": 19.0, "longitude": 66.5, "radius_nm": 15.0, "source": "MRCC Oman"},
    {"event_type": "storm", "title": "Typhoon Warning South China Sea", "description": "Category 5 super-typhoon. All vessels to seek safe harbour immediately.", "severity": "critical", "latitude": 16.0, "longitude": 116.0, "radius_nm": 350.0, "source": "HK Observatory"},
    {"event_type": "restricted", "title": "Russian FIR Wartime Exclusion Zone", "description": "Ukrainian war-risk zone. Floating mines and naval interdiction risks.", "severity": "critical", "latitude": 46.5, "longitude": 33.0, "radius_nm": 120.0, "source": "BIMCO Risk Advisory"},
    {"event_type": "accident", "title": "Chemical Spill English Channel", "description": "Tanker breached hull. Chemical cargo leaking. Exclusion zone established.", "severity": "high", "latitude": 50.9, "longitude": 1.4, "radius_nm": 12.0, "source": "CROSS Gris-Nez"},
    {"event_type": "piracy", "title": "West Africa Armed Robbery Zone", "description": "Armed robbery incidents against vessels at anchor.", "severity": "medium", "latitude": 4.5, "longitude": 7.0, "radius_nm": 80.0, "source": "IMB Piracy Centre"},
    {"event_type": "storm", "title": "Tropical Storm Bay of Bengal", "description": "Tropical depression intensifying. Vessels south of 18N advised to monitor closely.", "severity": "medium", "latitude": 13.0, "longitude": 87.0, "radius_nm": 150.0, "source": "IMD Meteorological Agency"},
    {"event_type": "restricted", "title": "China ADIZ Exercise Zone", "description": "Temporary air-sea closure declared. All transiting vessels must register passage.", "severity": "medium", "latitude": 22.0, "longitude": 119.0, "radius_nm": 60.0, "source": "China Maritime Safety Administration"},
    {"event_type": "other", "title": "Singapore Straits Dense Traffic Advisory", "description": "Congestion at peak. Collision risk elevated. Proceed at safe speed.", "severity": "low", "latitude": 1.2, "longitude": 104.0, "radius_nm": 30.0, "source": "MPA Singapore"},
]

DESTINATIONS = [
    "Rotterdam", "Singapore", "Shanghai", "Busan", "Antwerp", "Hamburg", "Hong Kong",
    "Los Angeles", "Long Beach", "Dubai", "Ningbo", "Guangzhou", "Tianjin", "Port Klang",
    "Felixstowe", "New York", "Savannah", "Seattle", "Santos", "Chennai", "Colombo",
    "Piraeus", "Valencia", "Tanjung Pelepas", "Kaohsiung", "Tokyo", "Yokohama", "Kobe",
    "Mumbai", "Jakarta", "Durban", "Cape Town", "Mombasa", "Suez", "Istanbul",
    "Marseille", "Barcelona", "Genoa", "Lisbon", "Oslo",
]

EVENT_TYPES = [
    "underway", "route_changed", "weather", "inspection",
    "port_delay", "stopped", "entered_port", "ais_lost", "piracy",
    "accident", "other",
]

EVENT_DETAIL_TEMPLATES = [
    "Standard transit waypoint recorded. AIS signal confirmed.",
    "Position updated via AIS Class A transponder. All systems nominal.",
    "Speed adjustment made due to adverse weather conditions.",
    "Course correction applied of 7 degrees to starboard.",
    "Vessel entered Traffic Separation Scheme zone.",
    "Checkpoint passed. ETA to destination on schedule.",
    "Minor delay — awaiting berth assignment at destination.",
    "Security watch increased — piracy advisory zone active.",
    "Port health clearance and inward clearance documents obtained.",
    "Crew change completed at anchorage. 14 crew relieved.",
    "Bunkering operations completed. Fuel levels nominal.",
    "AIS signal resumed after temporary communications failure.",
    "Vessel speed reduced to conserve fuel as per voyage charter instructions.",
    "Weather routing advisory followed — course deviation 45nm.",
    "Port state control inspection completed — zero deficiencies.",
    "Engine room maintenance completed. Machinery running optimally.",
    "Draft survey conducted. Cargo quantity verified against bill of lading.",
    "Pilot embarked for port approach. Vessel proceeding to berth.",
    "Cargo discharge operations commenced at destination terminal.",
    "Vessel cleared customs and immigration at port of entry.",
]

NOTIFICATION_TEMPLATES = [
    "Position update received for {vessel}. Current speed: {speed} knots.",
    "Vessel {vessel} has entered port at {destination}.",
    "Alert: {vessel} AIS signal lost. Last contact {time} ago.",
    "{vessel} has deviated from planned route. New heading recorded.",
    "Port delay notification: {vessel} waiting for berth at {destination}.",
    "Safety advisory: {vessel} operating near active piracy zone.",
    "Vessel {vessel} speed anomaly detected. Current speed: {speed} knots.",
    "{vessel} has departed {destination}. ETA to next port calculated.",
    "Weather alert: {vessel} navigating through high-severity storm zone.",
    "Subscription vessel {vessel} changed destination to {destination}.",
    "Routine position report: {vessel} at {position}, heading {heading}.",
    "Cargo status update: {vessel} completed loading operations.",
    "{vessel} has successfully completed voyage. All cargo delivered.",
    "Maintenance flag raised for {vessel}. Scheduled inspection pending.",
    "Crew change completed for {vessel} at {destination}.",
]

FIRST_NAMES = ["James", "Sarah", "Michael", "Emma", "Robert", "Olivia", "William", "Sophia",
               "John", "Ava", "David", "Isabella", "Richard", "Mia", "Charles", "Charlotte",
               "Thomas", "Amelia", "Christopher", "Harper", "Daniel", "Evelyn", "Matthew"]

LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
              "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris",
              "Martin", "Thompson", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis"]


def rand_vessel_name(used):
    for _ in range(1000):
        name = f"{random.choice(PREFIXES)} {random.choice(SUFFIXES)}{random.choice(NUMERICS)}"
        if name not in used:
            used.add(name)
            return name
    rand_str = ''.join(random.choices(string.digits, k=5))
    return f"Vessel {rand_str}"


def make_username(i):
    return f"{random.choice(FIRST_NAMES).lower()}.{random.choice(LAST_NAMES).lower()}{i}"


def bulk_insert(model, buffer, batch_size=SQLITE_BATCH):
    """Insert a list of model objects in SQLite-safe batches."""
    for i in range(0, len(buffer), batch_size):
        chunk = buffer[i:i + batch_size]
        model.objects.bulk_create(chunk, ignore_conflicts=True)


def chunked_delete(queryset, chunk_size=500):
    """Delete a queryset in ID batches to avoid SQLite variable limit."""
    while True:
        ids = list(queryset.values_list('id', flat=True)[:chunk_size])
        if not ids:
            break
        queryset.model.objects.filter(id__in=ids).delete()


class Command(BaseCommand):
    help = "Seeds corporate-scale live data: 10,000+ vessels, 100 ports, events, and notifications."

    def add_arguments(self, parser):
        parser.add_argument("--clear", action="store_true", help="Clear existing data before seeding")
        parser.add_argument("--vessels", type=int, default=10000, help="Number of vessels to seed")
        parser.add_argument("--users", type=int, default=500, help="Number of additional users")
        parser.add_argument("--notifications", type=int, default=50000, help="Total notifications to generate")

    def handle(self, *args, **options):
        now = timezone.now()
        vessel_target = options["vessels"]
        user_target = options["users"]
        notif_target = options["notifications"]

        # ── 0. DISCONNECT SIGNALS during seeding to avoid auto-notification cascade ──
        from apps.vessels import signals as vessel_signals
        post_save.disconnect(vessel_signals.notify_vessel_subscribers, sender=VesselEvent)
        self.stdout.write("  Signal 'notify_vessel_subscribers' disconnected for seeding.")

        try:
            if options["clear"]:
                self.stdout.write("Clearing all existing data (chunked)...")
                chunked_delete(Notification.objects.all())
                chunked_delete(VesselSubscription.objects.all())
                chunked_delete(VesselEvent.objects.all())
                chunked_delete(Voyage.objects.all())
                chunked_delete(SafetyEvent.objects.all())
                chunked_delete(Vessel.objects.all())
                chunked_delete(Port.objects.all())
                chunked_delete(User.objects.filter(is_superuser=False))
                self.stdout.write(self.style.WARNING("All non-superuser data cleared."))

            # ── 1. PORTS ──────────────────────────────────────────────────────
            self.stdout.write("Seeding world ports...")
            port_objs = []
            for name, location, country, lat, lon in PORT_DATA:
                port, _ = Port.objects.get_or_create(
                    name=name,
                    defaults={
                        "location": location,
                        "country": country,
                        "congestion_score": round(random.uniform(5.0, 98.0), 1),
                        "avg_wait_time": round(random.uniform(2.0, 96.0), 1),
                        "arrivals": random.randint(10, 120),
                        "departures": random.randint(8, 115),
                        "last_update": now - timedelta(minutes=random.randint(1, 60)),
                    },
                )
                port_objs.append(port)
            self.stdout.write(f"  {Port.objects.count()} ports in DB.")

            # ── 2. VESSELS ────────────────────────────────────────────────────
            self.stdout.write(f"Seeding {vessel_target:,} vessels...")
            existing_imos = set(Vessel.objects.values_list("imo_number", flat=True))
            existing_names = set(Vessel.objects.values_list("name", flat=True))
            existing_count = Vessel.objects.count()
            to_create = max(0, vessel_target - existing_count)

            imo_counter = 9000000
            while str(imo_counter) in existing_imos:
                imo_counter += 1

            buffer = []
            vessels_created = 0
            for i in range(to_create):
                while str(imo_counter) in existing_imos:
                    imo_counter += 1
                imo = str(imo_counter)
                imo_counter += 1
                existing_imos.add(imo)

                buffer.append(Vessel(
                    imo_number=imo,
                    name=rand_vessel_name(existing_names),
                    vessel_type=random.choice(VESSEL_TYPES),
                    flag=random.choice(FLAGS),
                    cargo_type=random.choice(CARGO_TYPES),
                    operator=random.choice(OPERATORS),
                    last_position_lat=round(random.uniform(-70.0, 80.0), 4),
                    last_position_lon=round(random.uniform(-179.9, 179.9), 4),
                    speed=round(random.uniform(0.0, 26.0), 1),
                    heading=random.randint(0, 359),
                    destination=random.choice(DESTINATIONS),
                    last_update=now - timedelta(minutes=random.randint(1, 240)),
                ))

                if len(buffer) >= SQLITE_BATCH:
                    bulk_insert(Vessel, buffer)
                    vessels_created += len(buffer)
                    buffer = []
                    if vessels_created % 1000 == 0:
                        self.stdout.write(f"    {vessels_created:,} vessels inserted...")

            if buffer:
                bulk_insert(Vessel, buffer)
                vessels_created += len(buffer)

            vessel_objs = list(Vessel.objects.all())
            self.stdout.write(f"  Total vessels: {len(vessel_objs):,}")

            # ── 3. USERS ──────────────────────────────────────────────────────
            self.stdout.write(f"Seeding {user_target:,} users...")
            existing_usernames = set(User.objects.values_list("username", flat=True))
            user_buffer = []
            hashed_pw = make_password("Corporate@2024")
            roles = ["operator", "analyst", "admin"]

            for i in range(user_target):
                uname = make_username(i)
                if uname in existing_usernames:
                    uname = f"{uname}_{i}"
                existing_usernames.add(uname)
                user_buffer.append(User(
                    username=uname,
                    email=f"{uname}@maritimevista.com",
                    password=hashed_pw,
                    role=random.choice(roles),
                    is_active=True,
                ))
                if len(user_buffer) >= SQLITE_BATCH:
                    bulk_insert(User, user_buffer)
                    user_buffer = []

            if user_buffer:
                bulk_insert(User, user_buffer)

            self.stdout.write(f"  Total users: {User.objects.count():,}")

            # ── 4. VESSEL SUBSCRIPTIONS ───────────────────────────────────────
            self.stdout.write("Creating vessel subscriptions (10 per user, sampled)...")
            all_users = list(User.objects.filter(is_superuser=False)[:200])
            vessel_sample = random.sample(vessel_objs, min(1000, len(vessel_objs)))
            sub_set = set(VesselSubscription.objects.values_list("user_id", "vessel_id"))
            sub_buffer = []
            for u in all_users:
                for v in random.sample(vessel_sample, min(10, len(vessel_sample))):
                    key = (u.id, v.id)
                    if key not in sub_set:
                        sub_set.add(key)
                        sub_buffer.append(VesselSubscription(user=u, vessel=v))
            bulk_insert(VesselSubscription, sub_buffer)
            self.stdout.write(f"  {VesselSubscription.objects.count():,} subscriptions total.")

            # ── 5. VOYAGES + VESSEL EVENTS ────────────────────────────────────
            self.stdout.write("Seeding voyages and vessel events (2-4 per vessel)...")
            status_choices = ["completed", "in_transit", "delayed", "cancelled"]
            voyage_buffer = []
            event_buffer = []
            voyages_created = 0
            events_created = 0

            for idx, vessel in enumerate(vessel_objs):
                n_voyages = random.randint(2, 4)
                for _ in range(n_voyages):
                    p_from, p_to = random.sample(port_objs, 2)
                    days_ago = random.randint(1, 90)
                    dep_time = now - timedelta(days=days_ago)
                    dur = timedelta(days=random.randint(2, 28))
                    arr_time = dep_time + dur
                    vstatus = random.choice(status_choices)
                    if arr_time > now:
                        arr_time = None
                        vstatus = "in_transit"

                    voyage_buffer.append(Voyage(
                        vessel=vessel,
                        port_from=p_from,
                        port_to=p_to,
                        departure_time=dep_time,
                        arrival_time=arr_time,
                        status=vstatus,
                    ))
                    voyages_created += 1

                    # Vessel events for this voyage (no signal firing)
                    n_events = random.randint(3, 6)
                    base_lat = vessel.last_position_lat or 0.0
                    base_lon = vessel.last_position_lon or 0.0
                    for w in range(n_events):
                        ev_time = dep_time + timedelta(hours=random.randint(6, 48) * (w + 1))
                        if arr_time and ev_time > arr_time:
                            break
                        if ev_time > now:
                            break
                        event_buffer.append(VesselEvent(
                            vessel=vessel,
                            event_type=random.choice(EVENT_TYPES),
                            location=f"At sea, near {p_from.country}",
                            latitude=round(base_lat + random.uniform(-12.0, 12.0), 4),
                            longitude=round(base_lon + random.uniform(-12.0, 12.0), 4),
                            timestamp=ev_time,
                            details=random.choice(EVENT_DETAIL_TEMPLATES),
                        ))
                        events_created += 1

                    if len(voyage_buffer) >= SQLITE_BATCH:
                        bulk_insert(Voyage, voyage_buffer)
                        voyage_buffer = []

                    if len(event_buffer) >= SQLITE_BATCH:
                        bulk_insert(VesselEvent, event_buffer)
                        event_buffer = []

                if idx % 1000 == 0:
                    self.stdout.write(f"    Processed {idx:,} / {len(vessel_objs):,} vessels for voyages...")

            if voyage_buffer:
                bulk_insert(Voyage, voyage_buffer)
            if event_buffer:
                bulk_insert(VesselEvent, event_buffer)

            self.stdout.write(f"  {voyages_created:,} voyages, {events_created:,} vessel events created.")

            # ── 6. SAFETY EVENTS ──────────────────────────────────────────────
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
                        "active_from": now - timedelta(days=random.randint(1, 30)),
                        "active_until": now + timedelta(days=random.randint(2, 14)),
                        "is_active": True,
                    },
                )
                if created:
                    safety_created += 1
            self.stdout.write(f"  {SafetyEvent.objects.count()} total safety events ({safety_created} new).")

            # ── 7. NOTIFICATIONS ──────────────────────────────────────────────
            self.stdout.write(f"Generating {notif_target:,} notifications...")
            all_users_for_notif = list(User.objects.filter(is_superuser=False))
            if not all_users_for_notif:
                self.stdout.write(self.style.WARNING("  No users found — skipping notifications."))
            else:
                subscribed_vessels = {}
                for sub in VesselSubscription.objects.select_related("vessel", "user").all():
                    subscribed_vessels.setdefault(sub.user_id, []).append(sub.vessel)

                notif_buffer = []
                notifs_created = 0
                vessel_pool = vessel_objs[:2000] if len(vessel_objs) > 2000 else vessel_objs

                for _ in range(notif_target):
                    user = random.choice(all_users_for_notif)
                    user_vessels = subscribed_vessels.get(user.id, [])
                    vessel = random.choice(user_vessels) if user_vessels else random.choice(vessel_pool)

                    tpl = random.choice(NOTIFICATION_TEMPLATES)
                    speed = round(random.uniform(0, 25), 1)
                    lat = round(random.uniform(-60, 70), 2)
                    lon = round(random.uniform(-170, 170), 2)
                    hrs = random.randint(1, 24)
                    msg = tpl.format(
                        vessel=vessel.name,
                        speed=speed,
                        destination=vessel.destination or "Unknown Port",
                        position=f"{lat}N, {lon}E",
                        time=f"{hrs}h",
                        heading=vessel.heading or 0,
                    )

                    notif_buffer.append(Notification(
                        user=user,
                        vessel=vessel,
                        message=msg,
                        type="position_update",
                        is_read=random.random() < 0.45,
                    ))

                    if len(notif_buffer) >= SQLITE_BATCH:
                        bulk_insert(Notification, notif_buffer)
                        notifs_created += len(notif_buffer)
                        notif_buffer = []
                        if notifs_created % 5000 == 0:
                            self.stdout.write(f"    {notifs_created:,} notifications inserted...")

                if notif_buffer:
                    bulk_insert(Notification, notif_buffer)
                    notifs_created += len(notif_buffer)

        finally:
            # ── RECONNECT SIGNAL ──────────────────────────────────────────────
            post_save.connect(vessel_signals.notify_vessel_subscribers, sender=VesselEvent)
            self.stdout.write("  Signal 'notify_vessel_subscribers' reconnected.")

        # ── FINAL SUMMARY ─────────────────────────────────────────────────────
        self.stdout.write(self.style.SUCCESS(
            f"\nCorporate data seeding complete!\n"
            f"{'='*47}\n"
            f"  Vessels       : {Vessel.objects.count():>10,}\n"
            f"  Ports         : {Port.objects.count():>10,}\n"
            f"  Voyages       : {Voyage.objects.count():>10,}\n"
            f"  Vessel Events : {VesselEvent.objects.count():>10,}\n"
            f"  Safety Events : {SafetyEvent.objects.count():>10,}\n"
            f"  Users         : {User.objects.count():>10,}\n"
            f"  Subscriptions : {VesselSubscription.objects.count():>10,}\n"
            f"  Notifications : {Notification.objects.count():>10,}\n"
            f"{'='*47}\n"
        ))
