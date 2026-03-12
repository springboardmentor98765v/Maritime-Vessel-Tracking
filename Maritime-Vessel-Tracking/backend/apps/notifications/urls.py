from django.urls import path
from .views import NotificationListView, MarkNotificationReadView

urlpatterns = [
    path('', NotificationListView.as_view()),              # GET /notifications/
    path('<int:pk>/read/', MarkNotificationReadView.as_view()), # POST /notifications/<id>/read/
]
