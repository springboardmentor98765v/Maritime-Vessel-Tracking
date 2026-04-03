from django.db import models
from django.utils import timezone
from apps.vessels.models import Vessel


class Safety(models.Model):
    """
    Event table (Milestone 2 uses this as Event).
    - vessel is SET_NULL so events can exist without a vessel
    - timestamp indexed
    """

    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="safety_events",
        db_index=True,
    )

    event_type = models.CharField(max_length=100, db_index=True)  # collision, delay, piracy, etc.
    severity = models.CharField(max_length=50, blank=True, default="")

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    location = models.CharField(max_length=255, blank=True, default="")
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    details = models.TextField(blank=True, default="")
    metadata = models.JSONField(blank=True, default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["vessel", "-timestamp"], name="idx_safety_vessel_ts_desc"),
            models.Index(fields=["event_type", "-timestamp"], name="idx_safety_type_ts_desc"),
        ]

    def __str__(self):
        vessel_label = (
            self.vessel.name if self.vessel and self.vessel.name
            else (self.vessel.imo_number if self.vessel else "No Vessel")
        )
        return f"{self.event_type} - {vessel_label}"
    


class SafetyZone(models.Model):
    zone_type = models.CharField(max_length=100, db_index=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.FloatField(help_text="Radius in km")
    severity = models.CharField(max_length=50, default="medium")
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["zone_type"], name="idx_zone_type"),
            models.Index(fields=["expires_at"], name="idx_zone_expires"),
        ]

    def __str__(self):
        return f"{self.zone_type} - {self.severity}"


class ExternalSafetyData(models.Model):
    source = models.CharField(max_length=100)
    external_id = models.CharField(max_length=100)
    zone_type = models.CharField(max_length=100)

    latitude = models.FloatField()
    longitude = models.FloatField()
    radius = models.FloatField(default=0)

    severity = models.CharField(max_length=50, default="medium")
    fetched_at = models.DateTimeField(auto_now_add=True)

    raw_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["source", "external_id"],
                name="uniq_external_source_id"
            )
        ]
        indexes = [
        models.Index(fields=['source', 'fetched_at']),
        models.Index(fields=['zone_type']),
        ] 


    def __str__(self):
        return f"{self.source} - {self.external_id}"



class ApiIntegrationLog(models.Model):
    STATUS_CHOICES = [
        ("success", "Success"),
        ("failed", "Failed"),
    ]

    source = models.CharField(max_length=100)
    endpoint = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    message = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["source", "-created_at"], name="idx_api_log_source_created"),
            models.Index(fields=["status"], name="idx_api_log_status"),
        ]

    def __str__(self):
        return f"{self.source} - {self.status} - {self.created_at}" 