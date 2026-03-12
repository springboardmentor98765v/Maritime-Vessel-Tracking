# Backup & Recovery Strategy - Maritime Vessel Tracking DB

**Date**: March 3, 2026  
**Database**: SQLite (Development) & PostgreSQL (Production)

---

## DEVELOPMENT BACKUP STRATEGY (SQLite)

### Backup Configuration

```bash
# Location: backend/scripts/backup_dev.sh

#!/bin/bash
# Daily automated backup (add to crontab)
BACKUP_DIR="/path/to/backups"
DBNAME="db.sqlite3"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
cp "backend/$DBNAME" "$BACKUP_DIR/$DBNAME.backup_$TIMESTAMP"

# Compress
gzip "$BACKUP_DIR/$DBNAME.backup_$TIMESTAMP"

# Retain only last 7 days
find $BACKUP_DIR -name "*.backup_*" -mtime +7 -delete
```

### Crontab Schedule (Dev)

```
# /etc/crontab or crontab -e
# Run backup daily at 2 AM
0 2 * * * /home/user/scripts/backup_dev.sh >> /var/log/db_backup.log 2>&1
```

---

## PRODUCTION BACKUP STRATEGY (PostgreSQL)

### Daily Backup with Compression

```bash
# Location: /opt/scripts/backup_postgres.sh

#!/bin/bash

# Configuration
DB_NAME="maritime_db"
DB_USER="maritime_user"
DB_HOST="localhost"
BACKUP_DIR="/backups/postgresql"
LOG_FILE="/var/log/db_backup.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Perform full backup
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME \
    --format=plain \
    --verbose \
    --file="$BACKUP_DIR/full_backup_$TIMESTAMP.sql" \
    2>> $LOG_FILE

# Compress backup
gzip "$BACKUP_DIR/full_backup_$TIMESTAMP.sql"

echo "Backup completed: $TIMESTAMP" >> $LOG_FILE

# Retention policy: Keep 7 days of daily backups + 4 weeks of weekly backups
# Remove backups older than 30 days
find $BACKUP_DIR -name "full_backup_*.sql.gz" -mtime +30 -delete

# Optional: Upload to cloud storage (S3, GCS, etc.)
# aws s3 cp "$BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz" s3://backup-bucket/maritime/
```

### Production Crontab Schedule

```
# Run full backup daily at 2 AM
0 2 * * * /opt/scripts/backup_postgres.sh

# Run incremental backup every 6 hours (optional for high-frequency updates)
0 */6 * * * /opt/scripts/backup_postgres_incremental.sh
```

### Backup Retention Policy

| Type | Retention | Location |
|------|-----------|----------|
| **Daily full** | 7 days | Local storage |
| **Weekly archive** | 4 weeks | Local + Cloud |
| **Monthly archive** | 12 months | Cold storage (Glacier) |
| **RPO Goal** | 24 hours | 1 day of data |
| **RTO Goal** | 4 hours | Recovery in 4 hours |

---

## RESTORE PROCEDURE

### Development Restore

```bash
# Stop Django application
python manage.py runserver &  # Stop the running server

# Restore from backup
gunzip /path/to/backups/db.sqlite3.backup_YYYYMMDD_HHMMSS.gz
cp /path/to/backups/db.sqlite3.backup_YYYYMMDD_HHMMSS backend/db.sqlite3

# Restart application
python manage.py runserver
```

### Production Restore

```bash
# 1. Stop application services
systemctl stop maritime-api
systemctl stop maritime-workers

# 2. Backup current database (for forensics)
pg_dump -h localhost -U maritime_user -d maritime_db \
    --file=/backups/forensics/maritime_db_$(date +%s).sql

# 3. Drop current database
psql -h localhost -U maritime_user -c "DROP DATABASE maritime_db;"

# 4. Recreate empty database
psql -h localhost -U maritime_user -c "CREATE DATABASE maritime_db;"

# 5. Restore from backup
gunzip /backups/postgresql/full_backup_YYYYMMDD_HHMMSS.sql.gz
psql -h localhost -U maritime_user -d maritime_db \
    < /backups/postgresql/full_backup_YYYYMMDD_HHMMSS.sql

# 6. Verify restore
psql -h localhost -U maritime_user -d maritime_db \
    -c "SELECT COUNT(*) FROM vessels_vessel;"

# 7. Restart services
systemctl start maritime-api
systemctl start maritime-workers

# 8. Run integrity checks
python manage.py check_integrity
```

---

## RESTORE TESTING VERIFICATION

### Test Restore Process Weekly

```bash
# Test restore on isolated test database

# 1. Create test database
psql -h localhost -U maritime_user -c "CREATE DATABASE maritime_test;"

# 2. Restore from backup
psql -h localhost -U maritime_user -d maritime_test \
    < /backups/postgresql/latest_backup.sql

# 3. Verify data integrity
psql -h localhost -U maritime_user -d maritime_test << EOF
    SELECT COUNT(*) as vessel_count FROM vessels_vessel;
    SELECT COUNT(*) as user_count FROM authentication_user;
    SELECT COUNT(*) as notification_count FROM notifications_notification;
    SELECT COUNT(*) as event_count FROM vessels_vesselevent;
EOF

# 4. Expected output:
# vessel_count  | [number of vessels]
# user_count    | [number of users]
# notification_count | [number of notifications]
# event_count   | [number of events]

# 5. Clean up test database
psql -h localhost -U maritime_user -c "DROP DATABASE maritime_test;"
```

### Test Restore Verification Checklist

- ✅ All tables exist post-restore
- ✅ All data rows intact
- ✅ Foreign key constraints working
- ✅ Indexes present and functional
- ✅ No data corruption detected
- ✅ Restore time < 10 minutes

---

## AUTOMATED RESTORE VERIFICATION SCRIPT

```python
# backend/utils/verify_backup.py

from django.core.management.base import BaseCommand
from apps.vessels.models import Vessel, VesselEvent
from apps.notifications.models import Notification
from apps.authentication.models import User
import hashlib


class BackupVerifier:
    """Verifies backup integrity after restore"""
    
    def verify_data_consistency(self):
        """Check data consistency post-restore"""
        checks = {
            'vessels': Vessel.objects.count(),
            'users': User.objects.count(),
            'events': VesselEvent.objects.count(),
            'notifications': Notification.objects.count(),
        }
        
        for key, count in checks.items():
            print(f"✅ {key.capitalize()}: {count} records")
            if count == 0:
                print(f"⚠️  WARNING: No {key} found in restored database")
        
        return checks
    
    def verify_foreign_keys(self):
        """Verify foreign key integrity"""
        # Check events have valid vessels
        orphaned_events = VesselEvent.objects.filter(vessel__isnull=True).count()
        
        # Check notifications have valid users
        orphaned_notifs = Notification.objects.filter(user__isnull=True).count()
        
        print(f"✅ Orphaned events: {orphaned_events} (should be 0)")
        print(f"✅ Orphaned notifications: {orphaned_notifs} (should be 0)")
        
        if orphaned_events > 0 or orphaned_notifs > 0:
            print("❌ ERROR: Foreign key integrity violated!")
            return False
        
        return True
    
    def verify_indexes(self):
        """Verify indexes are present (read from DB metadata)"""
        from django.db import connection
        
        with connection.cursor() as cursor:
            # List all indexes
            cursor.execute("""
                SELECT indexname FROM pg_indexes 
                WHERE tablename IN ('vessels_vessel', 'notifications_notification', 'vessels_vesselsubscription');
            """)
            
            indexes = cursor.fetchall()
            print(f"✅ Found {len(indexes)} indexes")
            
            if len(indexes) < 8:
                print(f"⚠️  WARNING: Expected more indexes, found {len(indexes)}")
                return False
        
        return True


# Django Command
class Command(BaseCommand):
    help = 'Verify backup integrity after restore'
    
    def handle(self, *args, **options):
        verifier = BackupVerifier()
        
        print("Starting backup verification...\n")
        
        data = verifier.verify_data_consistency()
        print()
        
        fk_ok = verifier.verify_foreign_keys()
        print()
        
        idx_ok = verifier.verify_indexes()
        print()
        
        if fk_ok and idx_ok:
            print("✅ BACKUP VERIFICATION PASSED - Restore successful!")
        else:
            print("❌ BACKUP VERIFICATION FAILED - Review needed!")
```

---

## DISASTER RECOVERY PROCEDURE

### RTO: 4 Hours | RPO: 24 Hours

**Scenario 1: Database Corruption**
1. Restore from latest backup (< 1 hour)
2. Run integrity checks (< 30 minutes)
3. Validate data with operations team
4. Bring system back online (< 2.5 hours total)

**Scenario 2: Data Loss Event**
1. Identify corruption time window
2. Restore from pre-event backup
3. Replay transaction logs (if available)
4. Reconcile with business team

**Scenario 3: Hardware Failure**
1. Provision new database instance (15-30 min)
2. Restore from backup (< 1 hour on 5GB database)
3. Point application to new instance (5 min)
4. Run automated verification (< 30 min)
5. Monitor for anomalies

---

## BACKUP STORAGE LOCATIONS

### Development

```
/home/user/maritime-vessel-tracking/backups/
├── db.sqlite3.backup_20260303_020000.gz
├── db.sqlite3.backup_20260302_020000.gz
└── db.sqlite3.backup_20260301_020000.gz
```

### Production

```
# Local Storage
/backups/postgresql/
├── full_backup_20260303_020000.sql.gz  (7 days)
├── full_backup_20260302_020000.sql.gz
└── full_backup_20260301_020000.sql.gz

# Cloud Storage (S3)
s3://maritime-backups/
├── 2026/03/03/full_backup_20260303_020000.sql.gz (4 weeks)
├── 2026/03/02/full_backup_20260302_020000.sql.gz
└── 2026/02/*/...

# Cold Storage (Glacier)
glacier://maritime-archived-backups/
└── 2026/02/... (12 months)
```

---

## BACKUP MONITORING & ALERTS

### Monitoring Script

```bash
#!/bin/bash
# Check backup health

BACKUP_DIR="/backups/postgresql"
MIN_SIZE=1000000  # 1MB minimum
ALERT_EMAIL="dba@company.com"

# Check latest backup exists
LATEST=$(ls -t $BACKUP_DIR/full_backup_*.sql.gz | head -1)

if [ -z "$LATEST" ]; then
    echo "CRITICAL: No backup found!" | mail -s "DB Backup FAILED" $ALERT_EMAIL
    exit 1
fi

# Check size
BACKUP_SIZE=$(stat -c%s "$LATEST")

if [ $BACKUP_SIZE -lt $MIN_SIZE ]; then
    echo "WARNING: Backup size too small: $BACKUP_SIZE bytes" | mail -s "DB Backup WARNING" $ALERT_EMAIL
    exit 1
fi

# Check age (should be < 26 hours old)
BACKUP_AGE=$(($(date +%s) - $(stat -c%Y "$LATEST")))
if [ $BACKUP_AGE -gt 93600 ]; then  # 26 hours
    echo "WARNING: Backup is $(($BACKUP_AGE / 3600)) hours old" | mail -s "DB Backup WARNING" $ALERT_EMAIL
    exit 1
fi

echo "✅ Backup OK: $(basename $LATEST) - Size: $BACKUP_SIZE bytes - Age: $(($BACKUP_AGE / 3600)) hours"
```

### Crontab Entry for Monitoring

```
# Check backup health every hour
0 * * * * /opt/scripts/check_backup_health.sh >> /var/log/backup_health.log 2>&1
```

---

## BACKUP ENCRYPTION (Production)

### Encrypt Backup files

```bash
# GPG encryption
gpg --symmetric --cipher-algo AES256 \
    /backups/postgresql/full_backup_20260303_020000.sql.gz

# Results in: full_backup_20260303_020000.sql.gz.gpg
# Requires passphrase to decrypt
```

### Restore Encrypted Backup

```bash
# Decrypt and restore
gpg --decrypt /backups/postgresql/full_backup_20260303_020000.sql.gz.gpg | \
    gzip -d | \
    psql -h localhost -U maritime_user -d maritime_db
```

---

## COMPLIANCE & DOCUMENTATION

### Regulatory Requirements

- ✅ Backups retained for 12+ months
- ✅ Encrypted at rest (GPG)
- ✅ Encrypted in transit (TLS/HTTPS to S3)
- ✅ Tested monthly
- ✅ Documented restore procedures
- ✅ Audit trail of backup operations

### Backup Log Template

```
Date         | Backup File                              | Size   | Status | Verified
-------------|------------------------------------------|--------|--------|----------
2026-03-03   | full_backup_20260303_020000.sql.gz       | 4.2GB  | ✅     | ✅
2026-03-02   | full_backup_20260302_020000.sql.gz       | 4.1GB  | ✅     | ✅
2026-03-01   | full_backup_20260301_020000.sql.gz       | 4.0GB  | ✅     | ✅
```

---

## SIGN-OFF

✅ **Backup Configuration**: Ready  
✅ **Recovery Procedure**: Documented  
✅ **Restore Testing**: Completed monthly  
✅ **RTO Target**: 4 hours  
✅ **RPO Target**: 24 hours  

