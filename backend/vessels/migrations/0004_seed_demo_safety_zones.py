from django.db import migrations


def seed_demo_safety_zones(apps, schema_editor):
    SafetyZone = apps.get_model("vessels", "SafetyZone")

    # Don't create duplicates on repeated runs.
    if SafetyZone.objects.filter(name__in=["Safe Demo Zone", "Medium Risk Demo Zone", "Danger Demo Zone"]).exists():
        return

    SafetyZone.objects.bulk_create(
        [
            SafetyZone(
                name="Safe Demo Zone",
                zone_type="GENERAL",
                severity="SAFE",
                latitude=18.5204,   # Pune-ish
                longitude=73.8567,
                radius_km=120,
            ),
            SafetyZone(
                name="Medium Risk Demo Zone",
                zone_type="PIRACY",
                severity="MEDIUM",
                latitude=13.0827,   # Chennai
                longitude=80.2707,
                radius_km=180,
            ),
            SafetyZone(
                name="Danger Demo Zone",
                zone_type="STORM",
                severity="HIGH",
                latitude=19.0760,   # Mumbai
                longitude=72.8777,
                radius_km=220,
            ),
        ]
    )


class Migration(migrations.Migration):

    dependencies = [
        ("vessels", "0003_safetyzone_severity_safetyzone_zone_type"),
    ]

    operations = [
        migrations.RunPython(seed_demo_safety_zones, reverse_code=migrations.RunPython.noop),
    ]

