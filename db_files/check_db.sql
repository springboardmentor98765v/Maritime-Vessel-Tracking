-- 1) Vessel table: check UNIQUE / NOT NULL / columns
SELECT sql FROM sqlite_master WHERE type='table' AND name='vessels_vessel';
PRAGMA table_info('vessels_vessel');
PRAGMA index_list('vessels_vessel');

-- 2) Subscription table: check UNIQUE(user,vessel) + foreign keys
SELECT sql FROM sqlite_master WHERE type='table' AND name='subscriptions_subscription';
PRAGMA table_info('subscriptions_subscription');
PRAGMA index_list('subscriptions_subscription');
PRAGMA foreign_key_list('subscriptions_subscription');

-- 3) Notifications table: check foreign keys
SELECT sql FROM sqlite_master WHERE type='table' AND name='notifications_notification';
PRAGMA foreign_key_list('notifications_notification');

-- 4) Safety/Event table: check foreign key + delete rule (CASCADE/SET NULL)
SELECT sql FROM sqlite_master WHERE type='table' AND name='safety_safety';
PRAGMA foreign_key_list('safety_safety');


SELECT sql FROM sqlite_master WHERE type='table' AND name='safety_safety';
SELECT sql FROM sqlite_master WHERE type='table' AND name='notifications_notification';
