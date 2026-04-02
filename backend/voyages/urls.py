from django.urls import path
from .views import VoyageListView, VesselVoyageHistoryView, VoyageAuditView


urlpatterns = [

    path("", VoyageListView.as_view()),
    path("<int:vessel_id>/history/", VesselVoyageHistoryView.as_view(), name="voyage-history"),
    path("audit/<int:voyage_id>/", VoyageAuditView.as_view(), name="voyage-audit"),

]