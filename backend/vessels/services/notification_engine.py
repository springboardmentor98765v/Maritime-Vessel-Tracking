from vessels.models import Notification


def create_notification(message):

    notification = Notification.objects.create(
        message=message
    )

    return {
        "notification_id": notification.id,
        "message": notification.message
    }


def get_all_notifications():

    notifications = Notification.objects.all().order_by("-created_at")

    data = []

    for n in notifications:
        data.append({
            "id": n.id,
            "message": n.message,
            "time": n.created_at
        })

    return data