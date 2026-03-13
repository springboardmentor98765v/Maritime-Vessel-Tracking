"""
Milestone-3 Database Verification Script.
Run with: python manage.py shell < verify_m3_db.py
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from datetime import datetime, timedelta
import django.utils.timezone as tz

from apps.ports.models import Port, PortTrafficHistory
from apps.vessels.models import SafetyZones, ExternalSafetyData

print("=== Milestone-3 Verification ===\n")

# --- Port: last_analytics_update ---
port = Port.objects.first()
if port:
    port.last_analytics_update = tz.now()
    port.save()
    print(f"[OK] Port '{port.name}' last_analytics_update set to {port.last_analytics_update}")
else:
    print("[SKIP] No ports found, skipping Port update test.")

# --- PortTrafficHistory ---
if port:
    pth = PortTrafficHistory.objects.create(
        port=port,
        timestamp=tz.now(),
        arrivals=12,
        departures=9,
        congestion_score=0.76,
    )
    print(f"[OK] PortTrafficHistory created: {pth}")

# --- SafetyZones ---
sz = SafetyZones.objects.create(
    zone_type='storm',
    latitude=12.5,
    longitude=78.3,
    radius=25.0,
    severity='high',
    expires_at=tz.now() + timedelta(days=2),
)
print(f"[OK] SafetyZones created: {sz}")

# --- ExternalSafetyData & duplicate prevention ---
esd1 = ExternalSafetyData.objects.create(
    source='NOAA',
    unique_identifier='NOAA-2026-001',
    raw_data={'type': 'storm', 'region': 'Bay of Bengal'},
)
print(f"[OK] ExternalSafetyData created: {esd1}")

try:
    ExternalSafetyData.objects.create(
        source='NOAA',
        unique_identifier='NOAA-2026-001',  # duplicate
        raw_data={'type': 'storm', 'region': 'Bay of Bengal'},
    )
    print("[FAIL] Duplicate was NOT prevented!")
except Exception as e:
    print(f"[OK] Duplicate correctly prevented: {type(e).__name__}")

print("\n=== All checks complete ===")
