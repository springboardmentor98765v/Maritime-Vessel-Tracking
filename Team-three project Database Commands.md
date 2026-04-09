# Django Database Commands Guide

This document serves as a quick reference for running the database queries, shell commands, and cleanup scripts used in Milestone 4.

## 1. Running the Interactive Shell
To interact directly with your database using the Django ORM natively, you need to open the Django Shell. This automatically connects to PostgreSQL and loads your settings.

```bash
# First, ensure you are in the backend directory
cd backend

# Second, open the interactive Django shell
python manage.py shell
```

## 2. Basic Shell Queries
Once inside the shell (you will see the `In [1]:` prompt), you must import your models before querying them.

### Importing Models
```python
from apps.vessels.models import Vessel, VesselEvent
from apps.ports.models import Port
from apps.voyages.models import Voyage
```

### Checking Quantities
To verify how many elements exist in the database, run:
```python
print("Total Vessels:", Vessel.objects.count())
print("Total Ports:", Port.objects.count())
```

### Checking for Missing/Bad Data
To see exactly how many vessels are missing coordinates (which causes UI maps to crash):
```python
null_count = Vessel.objects.filter(last_position_lat__isnull=True).count()
print("Vessels missing coordinates:", null_count)
```

## 3. Running the Cleanup Script
Instead of deleting bad data manually inside the shell, you can natively run your automated Python script `clean_vessel_data.py`. This script ensures that no vessel, position, or event is missing critical timestamps or geographic coordinates.

```bash
# Ensure you are in the backend directory
cd backend

# Run the automated cleanup script
python manage.py clean_vessel_data
```

**Expected output:**
```text
Successfully cleaned database!
```
If there were previously 0 missing coordinates, it will do a seamless pass. If testing with messy live data, it will report exactly how many invalid records were deleted or corrected!



----------------------------------------------------------------------------------------------------



# Milestone 4 – Database Cleaning and Standardization

`1. Clean and Standardize Existing Data (Very Important First Step) `
`Before anything else, ensure your database is usable and consistent.`
Work to do: 
 Check key tables: 
    `vessels`
    `ports`
    `voyages`
    `events`
 Ensure: 
    `No null values in critical fields (lat, lon, timestamp)`
    `Correct data types (datetime, float, etc.) `
    `No duplicate records `
Simple approach: 
 Write small scripts: 
# Example check 
Vessel.objects.filter(last_position_lat__isnull=True) 

 This step prevents replay/dashboard failures later



######  -------------------------------STEP 1: Open Project-------------------------------------
**WHERE:** Terminal (PowerShell)

`cd backend`


### STEP 2: Open Django Shell
**WHERE:** Terminal (PowerShell)
This connects your command line directly to PostgreSQL.

python manage.py shell


### STEP 3: Import Models or Tables


from apps.vessels.models import Vessel
from apps.ports.models import Port
from apps.voyages.models import Voyage
from apps.vessels.models import VesselEvent

### STEP 4: Check Data Counts

print("Total Vessels:", Vessel.objects.count())
print("Total Ports:", Port.objects.count())


### STEP 5: Check Null Values


# latitude coordinate
Vessel.objects.filter(last_position_lat__isnull=True).count()

# longitude coordinate
Vessel.objects.filter(last_position_lon__isnull=True).count()

# counting
Vessel.objects.filter(last_update__isnull=True).count()
```

### STEP 6: Verify Data Types

sample_vessel = Vessel.objects.exclude(last_position_lat__isnull=True).first()

# Check coordinate field type – must be float

print("Latitude type:", type(sample_vessel.last_position_lat))

# Check timestamp field type – must be datetime

print("Timestamp type:", type(sample_vessel.last_update))



### STEP 7: Detect Duplicate Records


from django.db.models import Count

# This queries for any vessel_id that was duplicated in our system > 1 times
Vessel.objects.values('imo_number').annotate(count=Count('id')).filter(count__gt=1)

### STEP 8: Clean Invalid Data

**Option 1 (Delete invalid records - Recommended for orphan data):**
```python
Vessel.objects.filter(last_position_lat__isnull=True).delete()
```

**Option 2 (Fix data - Recommended for salvaging records):**
```python
Vessel.objects.filter(last_position_lat__isnull=True).update(
    last_position_lat=0.0,
    last_position_lon=0.0
)
```

### STEP 9: Verify Cleaning

It should now output `0`.
```python
Vessel.objects.filter(last_position_lat__isnull=True).count()
```
---


## 6. AUTOMATION USING DJANGO COMMAND


### HOW TO RUN COMMAND
**WHERE:** Terminal (PowerShell) 

```bash
python manage.py clean_vessel_data
```



-----------------------------------------STEP 2 -----------------------------------------------

python manage.py shell 

from apps.voyages.models import Voyage
from apps.vessels.models import VesselEvent

# Check voyages without vessel_id
Voyage.objects.filter(vessel_id__isnull=True).count()

# Check events missing timestamp
VesselEvent.objects.filter(timestamp__isnull=True).count()

# Fetch ordered data for replay
VesselEvent.objects.order_by('vessel_id', 'timestamp')[:10]

exit 

python manage.py dbshell

SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'vessels_vesselevent';
