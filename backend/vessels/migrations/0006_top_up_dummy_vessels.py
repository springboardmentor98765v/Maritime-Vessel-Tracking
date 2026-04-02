import random
from django.db import migrations

VESSEL_TYPES = ["Container", "Tanker", "Bulk", "Passenger", "Cargo"]
FLAGS = ["India", "Singapore", "UAE", "Netherlands", "Panama", "Liberia"]
CARGO_TYPES = ["General", "Oil", "Containers", "Vehicles", "Chemicals"]
DESTINATIONS = ["Mumbai", "Chennai", "Kolkata", "Kochi", "Dubai", "Singapore"]


def top_up_dummy_vessels(apps, schema_editor):
    Vessel = apps.get_model("vessels", "Vessel")

    current = Vessel.objects.count()
    target = 1000

    if current >= target:
        return

    remaining = target - current

    # Rough bounding box around India + nearby sea for demo.
    lat_min, lat_max = 6.0, 26.5
    lon_min, lon_max = 68.0, 92.5

    start_index = current + 1

    vessels = []
    for i in range(start_index, target + 1):
        imo = f"IMO{9000000 + i}"
        mmsi = str(400000000 + i)

        vessels.append(
            Vessel(
                vessel_name=f"Demo Vessel {i:04d}",
                mmsi=mmsi,
                imo_number=imo,
                latitude=random.uniform(lat_min, lat_max),
                longitude=random.uniform(lon_min, lon_max),
                speed=round(random.uniform(0, 22), 2),
                vessel_type=random.choice(VESSEL_TYPES),
                flag=random.choice(FLAGS),
                cargo_type=random.choice(CARGO_TYPES),
                heading=round(random.uniform(0, 359), 1),
                destination=random.choice(DESTINATIONS),
            )
        )

    Vessel.objects.bulk_create(vessels, batch_size=200)


class Migration(migrations.Migration):

    dependencies = [
        ("vessels", "0005_seed_dummy_vessels"),
    ]

    operations = [
        migrations.RunPython(top_up_dummy_vessels, reverse_code=migrations.RunPython.noop),
    ]

