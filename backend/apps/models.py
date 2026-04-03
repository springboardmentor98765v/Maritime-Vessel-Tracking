from django.db import models
from django.conf import settings
from apps.vessels.models import Vessel
from apps.ports.models import Port

class Voyage(models.Model):
    STATUS_CHOICES = (
        ("PLANNED", "Planned"),
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
        ("DELAYED", "Delayed"),
    )

    vessel = models.ForeignKey(
        Vessel,
        related_name="voyages",
        on_delete=models.CASCADE
    )

    departure_port = models.ForeignKey(
        Port,
        related_name="departures",
        on_delete=models.SET_NULL,
        null=True,
        db_column="departure_port"
    )

    arrival_port = models.ForeignKey(
        Port,
        related_name="arrivals",
        on_delete=models.SET_NULL,
        null=True,
        db_column="arrival_port" 
    )

    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True, blank=True)

    #status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    #risk_score = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = "voyages"
    def __str__(self):
        return f"{self.vessel.name} Voyage"

class VoyageHistory(models.Model):
    voyage = models.ForeignKey(
        Voyage,
        related_name="history",
        on_delete=models.CASCADE
    )

    latitude = models.FloatField()
    longitude = models.FloatField()

    speed = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ["timestamp"]
        indexes = [
            models.Index(fields=["voyage", "timestamp"])
        ]

    def __str__(self):
        return f"{self.voyage.id} - {self.timestamp}"

class Compliance(models.Model):
    voyage = models.OneToOneField(
        Voyage,
        related_name="compliance",
        on_delete=models.CASCADE
    )

    piracy_zone_crossed = models.BooleanField(default=False)
    severe_weather_encountered = models.BooleanField(default=False)
    port_delay = models.BooleanField(default=False)

    compliance_score = models.FloatField(default=100)

    def __str__(self):
        return f"Compliance for Voyage {self.voyage.id}"
