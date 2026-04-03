from django.db import models

class Port(models.Model):
    name = models.CharField(max_length=255, unique=True)
    location = models.CharField(max_length=255, blank=True, null=True)  # city/region
    country = models.CharField(max_length=100, blank=True, null=True)
    unlocode = models.CharField(max_length=10, unique=True, null=True, blank=True)

    city = models.CharField(max_length=100, null=True, blank=True)

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    PORT_TYPE_CHOICES = [
        ("cargo", "Cargo"),
        ("container", "Container"),
        ("oil", "Oil"),
        ("mixed", "Mixed"),
    ]

    port_type = models.CharField(
        max_length=20,
        choices=PORT_TYPE_CHOICES,
        default="cargo"
    )

    number_of_berths = models.IntegerField(null=True, blank=True)

    congestion_score = models.FloatField(default=0)
    avg_wait_time = models.FloatField(default=0)  # hours
    arrivals = models.IntegerField(default=0)
    departures = models.IntegerField(default=0)

    last_analytics_update = models.DateTimeField(auto_now=True)
    class Meta:
        indexes = [
            models.Index(fields=["congestion_score"], name="idx_port_congestion"),
        ]

    def __str__(self):
        return self.name

class PortTrafficHistory(models.Model):
    port = models.ForeignKey(
        Port,
        on_delete=models.CASCADE,
        related_name="traffic_history",
        db_index=True,
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    arrivals = models.IntegerField(default=0)
    departures = models.IntegerField(default=0)
    congestion_score = models.FloatField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=["port", "timestamp"], name="idx_porttraffic_port_ts"),
        ]

    def __str__(self):
        return f"{self.port.name} - {self.timestamp}"