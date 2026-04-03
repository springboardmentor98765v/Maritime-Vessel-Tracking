from django.contrib import admin
from .models import Port, PortTrafficHistory


@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "country", "congestion_score", "last_analytics_update")


@admin.register(PortTrafficHistory)
class PortTrafficHistoryAdmin(admin.ModelAdmin):
    list_display = ("id", "port", "timestamp", "arrivals", "departures", "congestion_score")