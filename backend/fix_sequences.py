import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Get all primary key sequences and reset them to max(id)
    cursor.execute("""
        SELECT
            tc.table_name,
            kc.column_name,
            pg_get_serial_sequence(tc.table_name, kc.column_name) AS seq_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kc
            ON kc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
    """)
    rows = cursor.fetchall()
    for table, col, seq in rows:
        if seq:
            cursor.execute(
                "SELECT setval(%s, COALESCE((SELECT MAX({col}) FROM \"{table}\"), 1))".format(
                    col=col, table=table
                ),
                [seq]
            )
            result = cursor.fetchone()
            print(f"Reset {seq} -> {result[0]}")

print("\nAll sequences reset successfully!")
