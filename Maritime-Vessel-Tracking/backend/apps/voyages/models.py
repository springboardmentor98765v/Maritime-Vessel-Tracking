from django.db import models
from django.db.models import Q, F


class Voyage(models.Model):

    vessel = models.ForeignKey(
        'vessels.Vessel',
        on_delete=models.CASCADE,
        related_name='voyages'
    )

    port_from = models.ForeignKey(
        'ports.Port',
        related_name='voyage_departures',
        on_delete=models.CASCADE
    )

    port_to = models.ForeignKey(
        'ports.Port',
        related_name='voyage_arrivals',
        on_delete=models.CASCADE
    )

    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=50,
        db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-departure_time']

        indexes = [
            models.Index(fields=['vessel', 'status']),
        ]

        constraints = [
            models.CheckConstraint(
                check=Q(arrival_time__gte=F('departure_time')) | Q(arrival_time__isnull=True),
                name='arrival_after_departure'
            )
        ]

    def __str__(self):
        return f"{self.vessel.name} - {self.status}"
