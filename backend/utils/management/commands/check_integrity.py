"""
Django Management Command: check_integrity
Usage: python manage.py check_integrity

Runs comprehensive data integrity checks on the Maritime Vessel Tracking database
"""

from django.core.management.base import BaseCommand
from django.db import connection, models
from django.utils import timezone
from django.db.models import Count, Q

from apps.vessels.models import Vessel, VesselEvent, VesselSubscription
from apps.notifications.models import Notification
from apps.ports.models import Port
from apps.authentication.models import User


class Command(BaseCommand):
    help = 'Run comprehensive data integrity checks on the database'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.errors = []
        self.warnings = []
        self.checks_passed = 0
        self.checks_failed = 0
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed output for each check'
        )
    
    # ============================================================
    # VESSEL TABLE CHECKS
    # ============================================================
    
    def check_vessel_imo_unique(self):
        """Verify IMO numbers are unique"""
        duplicates = (
            Vessel.objects
            .values('imo_number')
            .annotate(count=Count('id'))
            .filter(count__gt=1)
        )
        
        if duplicates.exists():
            self.errors.append(f"Duplicate IMO numbers found: {list(duplicates)}")
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ Vessel IMO numbers are unique"))
            self.checks_passed += 1
            return True
    
    def check_vessel_imo_not_null(self):
        """Verify all vessels have IMO numbers"""
        null_imo = Vessel.objects.filter(imo_number__isnull=True).count()
        
        if null_imo > 0:
            self.errors.append(f"Found {null_imo} vessels without IMO numbers")
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ All vessels have IMO numbers (NOT NULL enforced)"))
            self.checks_passed += 1
            return True
    
    def check_vessel_name_not_null(self):
        """Verify all vessels have names"""
        null_names = Vessel.objects.filter(name__isnull=True).count()
        
        if null_names > 0:
            self.errors.append(f"Found {null_names} vessels without names")
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ All vessels have names (NOT NULL enforced)"))
            self.checks_passed += 1
            return True
    
    def check_vessel_coordinates_valid(self):
        """Verify latitude/longitude are within valid ranges"""
        invalid_coords = Vessel.objects.filter(
            Q(last_position_lat__lt=-90) | Q(last_position_lat__gt=90) |
            Q(last_position_lon__lt=-180) | Q(last_position_lon__gt=180)
        ).count()
        
        if invalid_coords > 0:
            self.errors.append(f"Found {invalid_coords} vessels with invalid coordinates")
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ All vessel coordinates are valid"))
            self.checks_passed += 1
            return True
    
    # ============================================================
    # SUBSCRIPTION TABLE CHECKS
    # ============================================================
    
    def check_subscription_unique_constraint(self):
        """Verify (user, vessel) combinations are unique"""
        duplicates = (
            VesselSubscription.objects
            .values('user_id', 'vessel_id')
            .annotate(count=Count('id'))
            .filter(count__gt=1)
        )
        
        if duplicates.exists():
            self.errors.append(f"Duplicate subscriptions found: {list(duplicates)}")
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ No duplicate subscriptions (unique constraint enforced)"))
            self.checks_passed += 1
            return True
    
    def check_subscription_referential_integrity(self):
        """Verify all subscriptions reference valid users and vessels"""
        invalid_users = (
            VesselSubscription.objects
            .exclude(user_id__in=User.objects.values_list('id', flat=True))
            .count()
        )
        
        invalid_vessels = (
            VesselSubscription.objects
            .exclude(vessel_id__in=Vessel.objects.values_list('id', flat=True))
            .count()
        )
        
        if invalid_users > 0 or invalid_vessels > 0:
            msg = f"Invalid references - Users: {invalid_users}, Vessels: {invalid_vessels}"
            self.warnings.append(msg)
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ All subscriptions reference valid users and vessels"))
            self.checks_passed += 1
            return True
    
    # ============================================================
    # EVENT TABLE CHECKS
    # ============================================================
    
    def check_event_no_orphans(self):
        """Verify all events reference valid vessels"""
        orphaned_events = (
            VesselEvent.objects
            .exclude(vessel_id__in=Vessel.objects.values_list('id', flat=True))
            .count()
        )
        
        if orphaned_events > 0:
            self.errors.append(f"Found {orphaned_events} orphaned events (CASCADE delete failure)")
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ No orphaned events (CASCADE delete working)"))
            self.checks_passed += 1
            return True
    
    def check_event_timestamp_not_null(self):
        """Verify all events have timestamps"""
        null_timestamps = VesselEvent.objects.filter(timestamp__isnull=True).count()
        
        if null_timestamps > 0:
            self.errors.append(f"Found {null_timestamps} events without timestamps")
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ All events have timestamps (NOT NULL enforced)"))
            self.checks_passed += 1
            return True
    
    # ============================================================
    # NOTIFICATION TABLE CHECKS
    # ============================================================
    
    def check_notification_referential_integrity(self):
        """Verify all notifications reference valid users and vessels"""
        invalid_users = (
            Notification.objects
            .exclude(user_id__in=User.objects.values_list('id', flat=True))
            .count()
        )
        
        invalid_vessels = (
            Notification.objects
            .exclude(vessel_id__in=Vessel.objects.values_list('id', flat=True))
            .count()
        )
        
        if invalid_users > 0 or invalid_vessels > 0:
            msg = f"Invalid references - Users: {invalid_users}, Vessels: {invalid_vessels}"
            self.errors.append(msg)
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ All notifications reference valid users and vessels"))
            self.checks_passed += 1
            return True
    
    def check_notification_events(self):
        """Verify notifications with events reference valid events"""
        invalid_events = (
            Notification.objects
            .exclude(Q(event_id__isnull=True) | Q(event_id__in=VesselEvent.objects.values_list('id', flat=True)))
            .count()
        )
        
        if invalid_events > 0:
            self.warnings.append(f"Found {invalid_events} notifications with potentially invalid events")
            self.checks_failed += 1
            return False
        else:
            self.stdout.write(self.style.SUCCESS("✅ All notifications have valid event references (SET_NULL working)"))
            self.checks_passed += 1
            return True
    
    # ============================================================
    # OVERALL STATISTICS
    # ============================================================
    
    def print_table_statistics(self):
        """Print overall database statistics"""
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.HTTP_SERVER_ERROR("DATABASE STATISTICS"))
        self.stdout.write("="*60)
        self.stdout.write(f"Total Vessels: {Vessel.objects.count()}")
        self.stdout.write(f"Total Users: {User.objects.count()}")
        self.stdout.write(f"Total Subscriptions: {VesselSubscription.objects.count()}")
        self.stdout.write(f"Total Events: {VesselEvent.objects.count()}")
        self.stdout.write(f"Total Notifications: {Notification.objects.count()}")
        self.stdout.write(f"Total Ports: {Port.objects.count()}")
        self.stdout.write("="*60 + "\n")
        self.checks_passed += 1
    
    def print_summary(self):
        """Print integrity check summary"""
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.HTTP_SERVER_ERROR("INTEGRITY CHECK SUMMARY"))
        self.stdout.write("="*60)
        self.stdout.write(self.style.SUCCESS(f"✅ Checks Passed: {self.checks_passed}"))
        self.stdout.write(self.style.ERROR(f"❌ Checks Failed: {self.checks_failed}"))
        
        if self.errors:
            self.stdout.write("\n" + self.style.ERROR("❌ ERRORS:"))
            for error in self.errors:
                self.stdout.write(f"  {error}")
        
        if self.warnings:
            self.stdout.write("\n" + self.style.WARNING("⚠️  WARNINGS:"))
            for warning in self.warnings:
                self.stdout.write(f"  {warning}")
        
        total = self.checks_passed + self.checks_failed
        if total > 0:
            pass_rate = (self.checks_passed / total) * 100
            self.stdout.write(f"\n📊 Overall Pass Rate: {pass_rate:.1f}%")
        
        if self.checks_failed == 0:
            self.stdout.write(self.style.SUCCESS("\n✅ ALL CHECKS PASSED - DATABASE INTEGRITY VERIFIED"))
        else:
            self.stdout.write(self.style.ERROR(f"\n❌ {self.checks_failed} CHECKS FAILED - REVIEW NEEDED"))
        
        self.stdout.write("="*60 + "\n")
    
    def handle(self, *args, **options):
        """Main command handler"""
        self.stdout.write("\n" + "="*60)
        self.stdout.write(self.style.HTTP_SERVER_ERROR("STARTING DATA INTEGRITY CHECKS"))
        self.stdout.write("="*60 + "\n")
        
        try:
            # Vessel checks
            self.stdout.write(self.style.HTTP_INFO("🔍 Vessel Table Checks:"))
            self.check_vessel_imo_unique()
            self.check_vessel_imo_not_null()
            self.check_vessel_name_not_null()
            self.check_vessel_coordinates_valid()
            
            # Subscription checks
            self.stdout.write("\n" + self.style.HTTP_INFO("🔍 Subscription Table Checks:"))
            self.check_subscription_unique_constraint()
            self.check_subscription_referential_integrity()
            
            # Event checks
            self.stdout.write("\n" + self.style.HTTP_INFO("🔍 Event Table Checks:"))
            self.check_event_no_orphans()
            self.check_event_timestamp_not_null()
            
            # Notification checks
            self.stdout.write("\n" + self.style.HTTP_INFO("🔍 Notification Table Checks:"))
            self.check_notification_referential_integrity()
            self.check_notification_events()
            
            # Statistics
            self.print_table_statistics()
            
        except Exception as e:
            self.errors.append(f"Error during checks: {str(e)}")
            self.checks_failed += 1
        
        # Print summary
        self.print_summary()
