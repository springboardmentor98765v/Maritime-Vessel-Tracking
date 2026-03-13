from django.db import models


class Port(models.Model):

    name = models.CharField(
        max_length=100,
        db_index=True
    )

    location = models.CharField(max_length=100)

    country = models.CharField(
        max_length=100,
        db_index=True
    )

    congestion_score = models.FloatField()
    avg_wait_time = models.FloatField()

    arrivals = models.PositiveIntegerField()
    departures = models.PositiveIntegerField()

    last_update = models.DateTimeField(db_index=True)
    last_analytics_update = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['country']),
            models.Index(fields=['last_update']),
            models.Index(fields=['congestion_score']),  # For sorting by congestion
            models.Index(fields=['country', 'congestion_score']),  # Composite for filtering
        ]

    def __str__(self):
        return f"{self.name}, {self.country}"


class PortTrafficHistory(models.Model):
    """Stores historical port traffic data for congestion analysis."""
    port = models.ForeignKey(Port, on_delete=models.CASCADE, related_name='traffic_history')
    timestamp = models.DateTimeField(db_index=True)
    arrivals = models.PositiveIntegerField()
    departures = models.PositiveIntegerField()
    congestion_score = models.FloatField()

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['port', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.port.name} - {self.timestamp}"

