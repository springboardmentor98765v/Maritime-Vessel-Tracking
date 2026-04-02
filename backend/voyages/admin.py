from django.contrib import admin
from .models import Voyage, VoyageHistory, Compliance


admin.site.register(Voyage)
admin.site.register(VoyageHistory)
admin.site.register(Compliance)