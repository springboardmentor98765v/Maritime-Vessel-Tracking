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

    last_update = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name}, {self.country}"
