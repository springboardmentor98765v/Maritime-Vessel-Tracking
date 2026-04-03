# Database Scalability & Growth Estimation Model (Milestone 2)

## Overview
This document evaluates the database growth constraints for the Maritime Vessel Tracking platform under the target load of Milestone 2 and outlines the partitioning strategy for high-scale readiness.

## 1. Load Simulation Target (Milestone 2)
- 5,000 tracked vessels.
- 1,000 active users.
- 100,000 notifications per month.
- Frequent real-time vessel updates (every few minutes).

## 2. Storage Estimation Matrix
Based on the current schema structure in PostgreSQL:

| Table | Est. Row Size | Est. Monthly Growth | Monthly Storage Impact |
| --- | --- | --- | --- |
| `Vessel` | ~250 bytes | negligible (static fleet 5k) | < 2 MB |
| `VesselSubscription` | ~50 bytes | 10k user subscriptions | < 1 MB |
| `User` | ~200 bytes | 100 net new users/month | < 1 MB |
| `Notification` | ~150 bytes | 100k generated/month | ~15 MB |
| `VesselEvent` | ~200 bytes | 5k vessels * 10 events/day * 30 days = 1.5M | ~300 MB |

**Conclusion:** Base relational query structures will easily handle Milestone 2 volume without exotic partitioning, requiring less than ~1 GB of persistent storage capacity per quarter. Storage is cheap; I/O is the bottleneck.

## 3. High-Scale Partitioning Strategy

If scale increases to 50,000 vessels globally, the `VesselEvent` table will grow by >15 million rows a month, severely impacting lookup queries.

### Proposed Event Table Partitioning
- **Mechanism:** PostgreSQL Declarative Partitioning
- **Key:** `timestamp` (Range Partitioning).
- **Rule:** Create a new partition for every month automatically via a background worker or chron base trigger.
```sql
CREATE TABLE vessels_vesselevent ( ... ) PARTITION BY RANGE (timestamp);
CREATE TABLE events_2026_01 PARTITION OF vessels_vesselevent FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### Proposed Notification Table Partitioning
- **Mechanism:** PostgreSQL Hash Partitioning
- **Key:** `user_id` (Hash Partitioning).
- **Rule:** Divides notifications evenly across 4-10 generic partitions (e.g., modulo operation on the user ID) so concurrent reads/writes for user notification fetching are dispersed.

## 4. Query Performance Scaling
Currently mitigated via Composite Indexes:
- `user_id + is_read` for optimal Notification inbox loading.
- `last_update + destination` and `vessel_type + flag` for Map view filtering.

## Document Sign-Off
- **Role:** Database Integration Engineer
- **Status:** Evaluated & Verified.
