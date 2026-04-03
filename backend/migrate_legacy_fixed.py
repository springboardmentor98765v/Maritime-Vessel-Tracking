import os
import sys
import importlib

# LEGACY PATHS
LEGACY_BASE = r'c:\backend (2) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend'

# Force sys.path to prioritize legacy directory
sys.path.insert(0, LEGACY_BASE)

# Clear any cached django/core modules if they exist
for mod in list(sys.modules.keys()):
    if mod.startswith('core') or mod.startswith('apps'):
        del sys.modules[mod]

os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

import django
django.setup()

from django.conf import settings
print(f"DEBUG: Using database at: {settings.DATABASES['default']['NAME']}")

from django.core.management import call_command

print("--- RUNNING MIGRATIONS FOR LEGACY PROJECT ---")
try:
    # Run migrate
    call_command('migrate', 'notifications', '0001', fake_initial=False) # Try without fake-initial first
    print("Successfully migrated 'notifications' to 0001.")
except Exception as e:
    print(f"Migration failed: {e}")
    print("Trying with --fake-initial...")
    try:
        call_command('migrate', 'notifications', '0001', fake_initial=True)
        print("Successfully migrated 'notifications' with --fake-initial.")
    except Exception as e2:
        print(f"Fake-initial migration also failed: {e2}")

# Verify tables using sqlite3 in the same script
import sqlite3
db_path = settings.DATABASES['default']['NAME']
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'notifications%';")
print("Tables in target DB:")
for t in cursor.fetchall():
    print(f" - {t[0]}")
conn.close()

print("--- DONE ---")
