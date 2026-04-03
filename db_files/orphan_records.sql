SELECT *
FROM subscriptions_subscription s
LEFT JOIN vessels_vessel v ON s.vessel_id = v.id
WHERE v.id IS NULL;

SELECT *
FROM notifications_notification n
LEFT JOIN vessels_vessel v ON n.vessel_id = v.id
WHERE n.vessel_id IS NOT NULL AND v.id IS NULL;

SELECT *
FROM safety_safety e
LEFT JOIN vessels_vessel v ON e.vessel_id = v.id
WHERE e.vessel_id IS NOT NULL AND v.id IS NULL;

