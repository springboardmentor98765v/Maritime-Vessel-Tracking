import os
import sys
import importlib

# LEGACY PATHS
LEGACY_BASE = r'c:\backend (2) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend'

sys.path.insert(0, LEGACY_BASE)

for mod in list(sys.modules.keys()):
    if mod.startswith('core') or mod.startswith('apps'):
        del sys.modules[mod]

os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'

import django
django.setup()

from django.conf import settings
from django.core.management import call_command

print("--- RUNNING MIGRATIONS FOR LEGACY PROJECT ---")
try:
    # Use the FULL app name as defined in NotificationsConfig
    call_command('migrate', 'apps.notifications', '0001', fake_initial=False)
    print("Successfully migrated 'apps.notifications' to 0001.")
except Exception as e:
    print(f"Migration failed: {e}")
    # Fallback: maybe it's just 'notifications' in the loader but needs different call?
    try:
        call_command('migrate', 'notifications', fake_initial=True)
        print("Successfully ran catch-all migrate.")
    except Exception as e2:
        print(f"Catch-all migrate also failed: {e2}")

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
