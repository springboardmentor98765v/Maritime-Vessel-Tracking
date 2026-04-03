import sqlite3
import os

db_path = 'db.sqlite3'

if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM django_migrations WHERE app='notifications';")
    print(f"Deleted {cursor.rowcount} migration entries for 'notifications'.")
    conn.commit()
    conn.close()
