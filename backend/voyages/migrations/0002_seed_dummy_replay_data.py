from django.db import migrations
from django.utils import timezone
from datetime import timedelta
import random


def seed_dummy_replay_data(apps, schema_editor):
    Vessel = apps.get_model("vessels", "Vessel")
    Voyage = apps.get_model("voyages", "Voyage")
    VoyageHistory = apps.get_model("voyages", "VoyageHistory")
    VesselEvent = apps.get_model("vessels", "VesselEvent")

    # Avoid duplicating seed data on repeated migrate runs.
    if Voyage.objects.exists() and VoyageHistory.objects.exists():
        return

    vessels = list(Vessel.objects.order_by("id")[:5])
    if not vessels:
        return

    ports = [
        "Mumbai",
        "Chennai",
        "Kolkata",
        "Visakhapatnam",
        "Kochi",
        "Tuticorin",
        "Vishakhapatnam",
        "Mangalore",
    ]

    now = timezone.now()
    random.seed(42)

    voyage_objs = []
    for i, vessel in enumerate(vessels):
        start_port = ports[i % len(ports)]
        end_port = ports[(i + 2) % len(ports)]
        start_time = now - timedelta(days=2, hours=(i * 3) % 6)
        end_time = start_time + timedelta(hours=6 + i)

        voyage_objs.append(
            Voyage(
                vessel_id=vessel.id,
                start_port=start_port,
                end_port=end_port,
                start_time=start_time,
                end_time=end_time,
                status="COMPLETED",
            )
        )

    # Create voyages first (needed for history FK)
    Voyage.objects.bulk_create(voyage_objs)
    created_voyages = list(Voyage.objects.filter(vessel_id__in=[v.id for v in vessels]).order_by("id")[: len(voyage_objs)])

    # Create per-voyage history points
    history_points = []
    event_points = []  # (voyage, idx, event_type, details)
    event_types = [
        ("storm_warning", "Storm warning detected near the route."),
        ("piracy_zone_alert", "Possible piracy activity reported in the zone."),
        ("safety_alert", "General safety alert triggered."),
    ]

    for v_idx, voyage in enumerate(created_voyages):
        base_lat = float(vessels[v_idx].latitude)
        base_lon = float(vessels[v_idx].longitude)
        points = 18
        step = timedelta(minutes=35)
        start_time = voyage.start_time

        # Choose a couple of indices to attach events.
        event_points.append((voyage, 7, *event_types[0]))
        event_points.append((voyage, 12, *event_types[1]))

        for p_idx in range(points):
            t = start_time + (p_idx * step)
            # Small random-walk around the base position.
            lat = base_lat + (p_idx * 0.08) + random.uniform(-0.25, 0.25)
            lon = base_lon + (p_idx * 0.12) + random.uniform(-0.25, 0.25)
            history_points.append(
                VoyageHistory(
                    voyage_id=voyage.id,
                    latitude=lat,
                    longitude=lon,
                    timestamp=t,
                )
            )

    VoyageHistory.objects.bulk_create(history_points)

    # Seed a few VesselEvents so the audit endpoint and replay timeline have “event” entries.
    existing_event_types = set(
        VesselEvent.objects.filter(event_type__in=[et for et, _ in event_types]).values_list("event_type", flat=True)
    )
    if existing_event_types:
        return

    event_objs = []
    for voyage, idx, event_type, details in event_points:
        # Fetch the history point at that index for location/time.
        hp_qs = VoyageHistory.objects.filter(voyage_id=voyage.id).order_by("timestamp")[idx : idx + 1]
        if not hp_qs:
            continue

        hp = hp_qs[0]

        event_objs.append(
            VesselEvent(
                vessel_id=voyage.vessel_id,
                event_type=event_type,
                latitude=hp.latitude,
                longitude=hp.longitude,
                timestamp=hp.timestamp,
                details=details,
            )
        )

    if event_objs:
        VesselEvent.objects.bulk_create(event_objs)


def noop(apps, schema_editor):
    # Intentionally no rollback for demo seed data.
    return


class Migration(migrations.Migration):
    dependencies = [
        ("voyages", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_dummy_replay_data, noop),
    ]

