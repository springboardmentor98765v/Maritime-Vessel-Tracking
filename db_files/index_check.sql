-- ✅ STEP 3: Index proof

-- 1) Vessel indexes
PRAGMA index_list('vessels_vessel');

-- Show which columns each index uses
PRAGMA index_info('idx_vessel_imo');
PRAGMA index_info('idx_vessel_type');
PRAGMA index_info('idx_vessel_flag');
PRAGMA index_info('idx_vessel_destination');
PRAGMA index_info('idx_vessel_last_update');

-- 2) Subscription indexes
PRAGMA index_list('subscriptions_subscription');

-- This is the UNIQUE constraint (user_id, vessel_id)
PRAGMA index_info('sqlite_autoindex_subscriptions_subscription_1');

-- 3) Notification indexes
PRAGMA index_list('notifications_notification');

-- 4) Event table (in your DB it looks like safety table is acting as events)
PRAGMA index_list('safety_safety');