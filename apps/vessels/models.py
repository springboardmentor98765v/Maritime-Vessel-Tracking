from django.db import models

class Vessel(models.Model):
    # Basic Information
    name = models.CharField(max_length=255)
    imo_number = models.CharField(max_length=20, unique=True) # Unique ID for ships
    vessel_type = models.CharField(max_length=100, choices=[
    ('Cargo', 'Cargo'),
    ('Tanker', 'Tanker'),
    ('Passenger', 'Passenger'),
]) # e.g., Cargo, Tanker
    
    # Real-time Location Tracking
    latitude = models.FloatField()
    longitude = models.FloatField()
    current_port = models.CharField(max_length=255, blank=True, null=True)
    
    # Safety & Status
    status = models.CharField(max_length=50, default='Active') # e.g., Underway, At Anchor
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.imo_number})"