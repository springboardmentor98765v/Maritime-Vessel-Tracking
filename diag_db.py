import sqlite3
import os

db_path = r'c:\backend  milestone 3\backend (8) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend\db.sqlite3'

if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    print("Tables in DB:")
    for t in sorted(tables):
        print(f" - {t}")
    
    # Check notifications specifically
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'notifications%';")
    notif_tables = cursor.fetchall()
    print("\nNotifications tables:")
    for nt in notif_tables:
        print(f" - {nt[0]}")
    
    conn.close()
