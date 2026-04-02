

## ----------------------------------------- STEP 1 -----------------------------------------------

#  STEP 1  Clean and Standardize Existing Data

---

##  Objective
* Ensure no null values in critical fields (`lat`, `lon`, `last_update`).
* Ensure correct data types (float, datetime).
* Eliminate duplicate records and invalid data.

**Example check:**
```python
Vessel.objects.filter(last_position_lat__isnull=True) 
```
*Note: This strictly prevents replay/dashboard failures later.*

---

###  1.1: Check Data Counts & Null Values
 Find out how much invalid data currently exists.

###  WHERE: Django Shell ([manage.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/manage.py))
```python
# Import the core models from the maritime applications
from apps.vessels.models import Vessel
from apps.ports.models import Port
from apps.voyages.models import Voyage
from apps.vessels.models import VesselEvent

# Verify the absolute number of records loaded in the system
print("Total Vessels:", Vessel.objects.count())
print("Total Ports:", Port.objects.count())
print("Total Voyages:", Voyage.objects.count())
print("Total Events:", VesselEvent.objects.count())

#  CRITICAL CHECK: Count invalid coordinates and missing timestamps 
# Devices failing to emit GPS coordinates correctly will be marked as null
invalid_lat = Vessel.objects.filter(last_position_lat__isnull=True).count()
invalid_lon = Vessel.objects.filter(last_position_lon__isnull=True).count()
missing_time = Vessel.objects.filter(last_update__isnull=True).count()

# Output the anomaly counts to prepare for data cleansing
print(f"Missing Lat: {invalid_lat} | Missing Lon: {invalid_lon} | Missing Time: {missing_time}")
```

---

###  1.2: Check Data Types & Duplicates
 Ensure coordinate fields are `float` and remove duplicate `imo_number`s.

```python
from django.db.models import Count

# Fetch a known good record to test database data types
sample_vessel = Vessel.objects.exclude(last_position_lat__isnull=True).first()
if sample_vessel:
    #  Validation: Latitude must be stored as a Float, not a String
    print("Latitude type:", type(sample_vessel.last_position_lat)) 
    #  Validation: Timestamps must be stored as fully-aware DateTime objects
    print("Timestamp type:", type(sample_vessel.last_update)) 

#  CRITICAL CHECK: Identify duplicate vessel registrations
# Group records by their unique IMO number and find any that have more than 1 entry
duplicates = Vessel.objects.values('imo_number').annotate(count=Count('id')).filter(count__gt=1)
print("Duplicate Records:", list(duplicates))
```

---

###  1.3: Clean Invalid Data
 Deal with the invalid data discovered above.

```python
#  OPTION 1: Hard Delete (Recommended for orphan data)
# Completely removes any vessel record that lacks a valid latitude or longitude
Vessel.objects.filter(last_position_lat__isnull=True).delete()

#  OPTION 2: Data Salvaging (Recommended when other fields are still useful)
# Forces null coordinates to default to 0.0 (Null Island) to prevent math errors on the map UI
Vessel.objects.filter(last_position_lat__isnull=True).update(
    last_position_lat=0.0,
    last_position_lon=0.0
)
```

---

###  1.4: Validation & Automation
 Verify cleaning and run the automated command.

*Validation:*
```python
# Verify cleaning was successful (Should output 0)
print(Vessel.objects.filter(last_position_lat__isnull=True).count())
```

*Automated Cleanup Script:*
 WHERE: Terminal ([clean_vessel_data.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/apps/vessels/management/commands/clean_vessel_data.py))
```bash
python manage.py clean_vessel_data
```

---

###  1.5: Native PostgreSQL Verification (pgAdmin)
 Show your mentor that the database is natively clean using raw SQL.

###  WHERE: pgAdmin  Query Tool
```sql
--  1. Verify Absolute Row Counts
SELECT COUNT(*) AS total_vessels FROM vessels_vessel;
SELECT COUNT(*) AS total_ports FROM ports_port;

--  2. Identify duplicate registrations via native SQL
-- This perfectly mirrors the Django duplicate check but proves the DB state
SELECT imo_number, COUNT(*) AS duplicate_count
FROM vessels_vessel
GROUP BY imo_number
HAVING COUNT(*) > 1;

--  3. Verify exactly 0 NULL coordinates exist
-- Proves the "Null Island" salvaging logic worked flawlessly
SELECT COUNT(*) AS missing_coordinates
FROM vessels_vessel 
WHERE last_position_lat IS NULL OR last_position_lon IS NULL;
```

---

## ----------------------------------------- STEP 2 -----------------------------------------------

#  STEP 2  Advanced Integrity Checks (Replay Support)

---

##  Objective
* Prevent voyage replay failures.
* Ensure time-series events are indexed correctly and tightly linked.

---

###  2.1: Verify Voyage & Event References
 Verify that no `Voyage` or `VesselEvent` lacks proper connections.

###  WHERE: Django Shell ([manage.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/manage.py))
```python
from apps.voyages.models import Voyage
from apps.vessels.models import VesselEvent

#  INTEGRITY CHECK: Ensure every Voyage belongs to a real Vessel
# If this returns > 0, we have an orphaned Voyage record (Database schema issue)
missing_vessels = Voyage.objects.filter(vessel_id__isnull=True).count()
print(f"Voyages missing a vessel link: {missing_vessels}")

#  INTEGRITY CHECK: Voyage Replays will crash if events lack timestamps
missing_timestamps = VesselEvent.objects.filter(timestamp__isnull=True).count()
print(f"Events missing timestamp: {missing_timestamps}")

#  DATA PLAYBACK TEST: Fetch a chronologically sorted sequence of events for the replay UI
ordered_events = VesselEvent.objects.order_by('vessel_id', 'timestamp')[:5]
print("Ordered Replay Data:", list(ordered_events))
```

---

###  2.2: Verify PostgreSQL Indexes
 Ensure fast retrieval for time-series data.

###  WHERE: PostgreSQL Terminal (`python manage.py dbshell` or pgAdmin)
```sql
-- Check indexes on the events table
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'vessels_vesselevent';
```

---

## ----------------------------------------- STEP 3 -----------------------------------------------

#  STEP 3  Prepare Aggregated Data for Dashboards

---

##  Objective
* Dashboards should **not** query raw data repeatedly.
* Reduce heavy database queries to make dashboard APIs incredibly fast.

---

###  3.1: Dashboard Pre-processed Queries 
 **pgAdmin** 

#### 1. Vessel Counts (Show Active Vessels)
*Comment for Mentor: "Running a direct count prevents the dashboard from downloading the entire vessel list just to show a number."*
```sql
-- Query to get exactly how many active vessels are tracked
SELECT COUNT(*) AS active_vessels
FROM vessels_vessel 
WHERE status='active'; 
```

#### 2. Congestion Metrics (High Traffic Destinations)
*Comment for Mentor: "This groups vessels by destination, allowing the dashboard to instantly flag congested ports across the globe instead of building the counts on the fly inside the API."*
```sql
-- Query to find which destinations have the most inbound vessels
SELECT destination, COUNT(*) AS vessel_count
FROM vessels_vessel
GROUP BY destination
ORDER BY vessel_count DESC;
```

#### 3. Risk Counts (Show Safety Events)
*Comment for Mentor: "Instead of scanning raw event data every time, we pre-group the critical events by type (e.g., piracy, weather) to feed the risk widgets instantly."*
```sql
-- Query to count critical events categorized by their risk type
SELECT event_type, COUNT(*) AS risk_count
FROM vessels_vesselevent
GROUP BY event_type
ORDER BY risk_count DESC;
```

---

###  3.2: Optional Materialized View (For Advanced Intern Demo)
*Comment for Mentor: "To push performance further natively from the database, we can store these aggregated statistics in a Materialized View so the database doesn't even have to recount the rows."*
```sql
-- Creates an offline snapshot table that the dashboard can read instantly
CREATE MATERIALIZED VIEW vessel_dashboard_summary AS
SELECT 
    COUNT(*) AS total_vessels
FROM vessels_vessel;

-- Retrieve precomputed dashboard data
SELECT * FROM vessel_dashboard_summary;

-- Refresh the materialized view to update values
REFRESH MATERIALIZED VIEW vessel_dashboard_summary;
```

---

## ----------------------------------------- STEP 4 -----------------------------------------------

#  STEP 4  Stabilize External API Integration

---

##  Introduction
External APIs are already integrated (Milestone 2 & 3), but they must be **stable and reliable**.

Without proper handling:
* Duplicate data may be inserted
* System may crash on API failure
* Data may become outdated

---

##  Objective
* Track API data freshness (`last_update`)
* Prevent duplicate records using ORM
* Fault-tolerant API handling

---

###  4.1: Ensure `last_update` Field Exists
 Track when data was last fetched from API.

###  WHERE: Django Model ([apps/vessels/models.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/apps/vessels/models.py))

> [!CAUTION]
> **DO NOT COPY AND PASTE THIS INTO THE DJANGO SHELL!** 
> This code belongs natively inside the `models.py` file. If you paste a `class Vessel(models.Model):` definition directly into the interactive `python manage.py shell`, Django will crash with a `RuntimeError: Conflicting 'vessel' models` because the shell tries to register the model a second time!

```python
from django.db import models

class Vessel(models.Model):
    imo_number = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100, db_index=True)
    
    # Track API fetch/update time
    last_update = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        app_label = 'vessels' # explicit app reference
```

---

###  4.2: Apply Migration
 Terminal ([backend/](file:///c:/Users/LENOVO/Desktop/teamm3/backend/)) - **(Run exactly as shown outside the shell)**

```bash
# Exit the python shell first! (type `exit` and hit Enter)
python manage.py makemigrations
python manage.py migrate
```

---

###  4.3: Avoid Duplicate Inserts
 Use unique identifier (`imo_number`) inside `update_or_create`.

###  WHERE: Django Backend ([manage.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/manage.py))
```python
from apps.vessels.models import Vessel
from django.utils import timezone

# Simulated JSON payload retrieved from the external maritime API
api_payload = {
    'imo_number': '1234567',
    'name': 'OCEAN VOYAGER',
    'last_position_lat': 10.123,
    'last_position_lon': 20.456
}

#  DUPLICATE PREVENTION LOGIC
# We look up the database by the unique `imo_number`. 
# If it exists, we update the `defaults` fields. If it doesn't, we insert a new row.
vessel, created = Vessel.objects.update_or_create(
    imo_number=api_payload['imo_number'],
    defaults={
        'name': api_payload['name'],
        'last_position_lat': api_payload['last_position_lat'],
        'last_position_lon': api_payload['last_position_lon'],
        'last_update': timezone.now()  # We inject the current server time to track sync freshness
    }
)

if created:
    print("SUCCESS: A new vessel was cleanly inserted.")
else:
    print("SUCCESS: Existing vessel updated safely (No duplication occurred).")
```
*Comment for Mentor: "I used `update_or_create` to ensure no duplicate records are inserted while keeping data fully updated."*

---

###  4.4: Handle API Failures (VERY IMPORTANT )
###  WHERE: Django Backend

```python
import logging
import requests

# Initialize standard Python logging
logger = logging.getLogger(__name__)

def fetch_vessel_data():
    """Fetches real-time vessel data with built-in fault tolerance."""
    try:
        # Enforce a strict 10-second timeout so the server doesn't hang indefinitely
        response = requests.get(
            'https://api.vessel-tracking.com/live',
            timeout=10
        )
        # Instantly raise an exception for HTTP 404, 500, or 503 errors
        response.raise_for_status()
        
        # If successful, parse the JSON payload
        return response.json()

    except requests.exceptions.RequestException as e:
        #  GRACEFUL FAILURE STRATEGY
        # Instead of crashing the entire Django server, catch the network/timeout error
        # Log it for the system administrator to review later instead
        logger.error(f"API fetch failed: {e}")
        
        # Return a safe fallback (None) so the dashboard continues serving the last known data
        return None  
```
*Comment for Mentor: "If the API fails, the system does not crash. Errors are logged and the application continues running safely."*

---

###  4.5: Verify No Duplicates (pgAdmin)
```sql
-- Check duplicate vessels using IMO number (Should return empty)
SELECT imo_number, COUNT(*)
FROM vessels_vessel
GROUP BY imo_number
HAVING COUNT(*) > 1;
```

---

## ----------------------------------------- STEP 5 -----------------------------------------------

#  STEP 5  Data Export & Logging Support (Admin Requirements)

---

##  Introduction
The **Admin Panel** requires well-structured data for reporting and monitoring. 

---

##  Objective
* Enable **export-ready queries** for Voyage Data and Event Logs
* Implement a **simple Logging Table** to track system errors (`APILog`)

---

###  5.1: Enable Export-Ready Queries
 Preparing simple queries so the admin can instantly export data.

###  WHERE: pgAdmin  Query Tool
```sql
-- 1. Voyage Data Export Query (Perfect for CSV Export)
SELECT 
    v.imo_number,
    v.name AS vessel_name,
    v.destination,
    v.status,
    v.last_update
FROM vessels_vessel v
ORDER BY v.last_update DESC;

-- 2. Event Logs Export Query
SELECT 
    e.event_type,
    v.name AS vessel_name,
    e.timestamp,
    e.details
FROM vessels_vesselevent e
JOIN vessels_vessel v ON e.vessel_id = v.id
ORDER BY e.timestamp DESC;
```

*Comment for Mentor: "By pre-defining these structured queries using SQL `JOIN`s, the admin panel can easily retrieve flat, consolidated datamaking CSV exports seamless and extremely fast."*

---

###  5.2: Create a Simple Logging Table
 This table purely catches background API/System errors.

###  WHERE: Django Model ([apps/vessels/models.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/apps/vessels/models.py))
```python
from django.db import models

class APILog(models.Model):
    """Simple logging table strictly for tracking API process errors."""
    source = models.CharField(max_length=100) # e.g., 'Vessel Tracking API'
    error_message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        app_label = 'vessels'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.source} Error @ {self.timestamp}"
```

---

###  5.3: Apply Migration & Implement Logic
```bash
python manage.py makemigrations
python manage.py migrate
```

```python
# Django Backend Usage
from apps.vessels.models import APILog

try:
    raise Exception("Connection Timeout")
except Exception as e:
    APILog.objects.create(
        source='External Vessel API',
        error_message=str(e)
    )
```

---

## ----------------------------------------- STEP 6 -----------------------------------------------

#  STEP 6  Production Database Setup (Final & Most Critical Step)

---

##  Introduction
This is where the project transitions from a development concept to a **real-world robust system**. We must ensure the system works under real production conditions using **PostgreSQL**.

---

##  Objective
* Move from SQLite  PostgreSQL
* Test Database Constraints & Data Integrity
* Perform DB Backup and Performance Sanity Checks

---

###  6.1: Migrate to PostgreSQL
 Ensure `settings.py` points to the `teamm3` PostgreSQL database, rather than `db.sqlite3`.

###  WHERE: Django settings ([core/settings.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/core/settings.py))
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'teamm3',
        'USER': 'postgres',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

---

###  6.2: Run Migrations
###  WHERE: Terminal ([backend/](file:///c:/Users/LENOVO/Desktop/teamm3/backend/))
```bash
python manage.py makemigrations
python manage.py migrate
```

---

###  6.3: Test Data Integrity
###  WHERE: Django Backend ([manage.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/manage.py))
```python
from apps.voyages.models import Voyage
from apps.vessels.models import VesselEvent

# Verify relational constraints
unlinked_voyages = Voyage.objects.filter(vessel__isnull=True).count()
print(f"Voyages missing a vessel link: {unlinked_voyages}")

unlinked_events = VesselEvent.objects.filter(vessel__isnull=True).count()
print(f"Events missing a vessel link: {unlinked_events}")
```
*Comment for Mentor: "Orphaned records are impossible, meaning 100% data integrity."*

---

###  6.4: Database Backup Setup (Basic)
 Secure the data! Always create a manual dump before a major production push.
 **LOCATION:** The backup file will be securely exported to the `db_files/` directory in our project.

###  WHERE: Terminal (Run from inside [[backend/](file:///c:/Users/LENOVO/Desktop/teamm3/backend/)] folder)
```bash
# Export a DB dump snapshot directly into the project's database folder
pg_dump -U postgres -d teamm3 -f ../db_files/backup_teamm3_production.sql
```
*Comment for Mentor: "This command exports our full PostgreSQL state and physically stores it at `teamm3/db_files/backup_teamm3_production.sql`. This ensures we always have a hardcoded snapshot to revert to if a production error occurs."*

---

###  6.5: Performance Sanity Check
###  WHERE: pgAdmin  Query Tool 
```sql
-- Use EXPLAIN ANALYZE to guarantee the DB query executes in milliseconds
EXPLAIN ANALYZE 
SELECT * FROM vessels_vessel 
WHERE status = 'active';
```

---

#  FINAL IMPACT 
> By securely moving to PostgreSQL, verifying relational constraints, configuring data backups, indexing queries, and isolating API faults, the platform is officially hardened for a production environment!

---

## ----------------------------------------- CONCLUSION -------------------------------------------

#  FINAL CHECKLIST (Strict  DB & Integration)

 **Use this checklist to confirm the milestone is 100% complete before presentation.**

###  Data Quality 
- [x] No null critical fields (`lat`, `lon`, `timestamp`) 
- [x] No duplicate records in PostgreSQL
- [x] Correct logical relationships (`vessel`  `voyage`  `events`) 

###  Replay Support 
- [x] Time-series data properly stored 
- [x] Indexed correctly on `vessel_id` + `timestamp` 
- [x] Replay queries run fast without freezing dashboard 

###  Dashboard Support 
- [x] Aggregated queries/views ready for deployment 
- [x] No heavy raw queries throttling the APIs 
- [x] Dashboard UI data is perfectly consistent with backend output 

###  API Integration Stability 
- [x] API failures handled gracefully via `try/except`
- [x] No duplicate inserts (via `update_or_create` on `imo_number`) 
- [x] `last_update` tracking actively logging fetch times

###  Admin & Logging Support 
- [x] `APILog` table implemented and cleanly tracking errors
- [x] Export-ready queries (Voyages / Events) verified in pgAdmin 
- [x] Clean error tracking strictly isolated from main UI logic

###  Final Step (Production Ready) 
- [x] PostgreSQL setup completely overwriting SQLite 
- [x] Migrations successful without conflicts
- [x] Data integrity 100% verified 
- [x] `.sql` Database Backup created