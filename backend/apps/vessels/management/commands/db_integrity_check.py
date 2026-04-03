from django.core.management.base import BaseCommand
from django.db import models
from django.db.models import Count

from apps.vessels.models import Vessel, VesselPosition
from apps.safety.models import Safety
from apps.notifications.models import Notification
from apps.subscriptions.models import Subscription


class Command(BaseCommand):
    help = "DB integrity checks: duplicates, invalid coords, and constraint-like issues."

    def handle(self, *args, **options):
        issues = 0

        # Duplicate IMO (should be impossible due to unique constraint)
        dup_imo = (
            Vessel.objects.values("imo_number")
            .annotate(c=Count("id"))
            .filter(c__gt=1)
        )
        if dup_imo.exists():
            issues += 1
            self.stdout.write(self.style.ERROR(f"Duplicate IMO rows found: {list(dup_imo)[:10]}"))
        else:
            self.stdout.write(self.style.SUCCESS("No duplicate IMO rows."))

        # Invalid coords (constraints should prevent, but validate anyway)
        invalid_vessel = Vessel.objects.filter(
            (models.Q(last_position_lat__lt=-90) | models.Q(last_position_lat__gt=90))
            | (models.Q(last_position_lon__lt=-180) | models.Q(last_position_lon__gt=180))
        ).count()

        invalid_pos = VesselPosition.objects.filter(
            (models.Q(latitude__lt=-90) | models.Q(latitude__gt=90))
            | (models.Q(longitude__lt=-180) | models.Q(longitude__gt=180))
        ).count()

        if invalid_vessel or invalid_pos:
            issues += 1
            self.stdout.write(self.style.ERROR(
                f"Invalid coordinates found. Vessel:{invalid_vessel}, Positions:{invalid_pos}"
            ))
        else:
            self.stdout.write(self.style.SUCCESS("No invalid coordinates."))

        # Duplicate subscriptions (should be impossible)
        dup_subs = (
            Subscription.objects.values("user_id", "vessel_id")
            .annotate(c=Count("id"))
            .filter(c__gt=1)
        )
        if dup_subs.exists():
            issues += 1
            self.stdout.write(self.style.ERROR(f"Duplicate subscriptions found: {list(dup_subs)[:10]}"))
        else:
            self.stdout.write(self.style.SUCCESS("No duplicate subscriptions."))

        # Notifications must have user
        null_user_notifs = Notification.objects.filter(user__isnull=True).count()
        if null_user_notifs:
            issues += 1
            self.stdout.write(self.style.ERROR(f"Notifications with NULL user: {null_user_notifs}"))
        else:
            self.stdout.write(self.style.SUCCESS("No NULL-user notifications."))

        # Safety events may have null vessel by design, but must have type
        null_type = Safety.objects.filter(event_type__isnull=True).count()
        if null_type:
            issues += 1
            self.stdout.write(self.style.ERROR(f"Safety events with NULL event_type: {null_type}"))
        else:
            self.stdout.write(self.style.SUCCESS("No NULL event_type in safety."))

        if issues == 0:
            self.stdout.write(self.style.SUCCESS("DB integrity checks PASSED ✅"))
        else:
            self.stdout.write(self.style.WARNING(f"DB integrity checks found issues: {issues} ❗"))