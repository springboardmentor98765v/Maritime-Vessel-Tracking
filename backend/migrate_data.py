import os
import django
import sqlite3

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from apps.authentication.models import User
from apps.ports.models import Port, PortTrafficHistory
from apps.vessels.models import Vessel, VesselEvent, VesselSubscription, SafetyEvent, SafetyZones, ExternalSafetyData
from apps.voyages.models import Voyage

def migrate_data():
    sqlite_db_path = os.path.join(settings.BASE_DIR, 'db.sqlite3')
    if not os.path.exists(sqlite_db_path):
        print(f"SQLite DB not found at {sqlite_db_path}")
        return

    print("Connecting to SQLite database...")
    lite_conn = sqlite3.connect(sqlite_db_path)
    lite_conn.row_factory = sqlite3.Row
    lite_cur = lite_conn.cursor()

    # Disable constraints on Postgres for bulk load
    with connection.cursor() as cursor:
        cursor.execute("SET session_replication_role = replica;")
        print("Disabled FK constraints for bulk load.")

    try:
        # 0. Users
        lite_cur.execute("SELECT * FROM authentication_user")
        for _row in lite_cur.fetchall():
            row = dict(_row)
            User.objects.get_or_create(id=row['id'], defaults={
                'password': row.get('password', ''),
                'last_login': row.get('last_login'),
                'is_superuser': row.get('is_superuser', False),
                'username': row.get('username', ''),
                'first_name': row.get('first_name', ''),
                'last_name': row.get('last_name', ''),
                'email': row.get('email', ''),
                'is_staff': row.get('is_staff', False),
                'is_active': row.get('is_active', True),
                'date_joined': row.get('date_joined'),
            })
        print("Users copied.")
        
        # 1. Ports
        lite_cur.execute("SELECT * FROM ports_port")
        for _row in lite_cur.fetchall():
            row = dict(_row)
            Port.objects.get_or_create(id=row['id'], defaults={
                'name': row.get('name'),
                'location': row.get('location'),
                'country': row.get('country'),
                'congestion_score': row.get('congestion_score'),
                'avg_wait_time': row.get('avg_wait_time'),
                'arrivals': row.get('arrivals', 0),
                'departures': row.get('departures', 0),
                'last_update': row.get('last_update'),
                'last_analytics_update': row.get('last_analytics_update'),
                'created_at': row.get('created_at'),
            })
        print("Ports copied.")

        # 2. PortTrafficHistory
        lite_cur.execute("SELECT * FROM ports_porttraffichistory")
        for _row in lite_cur.fetchall():
            row = dict(_row)
            PortTrafficHistory.objects.get_or_create(id=row['id'], defaults={
                'port_id': row.get('port_id'),
                'timestamp': row.get('timestamp'),
                'arrivals': row.get('arrivals'),
                'departures': row.get('departures'),
                'congestion_score': row.get('congestion_score'),
            })
        print("PortTrafficHistory copied.")

        # 3. Vessels
        lite_cur.execute("SELECT * FROM vessels_vessel")
        for _row in lite_cur.fetchall():
            row = dict(_row)
            Vessel.objects.get_or_create(id=row['id'], defaults={
                'imo_number': row.get('imo_number'),
                'name': row.get('name'),
                'vessel_type': row.get('vessel_type'),
                'flag': row.get('flag'),
                'cargo_type': row.get('cargo_type'),
                'operator': row.get('operator'),
                'last_position_lat': row.get('last_position_lat'),
                'last_position_lon': row.get('last_position_lon'),
                'speed': row.get('speed'),
                'heading': row.get('heading'),
                'destination': row.get('destination'),
                'last_update': row.get('last_update'),
                'created_at': row.get('created_at'),
            })
        print("Vessels copied.")

        # 4. Voyages
        lite_cur.execute("SELECT * FROM voyages_voyage")
        for _row in lite_cur.fetchall():
            row = dict(_row)
            Voyage.objects.get_or_create(id=row['id'], defaults={
                'vessel_id': row.get('vessel_id'),
                'port_from_id': row.get('port_from_id'),
                'port_to_id': row.get('port_to_id'),
                'departure_time': row.get('departure_time'),
                'arrival_time': row.get('arrival_time'),
                'status': row.get('status'),
                'created_at': row.get('created_at'),
            })
        print("Voyages copied.")

        # 5. Vessel Events
        lite_cur.execute("SELECT * FROM vessels_vesselevent")
        for _row in lite_cur.fetchall():
            row = dict(_row)
            VesselEvent.objects.get_or_create(id=row['id'], defaults={
                'vessel_id': row.get('vessel_id'),
                'event_type': row.get('event_type'),
                'location': row.get('location'),
                'latitude': row.get('latitude'),
                'longitude': row.get('longitude'),
                'timestamp': row.get('timestamp'),
                'details': row.get('details'),
                'created_at': row.get('created_at'),
            })
        print("VesselEvents copied.")

        # 6. SafetyEvents
        lite_cur.execute("SELECT * FROM vessels_safetyevent")
        for _row in lite_cur.fetchall():
            row = dict(_row)
            SafetyEvent.objects.get_or_create(id=row['id'], defaults={
                'event_type': row.get('event_type'),
                'title': row.get('title'),
                'description': row.get('description'),
                'severity': row.get('severity'),
                'latitude': row.get('latitude'),
                'longitude': row.get('longitude'),
                'radius_nm': row.get('radius_nm'),
                'source': row.get('source'),
                'active_from': row.get('active_from'),
                'active_until': row.get('active_until'),
                'is_active': row.get('is_active'),
                'created_at': row.get('created_at'),
                'updated_at': row.get('updated_at'),
            })
        print("SafetyEvents copied.")
        
        # 7. Subscriptions
        lite_cur.execute("SELECT * FROM vessels_vesselsubscription")
        for _row in lite_cur.fetchall():
            row = dict(_row)
            VesselSubscription.objects.get_or_create(id=row['id'], defaults={
                'user_id': row.get('user_id'),
                'vessel_id': row.get('vessel_id'),
                'created_at': row.get('created_at'),
            })
        print("Subscriptions copied.")

        # 8. Notifications
        lite_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='notifications_notification'")
        if lite_cur.fetchone():
            lite_cur.execute("SELECT * FROM notifications_notification")
            for _row in lite_cur.fetchall():
                row = dict(_row)
                from apps.notifications.models import Notification
                Notification.objects.get_or_create(id=row['id'], defaults={
                    'user_id': row.get('user_id'),
                    'category': row.get('category'),
                    'title': row.get('title'),
                    'message': row.get('message'),
                    'is_read': row.get('is_read'),
                    'related_entity_type': row.get('related_entity_type'),
                    'related_entity_id': row.get('related_entity_id'),
                    'created_at': row.get('created_at'),
                })
            print("Notifications copied.")
        else:
            print("No notifications_notification table in SQLite.")

    finally:
        with connection.cursor() as cursor:
            cursor.execute("SET session_replication_role = default;")
            # Now update all sequences
            cursor.execute("SELECT setval('authentication_user_id_seq', (SELECT MAX(id) FROM authentication_user));")
            cursor.execute("SELECT setval('ports_port_id_seq', (SELECT MAX(id) FROM ports_port));")
            cursor.execute("SELECT setval('vessels_vessel_id_seq', (SELECT MAX(id) FROM vessels_vessel));")
            print("Reset primary key sequences.")
            
        lite_conn.close()

if __name__ == '__main__':
    from django.conf import settings
    migrate_data()
