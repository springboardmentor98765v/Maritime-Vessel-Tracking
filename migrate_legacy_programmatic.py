import os
import sys

# LEGACY PATHS
BASE_DIR = r'c:\backend (2) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend'
sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.core.management import call_command

print("--- RUNNING MIGRATIONS FOR LEGACY PROJECT ---")
try:
    # We use fake-initial because we might have some tables already (like notifications_notification)
    call_command('migrate', 'notifications', '0001', fake_initial=True)
    print("Successfully migrated 'notifications' to 0001.")
except Exception as e:
    print(f"Migration failed: {e}")

# Check vessels list API logic
from apps.vessels.models import Vessel
print(f"Vessel count in legacy DB: {Vessel.objects.count()}")

print("--- DONE ---")
