from django.urls import path
from .views import (
    VesselListView,
    VesselDetailView,
    VesselPositionUpdateView,
    VesselEventListView,
    VesselSubscribeView,
    VesselSubscriptionListView,
)

urlpatterns = [
    path('', VesselListView.as_view()),                         # GET /vessels/?name=&type=&flag=&cargo_type=
    path('subscriptions/', VesselSubscriptionListView.as_view()), # GET /vessels/subscriptions/
    path('<int:pk>/', VesselDetailView.as_view()),              # GET /vessels/<id>/
    path('<int:pk>/position/', VesselPositionUpdateView.as_view()), # POST /vessels/<id>/position/
    path('<int:pk>/events/', VesselEventListView.as_view()),    # GET /vessels/<id>/events/
    path('<int:pk>/subscribe/', VesselSubscribeView.as_view()), # POST/DELETE /vessels/<id>/subscribe/
]
