import os
import glob
import sqlite3

# THE ACTIVE PATH
BASE_DIR = r'c:\backend  milestone 3\backend (8) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend'

def purge_migrations(app_name):
    migration_dir = os.path.join(BASE_DIR, 'apps', app_name, 'migrations')
    if not os.path.exists(migration_dir):
        # Check if it's a top-level app (like 'tracking')
        migration_dir = os.path.join(BASE_DIR, app_name, 'migrations')
    
    if os.path.exists(migration_dir):
        files = glob.glob(os.path.join(migration_dir, '0*.py'))
        for f in files:
            os.remove(f)
            print(f"Purged: {f}")

def reset_db():
    db_path = os.path.join(BASE_DIR, 'db.sqlite3')
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 1. Reset migration history for notifications
        cursor.execute("DELETE FROM django_migrations WHERE app='notifications';")
        print(f"Reset migration history for 'notifications'.")
        
        # 2. Drop existing notifications tables to avoid conflicts
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'notifications_%';")
        tables = [row[0] for row in cursor.fetchall()]
        for table in tables:
            cursor.execute(f"DROP TABLE {table};")
            print(f"Dropped table: {table}")
            
        conn.commit()
        conn.close()

print("--- PURGING MIGRATIONS ---")
purge_migrations('notifications')

print("\n--- RESETTING DATABASE ---")
reset_db()

print("\n--- DONE ---")
