from django.db import models

# Create your models here.
class Voyage(models.Model):

    vessel = models.ForeignKey(
        'vessels.Vessel',
        on_delete=models.CASCADE
    )

    port_from = models.ForeignKey(
        'ports.Port',
        related_name='from_port',
        on_delete=models.CASCADE
    )

    port_to = models.ForeignKey(
        'ports.Port',
        related_name='to_port',
        on_delete=models.CASCADE
    )

    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField(null=True)
    status = models.CharField(max_length=50)
