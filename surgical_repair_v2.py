import os
import sqlite3

# THE ACTIVE PATH
BASE_DIR = r'c:\backend  milestone 3\backend (8) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend'

def reset_db_fully():
    db_path = os.path.join(BASE_DIR, 'db.sqlite3')
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Reset migration history for notifications
        cursor.execute("DELETE FROM django_migrations WHERE app='notifications';")
        print(f"Reset migration history for 'notifications'.")
        
        # 2. Drop all notifications tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'notifications_%';")
        tables = [row[0] for row in cursor.fetchall()]
        for table in tables:
            cursor.execute(f"DROP TABLE {table};")
            print(f"Dropped table: {table}")
            
        # 3. Drop legacy tables that might cause index conflicts
        legacy_tables = ['subscriptions_subscription', 'users_userprofile', 'tracking_event']
        for table in legacy_tables:
            try:
                cursor.execute(f"DROP TABLE {table};")
                print(f"Dropped legacy table: {table}")
            except Exception as e:
                print(f"Could not drop legacy table {table} (it might not exist): {e}")

        # 4. Drop legacy migration history to avoid confusion
        cursor.execute("DELETE FROM django_migrations WHERE app IN ('subscriptions', 'users', 'tracking');")
        print("Cleared legacy migration history.")
            
        conn.commit()
        conn.close()

reset_db_fully()
