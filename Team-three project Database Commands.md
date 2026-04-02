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
