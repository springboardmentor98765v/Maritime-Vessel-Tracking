from django.conf import settings
from django.db import models


class Vessel(models.Model):
    vessel_name = models.CharField(max_length=100)
    mmsi = models.CharField(max_length=20, unique=True)
    imo_number = models.CharField(max_length=20, unique=True)

    latitude = models.FloatField()
    longitude = models.FloatField()
    speed = models.FloatField()

    vessel_type = models.CharField(max_length=50)
    flag = models.CharField(max_length=100, blank=True, default="")
    cargo_type = models.CharField(max_length=100, blank=True, default="")
    heading = models.FloatField(null=True, blank=True)
    destination = models.CharField(max_length=255, null=True, blank=True)
    last_update = models.DateTimeField(auto_now=True)

    status = models.CharField(max_length=50, null=True, blank=True)
    owner = models.CharField(max_length=255, null=True, blank=True)
    operator = models.CharField(max_length=255, null=True, blank=True)
    year_built = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['imo_number']),
            models.Index(fields=['vessel_type']),
            models.Index(fields=['flag']),
        ]

    def __str__(self):
        return self.vessel_name


class VesselEvent(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="events")
    event_type = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.vessel.vessel_name} - {self.event_type}"


class Subscription(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="subscriptions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "vessel")


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    event = models.ForeignKey(
        VesselEvent,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class SafetyZone(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    radius_km = models.FloatField()
    zone_type = models.CharField(
        max_length=50,
        default="GENERAL",
        help_text="e.g. STORM, PIRACY, ACCIDENT",
    )
    severity = models.CharField(
        max_length=20,
        default="SAFE",
        help_text="SAFE, MEDIUM, HIGH",
    )

    def __str__(self):
        return self.name