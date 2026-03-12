from django.urls import path
from .views import PortListView, PortDetailView, PortCongestionDashboardView, PortAnalyticsView, PortDetailAnalyticsView

urlpatterns = [
    path('', PortListView.as_view()),                        # GET /ports/
    path('congestion/', PortCongestionDashboardView.as_view()),  # GET /ports/congestion/
    path('analytics/', PortAnalyticsView.as_view()),         # GET /ports/analytics/
    path('<int:pk>/', PortDetailView.as_view()),              # GET /ports/<id>/
    path('<int:pk>/analytics/', PortDetailAnalyticsView.as_view()),  # GET /ports/<id>/analytics/
]
