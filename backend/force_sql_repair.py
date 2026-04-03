import sqlite3
import os

db_path = r'c:\backend (2) milestone 2\backend (2) milestone 2\backend (2) milestone 2\backend\backend\db.sqlite3'

SQL = """
BEGIN;
CREATE TABLE IF NOT EXISTS "notifications_event" (
    "id" integer PRIMARY KEY AUTOINCREMENT, 
    "event_type" varchar(100) NOT NULL, 
    "timestamp" datetime NOT NULL, 
    "latitude" real NOT NULL, 
    "longitude" real NOT NULL, 
    "details" text NULL, 
    "vessel_id" bigint NOT NULL REFERENCES "vessels_vessel" ("id") DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS "notifications_subscription" (
    "id" integer PRIMARY KEY AUTOINCREMENT, 
    "created_at" datetime NOT NULL, 
    "user_id" integer NOT NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, 
    "vessel_id" bigint NOT NULL REFERENCES "vessels_vessel" ("id") DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE IF NOT EXISTS "notifications_notification" (
    "id" integer PRIMARY KEY AUTOINCREMENT, 
    "message" text NOT NULL, 
    "type" varchar(50) NOT NULL, 
    "created_at" datetime NOT NULL, 
    "is_read" bool NOT NULL, 
    "safety_event_id" bigint NULL REFERENCES "safety_safety" ("id") DEFERRABLE INITIALLY DEFERRED, 
    "tracking_event_id" bigint NULL REFERENCES "notifications_event" ("id") DEFERRABLE INITIALLY DEFERRED, 
    "user_id" integer NOT NULL REFERENCES "auth_user" ("id") DEFERRABLE INITIALLY DEFERRED, 
    "vessel_id" bigint NULL REFERENCES "vessels_vessel" ("id") DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_subscription_user_vessel" ON "notifications_subscription" ("user_id", "vessel_id");
CREATE INDEX IF NOT EXISTS "idx_sub_user_vessel" ON "notifications_subscription" ("user_id", "vessel_id");
CREATE INDEX IF NOT EXISTS "idx_sub_vessel_user" ON "notifications_subscription" ("vessel_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_n_u_r_ca" ON "notifications_notification" ("user_id", "is_read", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_n_u_ca" ON "notifications_notification" ("user_id", "created_at" DESC);

-- Fake migration entry
INSERT OR IGNORE INTO django_migrations (app, name, applied) VALUES ('notifications', '0001_initial', CURRENT_TIMESTAMP);

COMMIT;
"""

print(f"Applying SQL repair to {db_path}...")
try:
    conn = sqlite3.connect(db_path)
    conn.executescript(SQL)
    conn.close()
    print("SQL repair successful!")
except Exception as e:
    print(f"SQL repair failed: {e}")
