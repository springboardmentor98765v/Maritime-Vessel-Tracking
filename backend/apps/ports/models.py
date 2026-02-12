from django.db import models

# Create your models here.
class Port(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    country = models.CharField(max_length=100)

    congestion_score = models.FloatField()
    avg_wait_time = models.FloatField()

    arrivals = models.IntegerField()
    departures = models.IntegerField()

    last_update = models.DateTimeField()
