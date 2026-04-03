from django.contrib import admin
from .models import Safety, SafetyZone
from .models import Safety, SafetyZone, ExternalSafetyData

@admin.register(Safety)
class SafetyAdmin(admin.ModelAdmin):
    list_display = ("id", "event_type", "severity", "vessel", "timestamp")


@admin.register(SafetyZone)
class SafetyZoneAdmin(admin.ModelAdmin):
    list_display = ("id", "zone_type", "severity", "latitude", "longitude", "radius", "expires_at")


@admin.register(ExternalSafetyData)
class ExternalSafetyDataAdmin(admin.ModelAdmin):
    list_display = ("id", "source", "external_id", "zone_type", "severity", "fetched_at")