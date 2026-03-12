from django.db import models


class Port(models.Model):
    """
    Represents a maritime port.
    Extended for Milestone-3: added last_analytics_update + index on congestion_score.
    """

    name = models.CharField(
        max_length=100,
        db_index=True
    )

    location = models.CharField(max_length=100)

    country = models.CharField(
        max_length=100,
        db_index=True
    )

    # --- Analytics fields ---
    congestion_score = models.FloatField(default=0.0)
    avg_wait_time = models.FloatField(default=0.0)

    # Milestone-3: track when congestion analytics were last calculated
    last_analytics_update = models.DateTimeField(null=True, blank=True)

    # --- Traffic counters ---
    arrivals = models.PositiveIntegerField(default=0)
    departures = models.PositiveIntegerField(default=0)

    last_update = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        indexes = [
            # Milestone-3: fast congestion dashboard queries
            models.Index(fields=['congestion_score'], name='port_congestion_idx'),
            models.Index(fields=['country'], name='port_country_idx'),
        ]

    def __str__(self):
        return f"{self.name}, {self.country}"


class PortTrafficHistory(models.Model):
    """
    Milestone-3 — Step 2: Historical port traffic data.
    Stores per-snapshot arrivals, departures, and congestion score over time.
    Used by analytics dashboards and charts.
    """

    port = models.ForeignKey(
        Port,
        on_delete=models.CASCADE,
        related_name='traffic_history',
        db_index=True
    )

    timestamp = models.DateTimeField(db_index=True)

    arrivals = models.PositiveIntegerField(default=0)
    departures = models.PositiveIntegerField(default=0)

    congestion_score = models.FloatField(default=0.0)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['port'], name='traffic_port_idx'),
            models.Index(fields=['timestamp'], name='traffic_timestamp_idx'),
            # Composite index for the most common query pattern
            models.Index(fields=['port', 'timestamp'], name='traffic_port_ts_idx'),
        ]

    def __str__(self):
        return f"{self.port.name} @ {self.timestamp} | arr={self.arrivals} dep={self.departures}"


class SafetyZone(models.Model):
    """
    Milestone-3 — Step 3: Geographic safety risk zones.
    Stores storms, piracy zones, accident zones for map overlays and vessel risk checks.
    """

    ZONE_TYPE_CHOICES = [
        ('storm', 'Storm / Severe Weather'),
        ('piracy', 'Piracy Zone'),
        ('accident', 'Accident Zone'),
        ('restricted', 'Restricted Area'),
        ('other', 'Other Hazard'),
    ]

    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    zone_type = models.CharField(
        max_length=50,
        choices=ZONE_TYPE_CHOICES,
        db_index=True
    )

    latitude = models.FloatField()
    longitude = models.FloatField()

    # Radius in nautical miles
    radius = models.FloatField(
        default=50.0,
        help_text='Radius of the safety zone in nautical miles'
    )

    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='medium'
    )

    description = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    # null means zone never expires
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['zone_type'], name='safety_zone_type_idx'),
            models.Index(fields=['expires_at'], name='safety_expires_idx'),
            # Composite: most common dashboard query
            models.Index(fields=['zone_type', 'expires_at'], name='safety_zone_expires_idx'),
        ]

    def __str__(self):
        return f"[{self.severity.upper()}] {self.zone_type} @ ({self.latitude:.3f}, {self.longitude:.3f})"


class ExternalSafetyData(models.Model):
    """
    Milestone-3 — Step 4: Staging table for raw external data (NOAA, UNCTAD, etc.).
    Raw records are stored here before being processed into SafetyZone records.
    Uses a checksum field to prevent duplicate inserts.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
    ]

    # Source identifier, e.g. 'NOAA', 'UNCTAD', 'IMO'
    source = models.CharField(max_length=100, db_index=True)

    # Raw JSON payload from the external source
    raw_data = models.JSONField()

    # MD5/SHA checksum of the raw_data — enforces uniqueness to prevent duplicates
    checksum = models.CharField(
        max_length=64,
        unique=True,
        help_text='SHA-256 / MD5 hash of raw_data to prevent duplicate inserts'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['source'], name='ext_source_idx'),
            models.Index(fields=['status'], name='ext_status_idx'),
            models.Index(fields=['created_at'], name='ext_created_at_idx'),
        ]
        # Explicit verbose names for admin
        verbose_name = 'External Safety Data'
        verbose_name_plural = 'External Safety Data'

    def __str__(self):
        return f"[{self.status.upper()}] {self.source} — {self.created_at}"
