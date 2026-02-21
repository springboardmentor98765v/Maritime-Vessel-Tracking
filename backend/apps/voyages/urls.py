from django.urls import path
from .views import VoyageListView, VoyageDetailView, VoyageReplayView

urlpatterns = [
    path('', VoyageListView.as_view()),              # GET /voyages/?vessel=&status=&port_from=&port_to=
    path('<int:pk>/', VoyageDetailView.as_view()),   # GET /voyages/<id>/
    path('<int:pk>/replay/', VoyageReplayView.as_view()),  # GET /voyages/<id>/replay/
]
