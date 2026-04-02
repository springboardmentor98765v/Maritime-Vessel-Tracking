"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from vessels.views import CompanyDashboardView, PortDashboardView, AdminApiStatusView, AdminLogsView, AdminVoyageExportView
from voyages.views import VesselVoyageHistoryView, VoyageAuditView

urlpatterns = [

    path('admin/', admin.site.urls),

    path('api/auth/', include('authentication.urls')),

    path('api/vessels/', include('vessels.urls')),

    path('api-auth/', include('rest_framework.urls')),
    
    path('api/voyages/', include('voyages.urls')),

    # Milestone 4 aliases
    path("api/dashboard/company/", CompanyDashboardView.as_view()),
    path("api/dashboard/port/", PortDashboardView.as_view()),
    path("api/admin/api-status/", AdminApiStatusView.as_view()),
    path("api/admin/logs/", AdminLogsView.as_view()),
    path("api/admin/export/voyages/", AdminVoyageExportView.as_view()),
    path("api/voyage/<int:vessel_id>/history/", VesselVoyageHistoryView.as_view()),
    path("api/voyage/<int:voyage_id>/audit/", VoyageAuditView.as_view()),

]