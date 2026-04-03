import django_filters
from .models import Vessel

class VesselFilter(django_filters.FilterSet):
    vessel_type = django_filters.CharFilter(field_name="vessel_type")
    flag = django_filters.CharFilter(field_name="flag")
    imo_number = django_filters.CharFilter(field_name="imo_number")
    mmsi = django_filters.CharFilter(field_name="mmsi")

    class Meta:
        model = Vessel
        fields = ["vessel_type", "flag", "imo_number", "mmsi"]
