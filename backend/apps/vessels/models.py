from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Vessel(models.Model):
    """Static + latest snapshot for a vessel (Milestone 2)."""

    # Core identifiers
    imo_number = models.CharField(max_length=20, unique=True, db_index=True)
    mmsi = models.CharField(max_length=9, unique=True, null=True, blank=True, db_index=True)

    # Metadata
    name = models.CharField(max_length=255, blank=True, default="")
    vessel_type = models.CharField(max_length=100, blank=True, default="", db_index=True)
    flag = models.CharField(max_length=50, blank=True, default="", db_index=True)
    STATUS_CHOICES = [
    ('in_transit', 'In Transit'),
    ('in_port', 'In Port'),
    ('anchored', 'Anchored'),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="in_transit"
    )
    destination = models.CharField(max_length=255, blank=True, default="", db_index=True)

    cargo_type = models.CharField(max_length=100, blank=True, default="")
    operator = models.CharField(max_length=255, blank=True, default="")

    # Latest/last known position
    last_position_lat = models.FloatField(
        null=True, blank=True,
        validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)],
    )
    last_position_lon = models.FloatField(
        null=True, blank=True,
        validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)],
    )
    speed = models.FloatField(null=True, blank=True)    # knots (optional)
    heading = models.FloatField(null=True, blank=True)  # degrees

    # last update time (from AIS/background job)
    last_update = models.DateTimeField(null=True, blank=True, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["imo_number"], name="idx_vessel_imo"),
            models.Index(fields=["mmsi"], name="idx_vessel_mmsi"),
            models.Index(fields=["vessel_type"], name="idx_vessel_type"),
            models.Index(fields=["flag"], name="idx_vessel_flag"),
            models.Index(fields=["destination"], name="idx_vessel_destination"),
            models.Index(fields=["last_update"], name="idx_vessel_last_update"),
            models.Index(fields=["-last_update"], name="idx_vessel_last_update_desc"),
            models.Index(fields=["vessel_type", "flag", "-last_update"], name="idx_vessel_type_flag_lu_desc"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(last_position_lat__gte=-90.0, last_position_lat__lte=90.0)
                      | models.Q(last_position_lat__isnull=True),
                name="chk_vessel_lat_valid",
            ),
            models.CheckConstraint(
                condition=models.Q(last_position_lon__gte=-180.0, last_position_lon__lte=180.0)
                      | models.Q(last_position_lon__isnull=True),
                name="chk_vessel_lon_valid",
            ),
        ]

    def __str__(self):
        label = self.name or "Unnamed"
        return f"{label} ({self.imo_number})"


class VesselPosition(models.Model):
    """Time-series positions for history & analytics."""

    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="positions", db_index=True)
    latitude = models.FloatField(validators=[MinValueValidator(-90.0), MaxValueValidator(90.0)])
    longitude = models.FloatField(validators=[MinValueValidator(-180.0), MaxValueValidator(180.0)])
    speed = models.FloatField(blank=True, null=True)
    heading = models.FloatField(blank=True, null=True)
    timestamp = models.DateTimeField(db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["vessel", "-timestamp"], name="idx_pos_vessel_ts_desc"),
            models.Index(fields=["-timestamp"], name="idx_pos_ts_desc"),
        ]

    def __str__(self):
        return f"{self.vessel.imo_number} @ {self.timestamp}"


class VesselRoute(models.Model):

    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        related_name="routes"
    )

    origin_port = models.ForeignKey(
        "ports.Port",
        on_delete=models.CASCADE,
        related_name="route_origin"
    )

    destination_port = models.ForeignKey(
        "ports.Port",
        on_delete=models.CASCADE,
        related_name="route_destination"
    )

    departure_time = models.DateTimeField()
    estimated_arrival = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vessel.name} : {self.origin_port} → {self.destination_port}"
    


class VesselAlert(models.Model):

    ALERT_TYPES = [
        ('weather', 'Weather Alert'),
        ('piracy', 'Piracy Alert'),
        ('delay', 'Delay'),
        ('safety', 'Safety Warning'),
    ]

    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        related_name="alerts"
    )

    alert_type = models.CharField(
        max_length=20,
        choices=ALERT_TYPES
    )

    message = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vessel.name} - {self.alert_type}"