from django.urls import path
from .views import company_dashboard, port_dashboard

urlpatterns = [
    path("company/", company_dashboard, name="company_dashboard"),
    path("port/", port_dashboard, name="port_dashboard"),
]