from django.db.models import Count, Q
from apps.vessels.models import Vessel, VesselPosition
from apps.voyages.models import Voyage
from apps.ports.models import Port
from apps.notifications.models import Event

print("\n===== VESSEL CHECK =====")
print("Lat null:", Vessel.objects.filter(last_position_lat__isnull=True).count())
print("Lon null:", Vessel.objects.filter(last_position_lon__isnull=True).count())
print("MMSI missing:", Vessel.objects.filter(mmsi__isnull=True).count())
print("Operator missing:", Vessel.objects.filter(Q(operator__isnull=True) | Q(operator="")).count())
print("Last update null:", Vessel.objects.filter(last_update__isnull=True).count())

dup_vessels = Vessel.objects.values("imo_number").annotate(c=Count("id")).filter(c__gt=1)
print("Duplicate IMO:", dup_vessels.count())

print("\n===== VESSEL POSITION CHECK =====")
print("Lat null:", VesselPosition.objects.filter(latitude__isnull=True).count())
print("Lon null:", VesselPosition.objects.filter(longitude__isnull=True).count())
print("Timestamp null:", VesselPosition.objects.filter(timestamp__isnull=True).count())

print("\n===== VOYAGE CHECK =====")
print("Departure null:", Voyage.objects.filter(departure_time__isnull=True).count())
print("Arrival null:", Voyage.objects.filter(arrival_time__isnull=True).count())
print("Status missing:", Voyage.objects.filter(Q(status__isnull=True) | Q(status="")).count())

dup_voyages = Voyage.objects.values("vessel", "departure_time", "port_from", "port_to").annotate(c=Count("id")).filter(c__gt=1)
print("Duplicate voyages:", dup_voyages.count())

print("\n===== PORT CHECK =====")
print("Congestion null:", Port.objects.filter(congestion_score__isnull=True).count())
print("Wait time null:", Port.objects.filter(avg_wait_time__isnull=True).count())

dup_ports = Port.objects.values("name").annotate(c=Count("id")).filter(c__gt=1)
print("Duplicate ports:", dup_ports.count())

print("\n===== EVENT CHECK =====")
print("Lat null:", Event.objects.filter(latitude__isnull=True).count())
print("Lon null:", Event.objects.filter(longitude__isnull=True).count())
print("Timestamp null:", Event.objects.filter(timestamp__isnull=True).count())