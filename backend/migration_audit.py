import sqlite3
import os

db_path = 'db.sqlite3'

if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT app, name, applied FROM django_migrations WHERE app='notifications' ORDER BY applied;")
    migrations = cursor.fetchall()
    print("Migrations for 'notifications' in DB:")
    for m in migrations:
        print(f" - {m[1]} (Applied at: {m[2]})")
    conn.close()
