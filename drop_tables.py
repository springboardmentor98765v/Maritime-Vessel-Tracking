import sqlite3
import os

db_path = 'db.sqlite3'

if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'notifications_%';")
    tables = cursor.fetchall()
    for table in tables:
        cursor.execute(f"DROP TABLE {table[0]};")
        print(f"Dropped table: {table[0]}")
    conn.commit()
    conn.close()
