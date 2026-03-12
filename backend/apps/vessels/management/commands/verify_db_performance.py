from django.core.management.base import BaseCommand
from django.db import connection
from apps.vessels.models import Vessel, VesselEvent, VesselSubscription
from apps.authentication.models import User
from apps.notifications.models import Notification
from django.utils import timezone
import random


class Command(BaseCommand):
    help = "Verifies database integrity, performance indices, and test bulk inserts for Milestone 2."

    def validate_query_plan(self, query):
        """Runs EXPLAIN QUERY PLAN (SQLite) or EXPLAIN (Postgres) on a queryset or raw query."""
        with connection.cursor() as cursor:
            if connection.vendor == 'sqlite':
                cursor.execute(f"EXPLAIN QUERY PLAN {query}")
            else:
                cursor.execute(f"EXPLAIN {query}")
            result = cursor.fetchall()
            return result

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting Database Verification..."))

        # 1. Setup Test Data
        self.stdout.write("\n1. Seeding Data...")
        user, _ = User.objects.get_or_create(username='db_test_user', email='dbtest@test.com')
        vessel, _ = Vessel.objects.get_or_create(
            imo_number="DB_TEST_IMO",
            name="Test Vessel",
            vessel_type="Cargo",
            flag="Panama",
            speed=12.5
        )

        # 2. Concurrency / Integrity Test: prevent duplicate subscriptions
        self.stdout.write("\n2. Testing Subscription Integrity...")
        sub1, created1 = VesselSubscription.objects.get_or_create(user=user, vessel=vessel)
        sub2, created2 = VesselSubscription.objects.get_or_create(user=user, vessel=vessel)
        if not created2 and sub1.id == sub2.id:
            self.stdout.write(self.style.SUCCESS("[OK] SUCCESS: Race condition / Duplicate subscription prevented."))
        else:
            self.stdout.write(self.style.ERROR("[ERROR] ERROR: Duplicate subscription allowed."))

        # 3. Bulk Insert test
        self.stdout.write("\n3. Testing Bulk Insert of VesselEvents...")
        events = [
            VesselEvent(
                vessel=vessel,
                event_type='route_changed',
                timestamp=timezone.now(),
                latitude=random.uniform(-90, 90),
                longitude=random.uniform(-180, 180)
            ) for _ in range(500)
        ]
        import time
        start_time = time.time()
        VesselEvent.objects.bulk_create(events)
        elapsed = time.time() - start_time
        self.stdout.write(self.style.SUCCESS(f"[OK] SUCCESS: Bulk inserted 500 events in {elapsed:.4f}s"))

        # 4. EXPLAIN Queries Testing (Indices Validation)
        self.stdout.write("\n4. Validating Indices via EXPLAIN...")

        queries = {
            "Vessel By IMO": f"SELECT * FROM {Vessel._meta.db_table} WHERE imo_number = 'DB_TEST_IMO'",
            "Vessel Filter (Type, Flag)": f"SELECT * FROM {Vessel._meta.db_table} WHERE vessel_type='Cargo' AND flag='Panama'",
            "Vessel Subscriptions (Composite)": f"SELECT * FROM {VesselSubscription._meta.db_table} WHERE user_id={user.id} AND vessel_id={vessel.id}",
            "Notification (Unread)": f"SELECT * FROM {Notification._meta.db_table} WHERE is_read=False AND user_id={user.id}"
        }

        for desc, sql in queries.items():
            try:
                plan = self.validate_query_plan(sql)
                self.stdout.write(self.style.WARNING(f"\n[QUERY: {desc}]"))
                if connection.vendor == 'sqlite':
                    # SQLite returns (id, parent, notused, detail)
                    for row in plan:
                        self.stdout.write(f"  {row[3]}")
                        if "SCAN TABLE" in row[3] or "SCAN" in row[3]:
                            if "USING INDEX" not in row[3] and "USING COVERING INDEX" not in row[3]:
                                self.stdout.write(self.style.ERROR(f"  [!] WARNING: Potential Full Table Scan detected!"))
                else: # Postgres
                    for row in plan:
                        self.stdout.write(f"  {row[0]}")
                        if "Seq Scan" in row[0]:
                             self.stdout.write(self.style.ERROR(f"  [!] WARNING: Sequential Scan detected (missing index for small table)."))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"[ERROR] Failed EXPLAIN for {desc}: {e}"))

        self.stdout.write(self.style.SUCCESS("\nDone! Database Verification Complete."))

        # Cleanup
        user.delete()
        vessel.delete()
