# Database Migration Strategy (Milestone 2)

## Overview
As the Maritime Vessel Tracking platform evolves, deploying schema changes to production requires explicit care to avoid downtime or the loss of real-time vessel data.

## 1. Migration Lifecycle
All database modifications strictly follow Django's migration ecosystem.
- **Local Development:** `python manage.py makemigrations`
- **Testing:** `python manage.py migrate` on staging.
- **Production:** Applied during CI/CD deployment pipelines.

## 2. Production Safety Guidelines
The Database Integration Engineer guarantees:
- **No data loss:** `RemoveField` operations will be scrutinized and backed up prior to execution.
- **Backward compatibility:** APIs continuing to serve outdated clients must still function; non-null fields should be introduced in a multi-step process (Add Nullable -> Populate Data -> Alter to Non-Null).
- **Lock Avoidance:** Large indexes (e.g. `CREATE INDEX CONCURRENTLY` in PostgreSQL) will manually be constructed to avoid locking the `vessels_vessel` table during ingestion.

## 3. Rollback Procedures
If a migration introduces a critical system failure:
1. Halt new ingestions temporarily if the DB is corrupted.
2. Reverse the migration using `python manage.py migrate <app_label> <previous_migration_number>`.
3. If the migration was structurally destructive (e.g., dropped a table with cascade), trigger the automated Point-in-Time-Recovery from the WAL archive.

## Document Sign-Off
- **Role:** Database Integration Engineer
- **Status:** Evaluated & Verified.
