from django.urls import path
from .views import VoyageListView, VoyageDetailView, VoyageHistoryAPIView, VoyageAuditAPIView

urlpatterns = [
    path('', VoyageListView.as_view()),              # GET /voyages/?vessel=&status=&port_from=&port_to=
    path('<int:pk>/', VoyageDetailView.as_view()),   # GET /voyages/<id>/
    path('<int:pk>/history/', VoyageHistoryAPIView.as_view()),  # GET /voyages/<id>/history/
    path('<int:pk>/audit/', VoyageAuditAPIView.as_view()),  # GET /api/voyage/<id>/audit/
]
