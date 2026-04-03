Milestone 2 – Database Indexing & Performance Report
1. Index Verification

Indexes verified using \d table_name.

Vessel Table Indexes

UNIQUE index on imo_number

Index on vessel_type

Index on flag

Index on destination

Index on last_update

Composite index (vessel_type, flag, last_update DESC)

Subscription Table Indexes

UNIQUE (user_id, vessel_id)

Index on user_id

Index on vessel_id

Notification Table Indexes

Index on user_id

Index on is_read

Index on created_at

Composite index (user_id, is_read, created_at DESC)

Safety (Event) Table Indexes

Index on vessel_id

Index on timestamp

Composite index (vessel_id, timestamp DESC)

All required milestone indexes confirmed.

2. Performance Testing (EXPLAIN ANALYZE)
Vessel Filtering Query

Query:
SELECT * FROM vessels_vessel
WHERE vessel_type='container'
ORDER BY last_update DESC
LIMIT 50;

Result:
Index Scan using idx_vessel_type_flag_lu_desc

Execution Time: ~0.9 ms

Notification Query

Query:
SELECT * FROM notifications_notification
WHERE user_id=1 AND is_read=false
ORDER BY created_at DESC
LIMIT 50;

Result:
Index Scan using idx_n_u_r_ca

Execution Time: ~0.07 ms

Safety/Event Query

Query:
SELECT * FROM safety_safety
WHERE vessel_id=1
ORDER BY timestamp DESC
LIMIT 50;

Result:
Index Scan using idx_safety_vessel_ts_desc

Execution Time: ~0.06 ms

3. Observations

No Sequential Scan detected.

Index Scan used for all tested queries.

Query execution times are under 1 ms.

Index optimization working correctly.

4. Migration & Backup Validation

Migration rollback tested successfully.

Re-application of migrations successful.

PostgreSQL backup created using pg_dump.

Backup file verified.

Conclusion

Database indexing strategy successfully implemented.
Query performance optimized.
Milestone 2 Database Performance & Indexing – COMPLETED.