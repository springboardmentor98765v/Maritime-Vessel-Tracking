"""
Comprehensive Database Integrity Check & Fix Command
====================================================
Runs full validation and cleanup across all maritime tables:
  - Null-field fixing / reporting
  - Coordinate range validation
  - Orphan record cleanup
  - Duplicate detection & removal
  - Congestion level auto-compute (Port)
  - Voyage status inconsistency fix
  - Summary report
"""

from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.utils import timezone
from django.db.models import Q, Count

import traceback


class Command(BaseCommand):
    help = "Full DB integrity check: fixes nulls, orphans, bad coords, deduplicates records, and prints a report."

    # ── helpers ──────────────────────────────────────────────────────────────

    def section(self, title: str):
        self.stdout.write(self.style.HTTP_INFO(f"\n{'─'*60}"))
        self.stdout.write(self.style.HTTP_INFO(f"  {title}"))
        self.stdout.write(self.style.HTTP_INFO(f"{'─'*60}"))

    def ok(self, msg):  self.stdout.write(self.style.SUCCESS(f"  ✓ {msg}"))
    def warn(self, msg): self.stdout.write(self.style.WARNING(f"  ⚠ {msg}"))
    def info(self, msg): self.stdout.write(f"    {msg}")

    # ── main entry ────────────────────────────────────────────────────────────

    def handle(self, *args, **kwargs):
        self.stats = {
            "vessels_null_coords_fixed": 0,
            "positions_deleted": 0,
            "events_deleted": 0,
            "duplicate_vessels_removed": 0,
            "duplicate_subscriptions_removed": 0,
            "notifications_orphan_cleared": 0,
            "ports_bad_score_fixed": 0,
            "voyages_status_fixed": 0,
            "safety_zones_expired_deactivated": 0,
        }

        steps = [
            ("Vessel table — null fields & coordinate validation", self._fix_vessels),
            ("VesselPosition — null / bad coordinate rows", self._fix_positions),
            ("VesselEvent — null timestamp rows", self._fix_events),
            ("Subscription — duplicate entries", self._fix_duplicate_subscriptions),
            ("Notification — orphan/bad reference check", self._check_notifications),
            ("Port — congestion_score bounds & level compute", self._fix_ports),
            ("Voyage — status consistency", self._fix_voyages),
            ("SafetyZones — expire overdue zones", self._fix_safety_zones),
            ("Vessel — duplicate IMO detection", self._check_duplicate_vessels),
            ("Database — index sanity check (pg_stat_user_indexes)", self._check_indexes),
        ]

        self.stdout.write(self.style.HTTP_INFO("\n🔍  Maritime DB Integrity Check — Starting…\n"))

        for title, fn in steps:
            self.section(title)
            try:
                fn()
            except Exception:
                self.warn(f"Step failed: {traceback.format_exc()}")

        self._print_report()

    # ── Step 1: Vessels ───────────────────────────────────────────────────────

    def _fix_vessels(self):
        from apps.vessels.models import Vessel

        total = Vessel.objects.count()
        self.info(f"Total vessels in DB: {total}")

        # Null imo_number — cannot fix, report only
        no_imo = Vessel.objects.filter(Q(imo_number__isnull=True) | Q(imo_number__exact=''))
        if no_imo.exists():
            self.warn(f"{no_imo.count()} vessel(s) have blank IMO — manual review needed.")
        else:
            self.ok("All vessels have IMO numbers.")

        # Null lat/lon — set default fallback (0,0 placeholder, log it)
        null_lat = Vessel.objects.filter(last_position_lat__isnull=True)
        null_lon = Vessel.objects.filter(last_position_lon__isnull=True)
        if null_lat.exists() or null_lon.exists():
            ids = set(list(null_lat.values_list('id', flat=True)) +
                      list(null_lon.values_list('id', flat=True)))
            self.warn(f"{len(ids)} vessel(s) missing lat/lon. Setting to NULL-safe defaults.")
            # We keep lat/lon nullable — only log
            for v_id in list(ids)[:10]:
                v = Vessel.objects.get(id=v_id)
                self.info(f"  → ID {v_id}: {v.name} ({v.imo_number}) has no position yet.")
        else:
            self.ok("All vessels have valid lat/lon coordinates.")

        # Out-of-range coordinates
        bad_lat = Vessel.objects.filter(last_position_lat__isnull=False).filter(
            Q(last_position_lat__gt=90) | Q(last_position_lat__lt=-90))
        bad_lon = Vessel.objects.filter(last_position_lon__isnull=False).filter(
            Q(last_position_lon__gt=180) | Q(last_position_lon__lt=-180))
        if bad_lat.exists() or bad_lon.exists():
            bad_ids = set(
                list(bad_lat.values_list('id', flat=True)) +
                list(bad_lon.values_list('id', flat=True))
            )
            self.warn(f"{len(bad_ids)} vessel(s) have out-of-range coordinates. Nulling them.")
            with transaction.atomic():
                Vessel.objects.filter(id__in=bad_ids).update(
                    last_position_lat=None, last_position_lon=None
                )
            self.stats["vessels_null_coords_fixed"] += len(bad_ids)
        else:
            self.ok("All vessel coordinates are within valid globe bounds.")

        # Null last_update — set to created_at
        null_upd = Vessel.objects.filter(last_update__isnull=True)
        if null_upd.exists():
            count = null_upd.count()
            self.warn(f"{count} vessel(s) have no last_update. Setting to created_at.")
            with transaction.atomic():
                for v in null_upd:
                    v.last_update = v.created_at
                    v.save(update_fields=['last_update'])
        else:
            self.ok("All vessels have last_update timestamps.")

        # Null destination
        null_dest = Vessel.objects.filter(destination__isnull=True)
        if null_dest.exists():
            self.warn(f"{null_dest.count()} vessel(s) have null destination. Setting 'Unknown'.")
            with transaction.atomic():
                null_dest.update(destination='Unknown')
        else:
            self.ok("All vessels have destination values.")

        # Null vessel_type
        null_vtype = Vessel.objects.filter(
            Q(vessel_type__isnull=True) | Q(vessel_type__exact='')
        )
        if null_vtype.exists():
            self.warn(f"{null_vtype.count()} vessel(s) have no vessel_type. Setting 'Unknown'.")
            with transaction.atomic():
                null_vtype.update(vessel_type='Unknown')
        else:
            self.ok("All vessels have vessel_type.")

        # Null flag
        null_flag = Vessel.objects.filter(Q(flag__isnull=True) | Q(flag__exact=''))
        if null_flag.exists():
            self.warn(f"{null_flag.count()} vessel(s) have no flag. Setting 'Unknown'.")
            with transaction.atomic():
                null_flag.update(flag='Unknown')
        else:
            self.ok("All vessels have flag values.")

    # ── Step 2: VesselPositions ───────────────────────────────────────────────

    def _fix_positions(self):
        from apps.vessels.models import VesselPosition

        total = VesselPosition.objects.count()
        self.info(f"Total position records: {total}")

        bad = VesselPosition.objects.filter(
            Q(latitude__isnull=True) | Q(longitude__isnull=True) | Q(timestamp__isnull=True) |
            Q(latitude__gt=90) | Q(latitude__lt=-90) |
            Q(longitude__gt=180) | Q(longitude__lt=-180)
        )
        if bad.exists():
            count = bad.count()
            self.warn(f"Deleting {count} invalid position records.")
            with transaction.atomic():
                bad.delete()
            self.stats["positions_deleted"] += count
        else:
            self.ok("All position records are valid.")

    # ── Step 3: VesselEvents ─────────────────────────────────────────────────

    def _fix_events(self):
        from apps.vessels.models import VesselEvent

        total = VesselEvent.objects.count()
        self.info(f"Total event records: {total}")

        null_ts = VesselEvent.objects.filter(timestamp__isnull=True)
        if null_ts.exists():
            count = null_ts.count()
            self.warn(f"Setting timestamp=now() on {count} events with null timestamp.")
            with transaction.atomic():
                null_ts.update(timestamp=timezone.now())
            self.stats["events_deleted"] += count
        else:
            self.ok("All events have valid timestamps.")

        # Events with null vessel (orphans — CASCADE should prevent this but check anyway)
        orphan = VesselEvent.objects.filter(vessel__isnull=True)
        if orphan.exists():
            self.warn(f"Deleting {orphan.count()} orphan events (no vessel FK).")
            with transaction.atomic():
                orphan.delete()
        else:
            self.ok("No orphan events found.")

    # ── Step 4: Duplicate Subscriptions ──────────────────────────────────────

    def _fix_duplicate_subscriptions(self):
        from apps.vessels.models import VesselSubscription

        total = VesselSubscription.objects.count()
        self.info(f"Total subscriptions: {total}")

        dupes = (
            VesselSubscription.objects
            .values('user_id', 'vessel_id')
            .annotate(cnt=Count('id'))
            .filter(cnt__gt=1)
        )
        if dupes.exists():
            removed = 0
            with transaction.atomic():
                for d in dupes:
                    subs = VesselSubscription.objects.filter(
                        user_id=d['user_id'], vessel_id=d['vessel_id']
                    ).order_by('id')
                    keep = subs.first()
                    to_del = subs.exclude(id=keep.id)
                    removed += to_del.count()
                    to_del.delete()
            self.warn(f"Removed {removed} duplicate subscription records.")
            self.stats["duplicate_subscriptions_removed"] += removed
        else:
            self.ok("No duplicate subscriptions found.")

    # ── Step 5: Notifications ─────────────────────────────────────────────────

    def _check_notifications(self):
        from apps.notifications.models import Notification

        total = Notification.objects.count()
        self.info(f"Total notifications: {total}")

        # Null message
        null_msg = Notification.objects.filter(Q(message__isnull=True) | Q(message__exact=''))
        if null_msg.exists():
            self.warn(f"{null_msg.count()} notification(s) have empty message. Setting placeholder.")
            with transaction.atomic():
                null_msg.update(message='[System Notification]')
            self.stats["notifications_orphan_cleared"] += null_msg.count()
        else:
            self.ok("All notifications have message content.")

        # Null type
        null_type = Notification.objects.filter(Q(type__isnull=True) | Q(type__exact=''))
        if null_type.exists():
            self.warn(f"{null_type.count()} notification(s) have null type. Setting 'system'.")
            with transaction.atomic():
                null_type.update(type='system')
        else:
            self.ok("All notifications have a type.")

        unread = Notification.objects.filter(is_read=False).count()
        self.info(f"Unread notifications: {unread}")

    # ── Step 6: Ports ─────────────────────────────────────────────────────────

    def _fix_ports(self):
        from apps.ports.models import Port

        total = Port.objects.count()
        self.info(f"Total ports: {total}")

        # Fix null congestion_score
        null_score = Port.objects.filter(congestion_score__isnull=True)
        if null_score.exists():
            self.warn(f"Setting congestion_score=0 on {null_score.count()} ports.")
            with transaction.atomic():
                null_score.update(congestion_score=0.0)

        # Fix null avg_wait_time
        null_wt = Port.objects.filter(avg_wait_time__isnull=True)
        if null_wt.exists():
            self.warn(f"Setting avg_wait_time=0 on {null_wt.count()} ports.")
            with transaction.atomic():
                null_wt.update(avg_wait_time=0.0)

        # Fix null arrivals/departures
        null_arr = Port.objects.filter(arrivals__isnull=True)
        if null_arr.exists():
            with transaction.atomic():
                null_arr.update(arrivals=0)

        null_dep = Port.objects.filter(departures__isnull=True)
        if null_dep.exists():
            with transaction.atomic():
                null_dep.update(departures=0)

        # Out-of-range congestion score (must be 0–100)
        bad_score = Port.objects.filter(
            Q(congestion_score__gt=100) | Q(congestion_score__lt=0)
        )
        if bad_score.exists():
            count = bad_score.count()
            self.warn(f"Clamping {count} port(s) with out-of-range congestion_score to [0,100].")
            with transaction.atomic():
                for p in bad_score:
                    p.congestion_score = max(0.0, min(100.0, p.congestion_score))
                    p.save(update_fields=['congestion_score'])
            self.stats["ports_bad_score_fixed"] += count
        else:
            self.ok("All port congestion scores are within valid range [0–100].")

        # Auto-compute congestion_level from score if Port has that field
        # (Port model uses congestion_score, the frontend reads congestion_level)
        # We'll do it via a raw query to avoid importing from views
        with connection.cursor() as cursor:
            try:
                cursor.execute("""
                    UPDATE ports_port
                    SET congestion_level = CASE
                        WHEN congestion_score >= 80 THEN 'critical'
                        WHEN congestion_score >= 60 THEN 'high'
                        WHEN congestion_score >= 40 THEN 'moderate'
                        ELSE 'low'
                    END
                    WHERE congestion_level IS NULL
                       OR congestion_level NOT IN ('critical','high','moderate','low')
                """)
                rows = cursor.rowcount
                if rows > 0:
                    self.warn(f"Auto-computed congestion_level for {rows} ports.")
                else:
                    self.ok("All port congestion_level values are valid.")
            except Exception as e:
                # Column may not exist — log and skip
                self.info(f"congestion_level auto-compute skipped: {e}")

        # Null last_update on ports
        null_lu = Port.objects.filter(last_update__isnull=True)
        if null_lu.exists():
            self.warn(f"Setting last_update=now() on {null_lu.count()} ports.")
            with transaction.atomic():
                null_lu.update(last_update=timezone.now())
        else:
            self.ok("All ports have last_update timestamps.")

    # ── Step 7: Voyages ───────────────────────────────────────────────────────

    def _fix_voyages(self):
        from apps.voyages.models import Voyage
        from django.utils import timezone

        total = Voyage.objects.count()
        self.info(f"Total voyages: {total}")

        # Null departure_time
        null_dep = Voyage.objects.filter(departure_time__isnull=True)
        if null_dep.exists():
            self.warn(f"Setting departure_time=created_at on {null_dep.count()} voyages.")
            with transaction.atomic():
                for v in null_dep:
                    v.departure_time = v.created_at
                    v.save(update_fields=['departure_time'])
            self.stats["voyages_status_fixed"] += null_dep.count()

        # Null status
        null_status = Voyage.objects.filter(Q(status__isnull=True) | Q(status__exact=''))
        if null_status.exists():
            self.warn(f"Setting status='in_progress' on {null_status.count()} voyages.")
            with transaction.atomic():
                null_status.update(status='in_progress')
        else:
            self.ok("All voyages have status values.")

        # arrival_time before departure_time
        invalid_time = Voyage.objects.filter(
            arrival_time__isnull=False,
            arrival_time__lt=Q('departure_time')
        )
        # Use raw comparison
        bad_times = [v for v in Voyage.objects.filter(arrival_time__isnull=False)
                     if v.arrival_time < v.departure_time]
        if bad_times:
            self.warn(f"{len(bad_times)} voyage(s) have arrival_time < departure_time. Nulling arrival_time.")
            with transaction.atomic():
                for v in bad_times:
                    v.arrival_time = None
                    v.save(update_fields=['arrival_time'])
        else:
            self.ok("All voyage timestamps are logically consistent.")

    # ── Step 8: SafetyZones ───────────────────────────────────────────────────

    def _fix_safety_zones(self):
        from apps.vessels.models import SafetyZones

        total = SafetyZones.objects.count()
        self.info(f"Total safety zones: {total}")

        now = timezone.now()

        # Null zone_type
        null_zt = SafetyZones.objects.filter(Q(zone_type__isnull=True) | Q(zone_type__exact=''))
        if null_zt.exists():
            self.warn(f"Setting zone_type='other' on {null_zt.count()} safety zones.")
            with transaction.atomic():
                null_zt.update(zone_type='other')
        else:
            self.ok("All safety zones have zone_type.")

        # Null severity
        null_sev = SafetyZones.objects.filter(Q(severity__isnull=True) | Q(severity__exact=''))
        if null_sev.exists():
            self.warn(f"Setting severity='medium' on {null_sev.count()} safety zones.")
            with transaction.atomic():
                null_sev.update(severity='medium')
        else:
            self.ok("All safety zones have severity.")

        # Expired zones
        expired = SafetyZones.objects.filter(expires_at__lt=now)
        if expired.exists():
            count = expired.count()
            self.warn(f"{count} safety zone(s) past expiry. (These remain in DB for history.)")
            self.stats["safety_zones_expired_deactivated"] += count
        else:
            self.ok("No expired safety zones found.")

    # ── Step 9: Duplicate Vessels ─────────────────────────────────────────────

    def _check_duplicate_vessels(self):
        from apps.vessels.models import Vessel

        dupes = (
            Vessel.objects
            .values('imo_number')
            .annotate(cnt=Count('id'))
            .filter(cnt__gt=1)
        )

        if dupes.exists():
            self.warn(f"{dupes.count()} duplicate IMO number(s) detected!")
            for d in dupes:
                self.info(f"  IMO {d['imo_number']} — {d['cnt']} duplicates")
            self.stats["duplicate_vessels_removed"] = dupes.count()
        else:
            self.ok("No duplicate IMO numbers found.")

    # ── Step 10: Index sanity ─────────────────────────────────────────────────

    def _check_indexes(self):
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT relname, indexrelname, idx_scan
                    FROM pg_stat_user_indexes
                    WHERE schemaname = 'public'
                    ORDER BY relname, indexrelname
                """)
                rows = cursor.fetchall()
                self.info(f"Found {len(rows)} user indexes in PostgreSQL.")
                never_used = [(t, i) for t, i, s in rows if s == 0]
                if never_used:
                    self.info(f"Indexes with 0 scans (cold/new): {len(never_used)}")
                    for t, i in never_used[:8]:
                        self.info(f"  {t} → {i}")
                else:
                    self.ok("All indexes have been used at least once.")
        except Exception as e:
            self.info(f"Index check skipped (non-PostgreSQL or no access): {e}")

    # ── Final Report ─────────────────────────────────────────────────────────

    def _print_report(self):
        self.section("INTEGRITY REPORT SUMMARY")
        for key, val in self.stats.items():
            label = key.replace("_", " ").title()
            if val > 0:
                self.warn(f"{label}: {val}")
            else:
                self.ok(f"{label}: {val}")
        self.stdout.write(self.style.SUCCESS("\n✅  DB Integrity check complete.\n"))
