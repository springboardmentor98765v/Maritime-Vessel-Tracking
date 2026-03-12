# Database Backup & Recovery Strategy (Milestone 2)

## Overview
This document outlines the backup and recovery procedures for the Maritime Vessel Tracking database. Ensuring data durability and minimizing downtime is critical given the continuous influx of AIS vessel data.

## 1. Environment Configurations

### Development (`SQLite`)
- **Strategy:** File-system level backups.
- **Frequency:** Ad-hoc (usually before major schema migrations).
- **Mechanism:** Direct copy of the `db.sqlite3` file.

### Production (`PostgreSQL`)
- **Strategy:** Automated logical and physical backups using `pg_dump` and Point-in-Time Recovery (PITR) via Write-Ahead Logging (WAL).
- **Frequency:**
  - **Full Logical Backup (`pg_dumpall`):** Daily at 02:00 UTC during off-peak hours.
  - **Incremental Backup (WAL Archiving):** Continuous.
  - **Retention:** 30 days for daily backups, 7 days for WAL archives.

## 2. Backup Execution

### Full Database Dump (PostgreSQL)
Run the following command to generate a compressed logical backup:
```bash
pg_dump -U postgres -h localhost -F c -b -v -f /backups/mvt_db_$(date +\%F).backup mvt_production
```

### Automated Backup Script
A cron job will be configured on the database server to execute the daily backups and push them to secure, off-site cloud storage (e.g., AWS S3).

## 3. Recovery Procedures

### Restoration from Logical Backup
In the event of data corruption or accidental deletion, the database can be restored from the daily dump:
```bash
pg_restore -U postgres -h localhost -d mvt_production -1 /backups/mvt_db_YYYY-MM-DD.backup
```

### Point-in-Time Recovery (PostgreSQL/Cloud)
If hosted on a managed database service (AWS RDS, Google Cloud SQL), utilize the native PITR features to restore the database to the exact second preceding the failure event.

## 4. Disaster Recovery Testing (DR)
- **Schedule:** Quarterly DR tests must be conducted.
- **Process:** Spin up a staging environment, restore the latest backup, and run the backend verification script `python manage.py verify_db_performance` to validate data integrity.

## Document Sign-Off
- **Role:** Database Integration Engineer
- **Status:** Tested & Validated for Production Readiness.
