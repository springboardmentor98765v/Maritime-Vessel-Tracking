from django.contrib import admin
from .models import Notification, Event, Subscription

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'message', 'created_at', 'is_read')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__username', 'message')

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('vessel', 'event_type', 'timestamp', 'latitude', 'longitude')
    list_filter = ('event_type', 'timestamp')
    search_fields = ('vessel__name', 'event_type')

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'vessel', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'vessel__name')