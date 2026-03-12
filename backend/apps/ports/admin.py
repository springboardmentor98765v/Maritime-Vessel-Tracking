from django.contrib import admin
from .models import Port, PortTrafficHistory, SafetyZone, ExternalSafetyData


@admin.register(Port)
class PortAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'country', 'location',
        'congestion_score', 'avg_wait_time',
        'arrivals', 'departures',
        'last_analytics_update', 'last_update',
    ]
    list_filter = ['country']
    search_fields = ['name', 'country', 'location']
    ordering = ['name']
    readonly_fields = ['created_at']


@admin.register(PortTrafficHistory)
class PortTrafficHistoryAdmin(admin.ModelAdmin):
    """Milestone-3: Historical congestion snapshots per port."""
    list_display = [
        'port', 'timestamp',
        'arrivals', 'departures', 'congestion_score',
    ]
    list_filter = ['port']
    search_fields = ['port__name']
    ordering = ['-timestamp']
    date_hierarchy = 'timestamp'


@admin.register(SafetyZone)
class SafetyZoneAdmin(admin.ModelAdmin):
    """Milestone-3: Geographic safety risk zones for map overlays."""
    list_display = [
        'zone_type', 'severity',
        'latitude', 'longitude', 'radius',
        'created_at', 'expires_at',
    ]
    list_filter = ['zone_type', 'severity']
    search_fields = ['description']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'


@admin.register(ExternalSafetyData)
class ExternalSafetyDataAdmin(admin.ModelAdmin):
    """Milestone-3: Staging table for raw external data (NOAA, UNCTAD, etc.)."""
    list_display = [
        'source', 'status',
        'checksum', 'created_at', 'processed_at',
    ]
    list_filter = ['source', 'status']
    search_fields = ['source', 'checksum']
    ordering = ['-created_at']
    readonly_fields = ['checksum', 'created_at']
    date_hierarchy = 'created_at'
