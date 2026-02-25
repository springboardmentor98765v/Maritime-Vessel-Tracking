import sqlite3
from pathlib import Path

DB_PATH = Path('db.sqlite3')
conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

# List all tables
print("=== DATABASE TABLES ===")
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = cursor.fetchall()
for table in tables:
    print(f'  - {table[0]}')

print("\n=== INDEXES CREATED ===")
cursor.execute("""
    SELECT name, tbl_name FROM sqlite_master 
    WHERE type='index' AND tbl_name IN (
        'vessels_vessel', 'vessels_vesselevent', 'vessels_vesselsubscription',
        'notifications_notification', 'ports_port'
    )
    ORDER BY tbl_name, name
""")

indexes = cursor.fetchall()
current_table = None
for name, table in indexes:
    if table != current_table:
        print(f'\n{table}:')
        current_table = table
    print(f'  ✓ {name}')

conn.close()
