"""
Wipe all app-specific tables and the django_migrations records for custom apps,
then let manage.py migrate recreate everything from scratch.
"""
import psycopg2

conn = psycopg2.connect(
    dbname='teamm3',
    user='postgres',
    password='root',
    host='localhost',
    port='5432'
)
conn.autocommit = True
cur = conn.cursor()

# Get all tables in public schema
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name")
tables = [row[0] for row in cur.fetchall()]
print("Tables currently in DB:", tables)

# Drop all tables by cascading
for t in tables:
    cur.execute(f'DROP TABLE IF EXISTS "{t}" CASCADE')
    print(f"  Dropped {t}")

print("All tables dropped. Database is clean!")
conn.close()
