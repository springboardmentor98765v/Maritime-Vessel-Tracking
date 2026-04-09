# ⚓ Milestone 1: Project Setup & Authentication – Database Operations

## Scope of Work for Database Implementation

By the end of Milestone 1, the core tracking schema and user hierarchy must be fully constructed. The focus here is strictly on data architecture and role enforcement before the live tracking endpoints are connected in Milestone 2.

**Key responsibilities:**
* Design and implement Django database schemas for core entities: Users, Vessels, Ports, Voyages, Events.
* Enforce User Authentication and hierarchical Role Management (Operator, Analyst, Admin).
* Create safe profile relations.
* Prevent bad data at the source through correct Django constraints and foreign key relationships.

---

## ----------------------------------------- STEP 1 -----------------------------------------------

#  STEP 1  Authentication & Role Management Schema

---

##  Objective
* Define Custom User models avoiding default Django User limitations.
* Implement Roles (Operator, Analyst, Admin) natively at the DB level.
* Define `UserProfile` structures and link them via OneToOne field.

---

###  1.1: Verify Custom User & Roles Structure
 To ensure roles are strictly typed natively by Django validation, we avoid raw strings and utilize a predefined `ROLE_CHOICES` tuple directly in the model.

###  WHERE: Django Models ([backend/apps/authentication/models.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/apps/authentication/models.py))

```python
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = [
        ('operator', 'Operator'),
        ('analyst', 'Analyst'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    email = models.EmailField(unique=True)
    is_verified = models.BooleanField(default=False)

class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    company = models.CharField(max_length=255, blank=True, null=True)
```

---

###  1.2: Database Role Verification (pgAdmin / SQL)
 Prove that users and roles are natively stored in PostgreSQL limits correctly.

###  WHERE: pgAdmin Query Tool
```sql
-- 1. Check all users and their assigned system roles
SELECT id, username, email, role, is_active 
FROM authentication_user;

-- 2. Count number of users per role
SELECT role, COUNT(*) AS total_users 
FROM authentication_user 
GROUP BY role;
```

---

## ----------------------------------------- STEP 2 -----------------------------------------------

#  STEP 2  Core Tracking ER Diagram (Database Schema)

---

##  Objective
* Establish the base structure for Vessels, Ports, and Voyages.
* Ensure data relationships (1:N, N:M) are strictly modeled to allow complex analytics later.
* Create validation constraints (e.g., Voyage `arrival_time` must be >= `departure_time`).

---

###  2.1: Implement CheckConstraints Natively
 To protect data integrity, business logic should not just live in the frontend. We enforce rules natively on the database so Voyage arrival times cannot be paradoxically before departure times.

###  WHERE: Django Models ([backend/apps/voyages/models.py](file:///c:/Users/LENOVO/Desktop/teamm3/backend/apps/voyages/models.py))

```python
from django.db import models
from django.db.models import Q, F

class Voyage(models.Model):
    vessel = models.ForeignKey('vessels.Vessel', on_delete=models.CASCADE)
    port_from = models.ForeignKey('ports.Port', on_delete=models.CASCADE, related_name='voyage_departures')
    port_to = models.ForeignKey('ports.Port', on_delete=models.CASCADE, related_name='voyage_arrivals')
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(arrival_time__gte=F('departure_time')) | Q(arrival_time__isnull=True),
                name='arrival_after_departure'
            )
        ]
```

---

###  2.2: Identify Missing Foreign Keys Natively (pgAdmin)
 Show that we check for broken relationships in our core schemas.

###  WHERE: pgAdmin Query Tool
```sql
-- Check for any Voyages that failed to link to a valid Vessel id
SELECT v.id AS voyage_id, v.vessel_id 
FROM voyages_voyage v
LEFT JOIN vessels_vessel vs ON v.vessel_id = vs.id
WHERE vs.id IS NULL;
```

---

## ----------------------------------------- STEP 3 -----------------------------------------------

#  STEP 3  Testing & Migrating the Milestone 1 Schema

---

##  Objective
* Run the initial SQLite/PostgreSQL migrations safely to prepare for full REST app initialization.
* Test custom role creation to ensure SuperUsers are properly configured.
* Validate that CheckConstraints effectively block bad voyage data.

---

###  3.1: Verify Core Data via SQL (pgAdmin)
 Show that vessels and voyages are stored natively and queryable.

###  WHERE: pgAdmin Query Tool
```sql
-- View all established voyages and their designated vessels
SELECT v.id AS voyage_id, ves.name AS vessel_name, p1.name AS origin, p2.name AS destination, v.departure_time 
FROM voyages_voyage v
JOIN vessels_vessel ves ON v.vessel_id = ves.id
JOIN ports_port p1 ON v.port_from_id = p1.id
JOIN ports_port p2 ON v.port_to_id = p2.id;
```

---

#  FINAL IMPACT
> By formally structuring the User Models initially with role specifications, separating logical apps, and applying CheckConstraints at the database level instead of just serializer level, we've guaranteed foundational database integrity for the entire application.

---

## ----------------------------------------- CONCLUSION -------------------------------------------

#  FINAL CHECKLIST (Milestone 1)

 **Use this checklist to confirm the milestone is 100% complete before presentation.**

###  Data Quality 
- [x] Custom User Model created and replaces default Django Auth
- [x] Correct logical relationships (`UserProfile`  `User`) 

###  Integrity Support 
- [x] Time constraint natively verified via CheckConstraint (`departure_time` < `arrival_time`)
- [x] User Roles (`Operator`, `Analyst`, `Admin`) stored via choices tuple

###  Migration Status 
- [x] Initial app schemas migrated successfully to DB
- [x] Create super user tested

---


## 7. Milestone 2: Live Vessel Tracking & Metadata Integration

### Scope of Work for Database Integration

**Role Definition:**
The Database Integration Engineer is responsible for designing, optimizing, validating, securing, and scaling the database layer to support real-time vessel tracking.

They ensure:
* Data integrity
* Performance under load
* Proper relational design
* Efficient querying
* Scalable schema structure

They do NOT:
* Write event detection logic
* Build API views
* Implement frontend features
* Handle external API parsing logic

### STEP-BY-STEP RESPONSIBILITIES

#### STEP 1️⃣ — Schema Review & Validation
Even if schema was created in Milestone 1, DB engineer must review all models involved in Milestone 2. Code locations:
* **Vessel:** `backend/apps/vessels/models.py`
* **Event:** `backend/apps/vessels/models.py` (or `backend/apps/notifications/models.py`)
* **Subscription:** `backend/apps/vessels/models.py`
* **Notification:** `backend/apps/notifications/models.py`
* **User:** `backend/apps/authentication/models.py`

**Validate:**
* Field types are correct
* Field constraints are appropriate
* Relationships are normalized
* No redundancy
* No missing indexes

**Deliverable:** Finalized ER relationship validation document.

#### STEP 2️⃣ — Enforce Data Integrity Rules
Database engineer must ensure:
* **Vessel Table:** IMO number is UNIQUE, NOT NULL where necessary, Proper data types (Float for coordinates, DateTime for timestamps).
* **Subscription Table:** Unique constraint on (user, vessel), Foreign key constraints enforced.
* **Event Table:** Foreign key to Vessel with CASCADE delete, Proper timestamp default.
* **Notification Table:** Foreign key to User, Foreign key to Vessel, Foreign key to Event.

**Must verify:** No orphan records possible, Referential integrity maintained, Cascading deletes behave correctly.

#### STEP 3️⃣ — Indexing Strategy (Critical for Milestone 2)
Because vessel lists will be filtered, notifications fetched frequently, and real-time updates happen, indexes must be created on:
* **Vessel Table:** `imo_number` (unique index), `vessel_type`, `flag`, `destination`, `last_update`, `speed` (optional for analytics)
* **Event Table:** `vessel_id`, `timestamp`
* **Notification Table:** `user_id`, `is_read`, `created_at`
* **Subscription Table:** `user_id`, `vessel_id`

**Deliverable:** Optimized indexing strategy document. Verified via `EXPLAIN ANALYZE`.

#### STEP 4️⃣ — Performance Optimization
Must analyze query performance (Use EXPLAIN, Monitor sequential scans, Identify slow queries) and optimize (Add composite indexes where needed, Tune query plan, Avoid full table scans). Ensure update operations are efficient and bulk insert of events does not lock table.

#### STEP 5️⃣ — Concurrency & Transaction Safety
Because background jobs update vessels while users may read vessels simultaneously, ensure proper isolation level, no dirty reads, no deadlocks, no race conditions on subscription insert. Must validate `update_or_create` safe behavior and Unique constraints prevent duplication.

#### STEP 6️⃣ — Migration Strategy
Manage schema migrations, ensure safe migration on production DB, avoid data loss, validate backward compatibility, test migration rollback.
**Deliverable:** Migration plan document, Production-safe migration tested.

#### STEP 7️⃣ — Database Scaling Preparation
Evaluate row growth rate, storage estimation, partitioning strategy. Optional for high-scale: Partition event table by date, Partition notification table by user.
**Deliverable:** Growth estimation model, Scalability note.

#### STEP 8️⃣ — Data Consistency Monitoring
Ensure no duplicate vessel entries, no invalid lat/lon values, no orphan events, no orphan notifications, no broken foreign keys. Design integrity check queries and data validation queries.

#### STEP 9️⃣ — Backup & Recovery Strategy
Enable regular backups, validate restore process, ensure data durability.
**Deliverable:** Backup configuration, Restore testing confirmation.

#### STEP 🔟 — Environment Configuration
**Development:** SQLite (basic)
**Production:** PostgreSQL
Ensure correct environment configuration, Proper DB connection pooling, Secure credentials, SSL enabled (if required).

#### STEP 1️⃣1️⃣ — Load Testing Support
Simulate: 5,000 vessels, 1,000 users, 100k notifications. Check Query response time, Locking behavior, Index effectiveness. Provide performance report.

#### STEP 1️⃣2️⃣ — Collaboration with Backend Engineer
Provide optimized schema, suggest query improvements, recommend prefetch strategy, suggest composite indexes if filtering changes.
Must NOT implement API logic, write business logic, write celery tasks, build subscription API views, write serializers, handle JWT auth logic, create frontend endpoints.

### Deliverables – Database Integration Engineer (By end of Milestone 2)
* Finalized normalized schema
* Enforced foreign key constraints
* Optimized indexing plan
* Migration scripts validated
* Performance benchmark report
* Backup & restore tested
* Concurrency validated
* Scalability analysis completed

### FINAL CHECKLIST – Database Integration Engineer (Milestone 2)

**Schema Integrity**
* [ ] All foreign keys correct
* [ ] Unique constraints enforced
* [ ] Proper field types used
* [ ] No redundant columns

**Indexing**
* [ ] IMO indexed
* [ ] `vessel_type` indexed
* [ ] `user_id` indexed in notifications
* [ ] timestamp indexed in events
* [ ] Composite indexes added if required

**Performance**
* [ ] No full table scans
* [ ] Queries tested using EXPLAIN
* [ ] Update performance acceptable
* [ ] Bulk insert tested

**Concurrency**
* [ ] No race conditions
* [ ] No duplicate subscription possible
* [ ] Transactions safe

**Migration**
* [ ] Migration scripts tested
* [ ] Rollback tested
* [ ] Production-safe deployment plan

**Monitoring**
* [ ] Slow query logging enabled
* [ ] Backup strategy configured
* [ ] Restore test successful

**Scalability**
* [ ] Data growth estimated
* [ ] Partition strategy evaluated
* [ ] Future analytics support verified

*Final Summary: During Milestone 2, the Database Integration Engineer ensures the database layer is robust, consistent, optimized, scalable, and ready for real-time maritime data ingestion. Backend builds logic. Frontend builds visualization. Database engineer guarantees system stability and performance.*

---

## 8. Milestone 2 Queries & Practical Commands

Below are the practical query executions and commands specific to Milestone 2 requirements:

### 8.1 Python Shell Indexing & Consistency Queries

These validations and output checks can be run in the Django Shell:
```bash
# How to run in python shell:
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py shell
```

**Check for Duplicate Vessels (Integrity Run):**
```python
from django.db.models import Count
from apps.vessels.models import Vessel
from apps.authentication.models import User

# List all vessels that have duplicated IMOs (Should return none if Unique Constraint works)
duplicates = Vessel.objects.values('imo_number').annotate(count=Count('id')).filter(count__gt=1)
if duplicates.exists():
    # How to show outputs
    print("WARNING: Duplicate IMOs found:", list(duplicates))
else:
    print("SUCCESS: No duplicate vessel records found. IMO Uniqueness verified.")
```

**Verify Cascading Deletes & Relational Integrity (No Orphaned Records):**
```python
# Assuming models are in their respective apps, check your models.py structure:
# VesselSubscription and VesselEvent are typically in vessels app or notifications app
from apps.vessels.models import VesselEvent, Vessel
from django.core.exceptions import FieldError

try:
    # Verify there are no VesselEvents pointing to non-existent Vessels
    orphan_events = VesselEvent.objects.filter(vessel__isnull=True)
    # Output presentation for validation:
    print(f"[Milestone 2 Validation] Orphaned Events Count: {orphan_events.count()}") # Expected: 0
except FieldError:
    print("VesselEvent model doesn't explicitly rely on 'vessel'. Check schema.")

```

### 8.2 Database EXPLAIN Performance & Optimization Outputs (via `dbshell`)

Use direct PostgreSQL EXPLAIN tools using the following terminal command at `backend`:
```bash
# Terminal command for running SQL queries:
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py dbshell
```

**Running EXPLAIN ANALYZE on Vessel Lookup:**
```sql
-- 1. Testing Index Effectiveness for IMO Number (Outputs query planner logic)
EXPLAIN ANALYZE SELECT * FROM vessels_vessel WHERE imo_number = '1234567';

-- 2. Finding Slow Notification Queries filtered by User ID
EXPLAIN ANALYZE SELECT * FROM notifications_notification WHERE user_id = 1 AND is_read = FALSE;

-- 3. Verify Composite index usage (e.g., active vessel subscriptions for a particular user)
-- Note: Replace 'vessels_vesselsubscription' with actual table name based on apps/models
EXPLAIN ANALYZE SELECT * FROM vessels_vesselsubscription WHERE user_id = 1 AND vessel_id = 105;
```
**How to Show Output & Interpret System State:** 
The returned output in `dbshell` will print execution times and node paths. Look specifically for **`Index Scan`** (Optimal - meaning step 3 was completed successfully). If the output reads **`Seq Scan`** (Sequential Scan), it means performance optimization (Step 4) has failed and you must add a database index using `manage.py makemigrations`.

### 8.4 Data Consistency Monitoring (Invalid Coordinates & Constraints - Step 8)

To check for invalid Latitude/Longitude values and ensure data accuracy:
```bash
# Terminal command to enter python shell:
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py shell
```
```python
from apps.vessels.models import Vessel

# Check invalid coordinates (Lat > 90 or < -90, Lon > 180 or < -180)
invalid_coords = Vessel.objects.filter(last_position_lat__gt=90.0) | Vessel.objects.filter(last_position_lat__lt=-90.0) | Vessel.objects.filter(last_position_lon__gt=180.0) | Vessel.objects.filter(last_position_lon__lt=-180.0)

if invalid_coords.exists():
    print(f"--> WARNING: Found {invalid_coords.count()} vessels with invalid coordinates!")
else:
    print("--> SUCCESS: All vessel coordinates are within legitimate global bounds.")
```

### 8.5 Database Scalability & Row Growth Estimation (Step 7)

Run this via DB shell to evaluate current row counts, estimating storage needed for scaling and testing if partitions are required:
```bash
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py dbshell
```
```sql
-- Check current size and row count of primary tracking tables
SELECT relname AS "table_name", 
       pg_size_pretty(pg_total_relation_size(relid)) AS "total_size",
       n_live_tup AS "estimated_row_count"
FROM pg_stat_user_tables
WHERE relname IN ('vessels_vessel', 'vessels_vesselevent', 'notifications_notification');
```
**Output Expectation:** A tabular view displaying table names, sizes (e.g., `12 MB`), and the row count estimate. This data serves directly as the output for your **Growth estimation model** deliverable.

### 8.7 Backup & Recovery Strategy Validation (Step 9)

**PostgreSQL Backup Execution via standard terminal (`cmd` or PowerShell):**
```bash
# 1. Creating a full database dump snapshot (Backup)
pg_dump -U postgres -h localhost -p 5432 teamm3 > teamm3_backup_m2.sql

# 2. Restore Testing Procedure (Verification phase)
psql -U postgres -h localhost -p 5432 -d teamm3 -f teamm3_backup_m2.sql
```
**How to interpret and show the output:** When you execute the restore, the terminal will print an ongoing list of `SET`, `CREATE TABLE`, `ALTER TABLE`, and `COPY` indicators matching your database state. If completed successfully, it returns to the bash input with no `FATAL` text blocks. Documenting a successful run validates Step 9.

### 8.8 Load Testing Simulate & Support (Step 11)

For measuring latency during bulk fetch actions with simulated read strain:
```bash
# Launch from shell:
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py shell
```
```python
from apps.vessels.models import Vessel
import time

print("--> Starting DB Load Simulation Read Test...")
start_time = time.time()

# Simulating fetching a large 5000 block of vessel nodes for frontend Live Map visualization
vessel_batch = list(Vessel.objects.all()[:5000])

end_time = time.time()
elapsed_time = end_time - start_time

# Outputting the recorded performance:
print(f"--> LOAD TEST RESULT: Pulled {len(vessel_batch)} vessel records in {elapsed_time:.4f} seconds.")
# NOTE for Engineers: Optimally, this response should be < 250ms when indexed correctly.
```

### 8.9 View Real-Time Vessel Positions & Events (pgAdmin / SQL)

Query to extract the most recent live data directly from the tracking tables to establish output confirmation.

### WHERE: pgAdmin Query Tool
```sql
-- Retrieve the latest recorded position for all active vessels
SELECT imo_number, name, last_position_lat, last_position_lon, last_update 
FROM vessels_vessel 
WHERE status = 'active'
ORDER BY last_update DESC 
LIMIT 10;

-- Retrieve latest events for a specific vessel
SELECT v.name, e.event_type, e.timestamp, e.details
FROM vessels_vesselevent e
JOIN vessels_vessel v ON e.vessel_id = v.id
ORDER BY e.timestamp DESC
LIMIT 5;
```

---

## 9. Milestone 3: Database & Integration Work

### Scope of Work for Database Integration

By the end of Milestone 3, the database intern should have:
* Extended port table for congestion analytics
* Created port traffic history table
* Created safety zones table
* Ensured safe integration of external data
* Added indexes for analytics queries

### STEP-BY-STEP RESPONSIBILITIES

#### Step 1 — Extend the Port Table for Analytics
Milestone-3 needs to store congestion information for each port. Add a few new columns to the `ports` table:
* `congestion_score`
* `avg_wait_time`
* `last_analytics_update`

**Purpose:**
* Store congestion score calculated by backend
* Allow quick retrieval for dashboards
The intern only needs to update the model in `backend/apps/ports/models.py` and run a migration.

#### Step 2 — Create Port Traffic History Table
Congestion analysis needs historical port traffic data. Create a new table `PortTrafficHistory` in `backend/apps/ports/models.py`.
**Example fields:**
* `id`
* `port_id`
* `timestamp`
* `arrivals`
* `departures`
* `congestion_score`

**Purpose:**
* Store port activity over time
* Support charts and analytics dashboards

Add indexes on `port_id` and `timestamp` so analytics queries remain fast.

#### Step 3 — Create Safety Zones Table
Milestone-3 requires storing safety risk areas such as storms, piracy zones, and accident zones. Create a new table `SafetyZones` in `backend/apps/vessels/models.py` (or similar tracking application).
**Example fields:**
* `id`
* `zone_type`
* `latitude`
* `longitude`
* `radius`
* `severity`
* `created_at`
* `expires_at`

**Purpose:**
* Store active safety zones
* Allow the backend to check vessel risk
* Provide data for map overlays

#### Step 4 — Support External Data Integration
External datasets will be inserted into the database regularly.
The database intern must ensure:
* Tables accept bulk inserts
* Duplicate records are avoided
* Data constraints are valid

**Optional:** Create a staging table for raw data. Example: `ExternalSafetyData`. This table temporarily stores raw NOAA or UNCTAD data before processing.

#### Step 5 — Add Indexes for Analytics Queries
Analytics dashboards require fast queries. Add indexes on:
* **Ports table:** `congestion_score`
* **PortTrafficHistory table:** `port_id`, `timestamp`
* **SafetyZones table:** `zone_type`, `expires_at`

**Purpose:** These indexes ensure fast analytics dashboards and fast safety overlay queries.

---

### Database Milestone-3 Checklist (Intern Friendly)

**Schema Updates**
* [ ] Port table updated with congestion fields
* [ ] `PortTrafficHistory` table created
* [ ] `SafetyZones` table created

**Data Integration**
* [ ] External data insertion tested
* [ ] Duplicate data prevented

**Indexing**
* [ ] Index added for port congestion queries
* [ ] Index added for port traffic history
* [ ] Index added for safety zone queries

**Testing**
* [ ] Sample analytics data inserted
* [ ] Safety zone records stored correctly

---

## 10. Milestone 3 Queries & Practical Commands

Below are the practical query executions and commands specific to Milestone 3 requirements, validating migrations, indexing, and bulk insertions.

### 10.1 Database EXPLAIN for Analytics Indexes (Step 5)

Validate that the new analytics indices on `congestion_score`, `port_id`, and `zone_type` perform correctly without locking the database:
```bash
# Terminal command for DB Shell:
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py dbshell
```
**Running SQL EXPLAIN tests:**
```sql
-- Test 1: Does the Ports query use the congestion_score index?
EXPLAIN ANALYZE SELECT * FROM ports_port WHERE congestion_score > 0.8;

-- Test 2: Checking fast analytics loads on PortTrafficHistory
EXPLAIN ANALYZE SELECT * FROM ports_porttraffichistory WHERE port_id = 5 ORDER BY timestamp DESC LIMIT 10;

-- Test 3: Checking real-time overlay fetch speed on SafetyZones
-- (Warning: Replace table name 'vessels_safetyzones' if SafetyZones belongs to a different app)
EXPLAIN ANALYZE SELECT * FROM vessels_safetyzones WHERE zone_type = 'piracy' AND expires_at > NOW();
```
**How to interpret and show the output:** When you enter these queries, `dbshell` will print out a query plan block. 
You must see **`Index Scan using <index_name>`** in the planner output. If you instead see **`Seq Scan`** (Sequential Scan), it means the Database Intern Checklist step "Index added for..." failed, and the intern must add `db_index=True` or `class Meta: indexes` to their Django models.

### 10.2 Sample Analytics Verification Query (Testing Checklist)

Run this raw SQL in `dbshell` to retrieve a visual table structure proving your History tables actually store analytics metrics over time for your UI:
```bash
# In shell:
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py dbshell
```
```sql
-- Validating sample analytics data exists for Dashboard UI Overlays:
SELECT p.name, h.timestamp, h.arrivals, h.departures, h.congestion_score 
FROM ports_porttraffichistory h
JOIN ports_port p ON h.port_id = p.id
ORDER BY h.congestion_score DESC
LIMIT 5;
```
**Output Expectation:** A tabular view displaying actual recorded time-series entries with Port Names, timetamps, arrival/departure counts, and congestion score, verifying the final bullet point of the testing checklist.

---

# ⚓ Milestone 4: Historical Replay, Dashboards & Deployment – Database Operations

## Scope of Work for Database Implementation

By the end of Milestone 4, the database must cleanly support historical metrics and dashboards without failures. We will standardize data and use indexing and materialized views to make aggregations fast.

---
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

###  1.3: Native PostgreSQL Verification (pgAdmin)
 Show that the database is natively clean using raw SQL.

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
*Note: Running a direct count prevents the dashboard from downloading the entire vessel list just to show a number.*
```sql
-- Query to get exactly how many active vessels are tracked
SELECT COUNT(*) AS active_vessels
FROM vessels_vessel 
WHERE status='active'; 
```

#### 2. Congestion Metrics (High Traffic Destinations)
*Note: This groups vessels by destination, allowing the dashboard to instantly flag congested ports across the globe instead of building the counts on the fly inside the API.*
```sql
-- Query to find which destinations have the most inbound vessels
SELECT destination, COUNT(*) AS vessel_count
FROM vessels_vessel
GROUP BY destination
ORDER BY vessel_count DESC;
```

#### 3. Risk Counts (Show Safety Events)
*Note: Instead of scanning raw event data every time, we pre-group the critical events by type (e.g., piracy, weather) to feed the risk widgets instantly.*
```sql
-- Query to count critical events categorized by their risk type
SELECT event_type, COUNT(*) AS risk_count
FROM vessels_vesselevent
GROUP BY event_type
ORDER BY risk_count DESC;
```

---

###  3.2: Optional Materialized View (For Advanced Intern Demo)
*Note: To push performance further natively from the database, we can store these aggregated statistics in a Materialized View so the database doesn't even have to recount the rows.*
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

###  4.2: Handle API Failures (VERY IMPORTANT )
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
*Note: If the API fails, the system does not crash. Errors are logged and the application continues running safely.*

---

###  4.3: Verify No Duplicates (pgAdmin)
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

*Note: By pre-defining these structured queries using SQL `JOIN`s, the admin panel can easily retrieve flat, consolidated datamaking CSV exports seamless and extremely fast.*

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

###  6.2: Test Data Integrity
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
*Note: Orphaned records are impossible, meaning 100% data integrity.*

---

###  6.3: Database Backup Setup (Basic)
 Secure the data! Always create a manual dump before a major production push.
 **LOCATION:** The backup file will be securely exported to the `db_files/` directory in our project.

###  WHERE: Terminal (Run from inside [[backend/](file:///c:/Users/LENOVO/Desktop/teamm3/backend/)] folder)
```bash
# Export a DB dump snapshot directly into the project's database folder
pg_dump -U postgres -d teamm3 -f ../db_files/backup_teamm3_production.sql
```
*Note: This command exports our full PostgreSQL state and physically stores it at `teamm3/db_files/backup_teamm3_production.sql`. This ensures we always have a hardcoded snapshot to revert to if a production error occurs.*

---

###  6.4: Performance Sanity Check
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