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

    type = models.CharField(max_length=50)
    flag = models.CharField(max_length=50)
    cargo_type = models.CharField(max_length=50)

    last_position_lat = models.FloatField(null=True, blank=True)
    last_position_lon = models.FloatField(null=True, blank=True)

    last_update = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.imo_number})"
