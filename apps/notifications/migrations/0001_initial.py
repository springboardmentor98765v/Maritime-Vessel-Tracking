from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('vessels', '0005_alter_vessel_imo_number_and_more'),
        ('safety', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_type', models.CharField(choices=[('STOPPED', 'Vessel Stopped'), ('MOVED', 'Vessel Started Moving'), ('ROUTE_CHANGED', 'Vessel Route Changed'), ('PORT_ENTERED', 'Vessel Entered Port'), ('PORT_DEPARTED', 'Vessel Departed Port'), ('STORM_ALERT', 'Storm Detection')], max_length=100)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('details', models.TextField(blank=True, null=True)),
                ('vessel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='events', to='vessels.vessel')),
            ],
        ),
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to=settings.AUTH_USER_MODEL)),
                ('vessel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions', to='vessels.vessel')),
            ],
        ),
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.TextField()),
                ('type', models.CharField(db_index=True, default='info', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('is_read', models.BooleanField(db_index=True, default=False)),
                ('safety_event', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='safety_event_notifications', to='safety.safety')),
                ('tracking_event', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='tracking_event_notifications', to='notifications.event')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to=settings.AUTH_USER_MODEL)),
                ('vessel', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='vessel_notifications', to='vessels.vessel')),
            ],
        ),
        migrations.AddConstraint(
            model_name='subscription',
            constraint=models.UniqueConstraint(fields=('user', 'vessel'), name='uq_subscription_user_vessel'),
        ),
        migrations.AddIndex(
            model_name='subscription',
            index=models.Index(fields=['user', 'vessel'], name='idx_sub_user_vessel'),
        ),
        migrations.AddIndex(
            model_name='subscription',
            index=models.Index(fields=['vessel', 'user'], name='idx_sub_vessel_user'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', 'is_read', '-created_at'], name='idx_n_u_r_ca'),
        ),
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['user', '-created_at'], name='idx_n_u_ca'),
        ),
    ]
