from django.urls import path
from .views import PortListView, PortDetailView, PortCongestionDashboardView

urlpatterns = [
    path('', PortListView.as_view()),                      # GET /ports/
    path('congestion/', PortCongestionDashboardView.as_view()),  # GET /ports/congestion/
    path('<int:pk>/', PortDetailView.as_view()),            # GET /ports/<id>/
]
