from django.contrib import admin
from .models import Vessel, SafetyZone, Notification

admin.site.register(Vessel)
admin.site.register(SafetyZone)
admin.site.register(Notification)