from django.db import models

# Create your models here.
class Notification(models.Model):

    user = models.ForeignKey(
        'authentication.User',
        on_delete=models.CASCADE
    )

    vessel = models.ForeignKey(
        'vessels.Vessel',
        on_delete=models.CASCADE
    )

   
    message = models.TextField()
    type = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
