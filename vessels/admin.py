from django.contrib import admin
from django.shortcuts import redirect
from django.urls import reverse
from django.contrib import messages
from .models import Vessel

@admin.action(description='Edit ship details')
def edit_ship_details(modeladmin, request, queryset):
    if queryset.count() != 1:
        modeladmin.message_user(
            request,
            "Please select exactly one vessel to edit.",
            messages.ERROR
        )
        return
    
    vessel = queryset.first()
    # Redirect to the change view of the selected vessel
    url = reverse(
        f'admin:{vessel._meta.app_label}_{vessel._meta.model_name}_change',
        args=[vessel.pk]
    )
    return redirect(url)

from django.utils.html import format_html

class VesselAdmin(admin.ModelAdmin):
    list_display = ('name', 'imo_number', 'vessel_type', 'status', 'last_updated', 'view_on_map')
    list_filter = ('vessel_type', 'status')
    search_fields = ('name', 'imo_number')
    actions = [edit_ship_details]

    def view_on_map(self, obj):
        return format_html('<a href="/map/?vessel_id={}" target="_blank">View on Map</a>', obj.pk)
    view_on_map.short_description = 'Map'

admin.site.register(Vessel, VesselAdmin)