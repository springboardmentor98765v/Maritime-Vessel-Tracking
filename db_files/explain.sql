EXPLAIN QUERY PLAN
SELECT id, imo_number, name
FROM vessels_vessel
WHERE vessel_type='Container' AND flag='IN'
ORDER BY last_update DESC
LIMIT 20;

EXPLAIN QUERY PLAN
SELECT *
FROM vessels_vessel
WHERE imo_number='1234567';

EXPLAIN QUERY PLAN
SELECT *
FROM notifications_notification
WHERE user_id=1 AND is_read=0
ORDER BY created_at DESC
LIMIT 50;

EXPLAIN QUERY PLAN
SELECT *
FROM subscriptions_subscription
WHERE user_id=1 AND vessel_id=1;

EXPLAIN QUERY PLAN
SELECT *
FROM safety_safety
WHERE vessel_id=1
ORDER BY timestamp DESC
LIMIT 50;



SELECT 'vessels_vessel' AS table_name, COUNT(*) AS rows FROM vessels_vessel
UNION ALL
SELECT 'safety_safety', COUNT(*) FROM safety_safety
UNION ALL
SELECT 'notifications_notification', COUNT(*) FROM notifications_notification
UNION ALL
SELECT 'subscriptions_subscription', COUNT(*) FROM subscriptions_subscription;


--duplicates check  
SELECT imo_number, COUNT(*) AS cnt
FROM vessels_vessel
GROUP BY imo_number
HAVING COUNT(*) > 1;


SELECT mmsi, COUNT(*) AS cnt
FROM vessels_vessel
WHERE mmsi IS NOT NULL AND mmsi != ''
GROUP BY mmsi
HAVING COUNT(*) > 1;

SELECT id, imo_number, last_position_lat
FROM vessels_vessel
WHERE last_position_lat IS NOT NULL
  AND (last_position_lat < -90 OR last_position_lat > 90);

  SELECT id, imo_number, last_position_lon
FROM vessels_vessel
WHERE last_position_lon IS NOT NULL
  AND (last_position_lon < -180 OR last_position_lon > 180);


SELECT s.id, s.vessel_id
FROM safety_safety s
LEFT JOIN vessels_vessel v ON v.id = s.vessel_id
WHERE v.id IS NULL;

SELECT n.id, n.vessel_id
FROM notifications_notification n
LEFT JOIN vessels_vessel v ON v.id = n.vessel_id
WHERE v.id IS NULL;

SELECT n.id, n.safety_event_id
FROM notifications_notification n
LEFT JOIN safety_safety s ON s.id = n.safety_event_id
WHERE n.safety_event_id IS NOT NULL
  AND s.id IS NULL;



PRAGMA foreign_keys = ON;

PRAGMA foreign_keys;