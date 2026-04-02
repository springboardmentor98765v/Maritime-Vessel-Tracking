from django.urls import path

from .views import (
    AdminApiStatusView,
    AdminLogsView,
    AdminVoyageExportView,
    CompanyDashboardView,
    PortAnalyticsView,
    PortDashboardView,
    SafetyStatusView,
    SafetyZonesView,
    SubscribeView,
    UnsubscribeView,
    UserNotificationListView,
    NotificationMarkReadView,
    VesselDetailView,
    VesselListView,
)

urlpatterns = [
    path("", VesselListView.as_view()),
    path("dashboard/company/", CompanyDashboardView.as_view(), name="dashboard-company"),
    path("dashboard/port/", PortDashboardView.as_view(), name="dashboard-port"),
    path("admin/api-status/", AdminApiStatusView.as_view(), name="admin-api-status"),
    path("admin/logs/", AdminLogsView.as_view(), name="admin-logs"),
    path("admin/export/voyages/", AdminVoyageExportView.as_view(), name="admin-export-voyages"),
    path("<int:vessel_id>/", VesselDetailView.as_view()),
    path("<int:vessel_id>/subscribe/", SubscribeView.as_view(), name="vessel-subscribe"),
    path("<int:vessel_id>/unsubscribe/", UnsubscribeView.as_view(), name="vessel-unsubscribe"),
    path("safety/zones/", SafetyZonesView.as_view()),
    path("safety/status/", SafetyStatusView.as_view()),
    path("notifications/", UserNotificationListView.as_view(), name="user-notifications"),
    path("notifications/<int:notification_id>/mark-read/", NotificationMarkReadView.as_view(), name="notification-mark-read"),
    path("ports/analytics/", PortAnalyticsView.as_view()),
]