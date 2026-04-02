from django.db import models
from vessels.models import Vessel


class Voyage(models.Model):

    vessel = models.ForeignKey(
        Vessel,
        on_delete=models.CASCADE,
        related_name="voyages"
    )

    start_port = models.CharField(max_length=100)
    end_port = models.CharField(max_length=100)

    origin_port_id = models.IntegerField(null=True, blank=True)
    destination_port_id = models.IntegerField(null=True, blank=True)

    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=[
            ("ONGOING", "Ongoing"),
            ("COMPLETED", "Completed")
        ],
        default="ONGOING"
    )

    def __str__(self):
        return f"{self.vessel} : {self.start_port} → {self.end_port}"


class VoyageHistory(models.Model):

    voyage = models.ForeignKey(
        Voyage,
        on_delete=models.CASCADE,
        related_name="history"
    )

    latitude = models.FloatField()
    longitude = models.FloatField()

    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.voyage} @ {self.timestamp}"

    class Meta:
        indexes = [
            models.Index(fields=['voyage', 'timestamp'], name='idx_voyage_time'),
        ]


class Compliance(models.Model):

    voyage = models.ForeignKey(
        Voyage,
        on_delete=models.CASCADE
    )

    rule_name = models.CharField(max_length=200)

    status = models.CharField(
        max_length=20,
        choices=[
            ("COMPLIANT", "Compliant"),
            ("VIOLATION", "Violation")
        ]
    )

    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rule_name} - {self.status}"