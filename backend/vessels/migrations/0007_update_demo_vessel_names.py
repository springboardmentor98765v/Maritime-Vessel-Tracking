from django.db import migrations


DEFAULT_NAME_POOL = [
    "MV Ocean Aurora",
    "MV Blue Horizon",
    "MV Maritime Atlas",
    "MV Coral Sentinel",
    "MV Iron Pathfinder",
    "MV Emerald Seafarer",
    "MV Nova Trader",
    "MV Kestrel Voyager",
    "MV Gulf Navigator",
    "MV Atlantic Beacon",
    "MV Seastone Venture",
    "MV Polar Comet",
    "MV Crimson Navigator",
    "MV Sapphire Resolve",
    "MV Verdant Carrier",
]


def update_demo_vessel_names(apps, schema_editor):
    Vessel = apps.get_model("vessels", "Vessel")

    # Only touch the seeded demo names.
    qs = Vessel.objects.filter(vessel_name__startswith="Demo Vessel")
    if not qs.exists():
        return

    pool_len = len(DEFAULT_NAME_POOL)
    for vessel in qs.iterator():
        # Stable mapping so repeated migrations keep names consistent.
        # vessel.id starts at 1, but we avoid negative indices.
        idx = (vessel.id - 1) % pool_len
        vessel.vessel_name = DEFAULT_NAME_POOL[idx]
        vessel.save(update_fields=["vessel_name"])


class Migration(migrations.Migration):

    dependencies = [
        ("vessels", "0006_top_up_dummy_vessels"),
    ]

    operations = [
        migrations.RunPython(update_demo_vessel_names, reverse_code=migrations.RunPython.noop),
    ]

