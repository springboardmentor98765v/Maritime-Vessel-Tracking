from django.contrib import admin
from .models import Vessel, VesselEvent, VesselSubscription, Notification


admin.site.register(Vessel)
admin.site.register(VesselEvent)
admin.site.register(VesselSubscription)
admin.site.register(Notification)