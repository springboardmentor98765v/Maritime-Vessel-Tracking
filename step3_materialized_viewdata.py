from django.db import connection

cursor = connection.cursor()

print("\n=== Total Vessels ===")
cursor.execute("SELECT COUNT(*) FROM vessels_vessel;")
print(cursor.fetchone()[0])

print("\n=== Vessel Counts by Status ===")
cursor.execute("""
SELECT status, COUNT(*)
FROM vessels_vessel
GROUP BY status
ORDER BY COUNT(*) DESC;
""")
for row in cursor.fetchall():
    print(row)

print("\n=== Total Voyages ===")
cursor.execute("SELECT COUNT(*) FROM voyages_voyage;")
print(cursor.fetchone()[0])

print("\n=== Port Congestion Summary ===")
cursor.execute("""
SELECT COUNT(*), AVG(congestion_score), MAX(congestion_score), AVG(avg_wait_time)
FROM ports_port;
""")
print(cursor.fetchone())

print("\n=== Safety Zone Counts ===")
cursor.execute("""
SELECT zone_type, COUNT(*)
FROM safety_safetyzone
GROUP BY zone_type
ORDER BY COUNT(*) DESC;
""")
for row in cursor.fetchall():
    print(row)

print("\n=== Event Counts by Type ===")
cursor.execute("""
SELECT event_type, COUNT(*)
FROM notifications_event
GROUP BY event_type
ORDER BY COUNT(*) DESC;
""")
for row in cursor.fetchall():
    print(row)