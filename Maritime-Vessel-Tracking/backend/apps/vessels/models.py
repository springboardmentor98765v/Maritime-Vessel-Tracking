from django.db import models


class Vessel(models.Model):

    imo_number = models.CharField(
        max_length=50,
        unique=True,
        db_index=True
    )

    name = models.CharField(
        max_length=100,
        db_index=True
    )

    vessel_type = models.CharField(max_length=50, db_index=True)
    flag = models.CharField(max_length=50, db_index=True)
    cargo_type = models.CharField(max_length=50, db_index=True)

    # ✅ Added from design diagram
    operator = models.CharField(max_length=100, blank=True, null=True)

    last_position_lat = models.FloatField(null=True, blank=True)
    last_position_lon = models.FloatField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True, db_index=True)
    heading = models.FloatField(null=True, blank=True)
    destination = models.CharField(max_length=255, null=True, blank=True, db_index=True)

    last_update = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['imo_number']),
            models.Index(fields=['vessel_type']),
            models.Index(fields=['flag']),
            models.Index(fields=['last_update']),
            models.Index(fields=['destination']),
            models.Index(fields=['speed']),
            models.Index(fields=['last_update', 'destination']),  # Composite for filtering
            models.Index(fields=['vessel_type', 'flag']),  # Composite for filtering
        ]

    def __str__(self):
        return f"{self.name} ({self.imo_number})"


class VesselSubscription(models.Model):
    """Tracks which users have subscribed to alerts for which vessels."""
    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='vessel_subscriptions'
    )
    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        related_name='subscribers'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'vessel')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['vessel']),
            models.Index(fields=['user', 'vessel']),  # Composite for lookups
        ]

    def __str__(self):
        return f"{self.user.username} → {self.vessel.name}"


class VesselEvent(models.Model):
    """Events linked to a vessel (piracy, accidents, weather alerts, etc.)."""

    EVENT_TYPES = [
        ('piracy', 'Piracy'),
        ('accident', 'Accident'),
        ('weather', 'Weather Alert'),
        ('port_delay', 'Port Delay'),
        ('inspection', 'Inspection'),
        ('stopped', 'Stopped'),
        ('underway', 'Underway'),
        ('route_changed', 'Route Changed'),
        ('entered_port', 'Entered Port'),
        ('ais_lost', 'AIS Signal Lost'),
        ('other', 'Other'),
    ]

    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        related_name='events'
    )

    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    location = models.CharField(max_length=255, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()
    details = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['vessel', 'timestamp']),
            models.Index(fields=['vessel']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['event_type']),
        ]

    def __str__(self):
        return f"{self.event_type} — {self.vessel.name} @ {self.timestamp}"


class SafetyEvent(models.Model):
    """Geographic safety hazard overlay: piracy, storm, accident, restricted zone."""

    TYPE_CHOICES = [
        ('piracy', 'Piracy Zone'),
        ('storm', 'Storm / Severe Weather'),
        ('accident', 'Maritime Accident'),
        ('restricted', 'Restricted Area'),
        ('other', 'Other Hazard'),
    ]
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    event_type = models.CharField(max_length=50, choices=TYPE_CHOICES, db_index=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='medium', db_index=True)

    latitude = models.FloatField()
    longitude = models.FloatField()
    radius_nm = models.FloatField(default=50.0)

    source = models.CharField(max_length=100, default='manual')
    active_from = models.DateTimeField()
    active_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-active_from']
        indexes = [
            models.Index(fields=['event_type', 'is_active']),
            models.Index(fields=['severity', 'is_active']),
        ]

    def __str__(self):
        return f"[{self.severity.upper()}] {self.event_type} — {self.title}"
