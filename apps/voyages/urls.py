from django.urls import path
from .views import voyage_history,voyage_audit

urlpatterns = [
    path("<int:vessel_id>/history/", voyage_history, name="voyage_history"),
    path('<int:voyage_id>/audit/', voyage_audit, name="voyage_audit"),
]