Milestone 2 – Database Schema Validation Report
1. Tables Reviewed

The following tables were reviewed for Milestone 2:

vessels_vessel

safety_safety (Event table)

subscriptions_subscription

notifications_notification

auth_user (Django default user table)

2. Vessel Table Validation

Table: vessels_vessel

Key Constraints:

id → Primary Key

imo_number → UNIQUE constraint

mmsi → UNIQUE constraint

Foreign Key References:

Referenced by:

safety_safety (vessel_id)

subscriptions_subscription (vessel_id)

notifications_notification (vessel_id)

Data Integrity:

Latitude and Longitude have CHECK constraints:

Latitude between -90 and 90

Longitude between -180 and 180

Indexes:

Index on vessel_type

Index on flag

Index on destination

Index on last_update

Composite index on (vessel_type, flag, last_update DESC)

Schema integrity confirmed.

3. Subscription Table Validation

Table: subscriptions_subscription

Key Constraints:

Primary Key: id

UNIQUE constraint on (user_id, vessel_id)

This prevents duplicate subscriptions.

Foreign Keys:

user_id → auth_user(id)

vessel_id → vessels_vessel(id)

Referential integrity confirmed.

4. Notification Table Validation

Table: notifications_notification

Foreign Keys:

user_id → auth_user(id)

vessel_id → vessels_vessel(id)

safety_event_id → safety_safety(id)

All foreign key relationships validated.

Indexes exist for:

user_id

is_read

created_at

composite (user_id, is_read, created_at DESC)

5. Safety (Event) Table Validation

Table: safety_safety

Foreign Key:

vessel_id → vessels_vessel(id)

Indexes:

(vessel_id, timestamp DESC)

event_type

timestamp

Event-vessel relationship validated.

6. Referential Integrity Test

Attempted inserting subscription with non-existent user_id resulted in:

"violates foreign key constraint"

This confirms:

No orphan records possible

Foreign key enforcement working

Conclusion

All required tables, constraints, and relationships are correctly implemented.
Schema normalization and data integrity rules are enforced successfully.

Milestone 2 Database Schema Validation – COMPLETED.