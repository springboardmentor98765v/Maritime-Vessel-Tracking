from django.contrib import admin
from .models import Voyage
from .models import VoyageHistory
admin.site.register(VoyageHistory)
from .models import ComplianceRecord
admin.site.register(ComplianceRecord)

@admin.register(Voyage)
class VoyageAdmin(admin.ModelAdmin):
    list_display = ("id", "vessel", "port_from", "port_to", "status")