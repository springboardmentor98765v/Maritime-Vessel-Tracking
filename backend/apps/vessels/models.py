from django.db import models

# Create your models here.
from django.db import models

class Vessel(models.Model):
    imo_number = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    flag = models.CharField(max_length=50)
    cargo_type = models.CharField(max_length=50)

    last_position_lat = models.FloatField(null=True)
    last_position_lon = models.FloatField(null=True)
    last_update = models.DateTimeField(null=True)

    def __str__(self):
        return self.name
