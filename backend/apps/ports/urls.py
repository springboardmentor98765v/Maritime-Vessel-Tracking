from django.urls import path
from .views import PortAnalyticsView, PortListView
from .views import PortDetailAnalyticsView



urlpatterns = [
    path('analytics/', PortAnalyticsView.as_view(), name='port-analytics'),
    path('', PortListView.as_view(), name='port-list'),
     path('analytics/<str:port_name>/', PortDetailAnalyticsView.as_view()),
]