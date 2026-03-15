from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ('vessels', '0001_initial'),
]
    operations = [
        migrations.CreateModel(
            name='SafetyZones',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('zone_type', models.CharField(max_length=100)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('radius', models.FloatField()),
                ('severity', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
            ],
        ),
    ]