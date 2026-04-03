from celery import shared_task
from django.contrib.auth import get_user_model
from .models import Notification
from apps.ports.models import Port

@shared_task
def create_congestion_alert(port_id, percentage):
    User = get_user_model()
    port = Port.objects.get(id=port_id)

    users = User.objects.filter(subscriptions__port=port)

    for user in users:
        Notification.objects.create(
            user=user,
            title=f"High Congestion at {port.name}",
            message=f"Congestion reached {percentage}%",
            notification_type="CONGESTION"
        )
