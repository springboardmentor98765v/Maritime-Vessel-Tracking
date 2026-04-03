from django.db import models
from apps.vessels.models import Vessel
from apps.ports.models import Port

class Voyage(models.Model):
    vessel = models.ForeignKey(Vessel, on_delete=models.CASCADE, related_name="voyages")
    port_from = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name="voyages_from") 
    port_to   = models.ForeignKey(Port, on_delete=models.SET_NULL, null=True, related_name="voyages_to")    

    departure_time = models.DateTimeField(blank=True, null=True)
    arrival_time = models.DateTimeField(blank=True, null=True)
    STATUS_CHOICES = [
        ("planned", "Planned"),
        ("in_transit", "In Transit"),
        ("completed", "Completed"),
    ]


    status = models.CharField(max_length=50, default="scheduled")  # scheduled / in_transit / completed

    class Meta:
        indexes = [
            models.Index(fields=['vessel', 'departure_time']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.vessel.name}: {self.port_from} -> {self.port_to}"
    


class VoyageHistory(models.Model):

    vessel = models.ForeignKey(
        "vessels.Vessel",
        on_delete=models.CASCADE,
        related_name="voyage_history"
    )

    port_from = models.ForeignKey(
        "ports.Port",
        on_delete=models.CASCADE,
        related_name="history_departures"
    )

    port_to = models.ForeignKey(
        "ports.Port",
        on_delete=models.CASCADE,
        related_name="history_arrivals"
    )

    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()

    distance_nm = models.FloatField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vessel} {self.port_from} → {self.port_to}"
    

class ComplianceRecord(models.Model):

    STATUS_CHOICES = [
        ("passed", "Passed"),
        ("failed", "Failed"),
        ("pending", "Pending"),
    ]

    vessel = models.ForeignKey(
        "vessels.Vessel",
        on_delete=models.CASCADE,
        related_name="compliance_records"
    )

    regulation = models.CharField(max_length=255)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    inspection_date = models.DateTimeField()

    inspector = models.CharField(max_length=255, blank=True)

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vessel} - {self.regulation} ({self.status})"