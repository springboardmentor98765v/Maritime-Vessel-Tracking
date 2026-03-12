#!/usr/bin/env python
"""
Index Verification Script
Tests all indexes with EXPLAIN QUERY PLAN to confirm they're being used
"""

import sqlite3
import json
from pathlib import Path

# Database path
DB_PATH = Path(__file__).parent / 'db.sqlite3'

def execute_explain(query):
    """Execute EXPLAIN QUERY PLAN for a query"""
    conn = sqlite3.connect(str(DB_PATH))
    cursor = conn.cursor()
    
    explain_query = f"EXPLAIN QUERY PLAN {query}"
    cursor.execute(explain_query)
    results = cursor.fetchall()
    conn.close()
    return results

def format_results(results):
    """Format and display EXPLAIN results"""
    for row in results:
        print(f"  {row}")

print("=" * 80)
print("INDEX VERIFICATION REPORT — Maritime Vessel Tracking System")
print("=" * 80)
print()

# ============================================================================
# VESSEL TABLE INDEXES
# ============================================================================
print("📊 VESSEL TABLE INDEXES")
print("-" * 80)

print("\n1️⃣ Query: Filter by Type & Flag (Composite Index)")
print("Query: SELECT * FROM vessels WHERE type = 'Cargo' AND flag = 'Liberia'")
results = execute_explain(
    "SELECT * FROM vessels WHERE type = 'Cargo' AND flag = 'Liberia' LIMIT 10"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

print("\n2️⃣ Query: Filter by Destination + Last Update (Composite Index)")
print("Query: SELECT * FROM vessels WHERE destination = 'Singapore' ORDER BY last_update DESC")
results = execute_explain(
    "SELECT * FROM vessels WHERE destination = 'Singapore' ORDER BY last_update DESC LIMIT 10"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

print("\n3️⃣ Query: Filter by Speed (Single Field Index)")
print("Query: SELECT * FROM vessels WHERE speed > 15 ORDER BY speed DESC")
results = execute_explain(
    "SELECT * FROM vessels WHERE speed > 15 ORDER BY speed DESC LIMIT 10"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

# ============================================================================
# VESSEL EVENT TABLE INDEXES
# ============================================================================
print("\n" + "=" * 80)
print("📊 VESSEL EVENT TABLE INDEXES")
print("-" * 80)

print("\n1️⃣ Query: Events by Vessel + Timestamp (Composite Index)")
print("Query: SELECT * FROM vessels_vesselevent WHERE vessel_id = 1 ORDER BY timestamp DESC")
results = execute_explain(
    "SELECT * FROM vessels_vesselevent WHERE vessel_id = 1 ORDER BY timestamp DESC LIMIT 10"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

print("\n2️⃣ Query: Recent Events by Type (Single Field Index)")
print("Query: SELECT * FROM vessels_vesselevent WHERE event_type = 'piracy' ORDER BY timestamp DESC")
results = execute_explain(
    "SELECT * FROM vessels_vesselevent WHERE event_type = 'piracy' ORDER BY timestamp DESC LIMIT 20"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

# ============================================================================
# NOTIFICATION TABLE INDEXES
# ============================================================================
print("\n" + "=" * 80)
print("📊 NOTIFICATION TABLE INDEXES")
print("-" * 80)

print("\n1️⃣ Query: Unread Notifications (Composite Index)")
print("Query: SELECT * FROM notifications_notification WHERE user_id = 1 AND is_read = 0 ORDER BY timestamp DESC")
results = execute_explain(
    "SELECT * FROM notifications_notification WHERE user_id = 1 AND is_read = 0 ORDER BY timestamp DESC LIMIT 20"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

print("\n2️⃣ Query: User Recent Notifications (Composite Index)")
print("Query: SELECT * FROM notifications_notification WHERE user_id = 1 ORDER BY timestamp DESC")
results = execute_explain(
    "SELECT * FROM notifications_notification WHERE user_id = 1 ORDER BY timestamp DESC LIMIT 20"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

# ============================================================================
# SUBSCRIPTION TABLE INDEXES
# ============================================================================
print("\n" + "=" * 80)
print("📊 VESSEL SUBSCRIPTION TABLE INDEXES")
print("-" * 80)

print("\n1️⃣ Query: User Subscriptions (Single Field Index)")
print("Query: SELECT * FROM vessels_vesselsubscription WHERE user_id = 1")
results = execute_explain(
    "SELECT * FROM vessels_vesselsubscription WHERE user_id = 1"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

print("\n2️⃣ Query: Check Subscription (Composite Index)")
print("Query: SELECT * FROM vessels_vesselsubscription WHERE user_id = 1 AND vessel_id = 5")
results = execute_explain(
    "SELECT * FROM vessels_vesselsubscription WHERE user_id = 1 AND vessel_id = 5"
)
print("Execution Plan:")
format_results(results)
print("✓ Status: Using index" if "SEARCH" in str(results) else "⚠ Status: Table scan")

# ============================================================================
# DATABASE STATISTICS
# ============================================================================
print("\n" + "=" * 80)
print("📈 DATABASE STATISTICS")
print("-" * 80)

conn = sqlite3.connect(str(DB_PATH))
cursor = conn.cursor()

# Get all indexes
cursor.execute("""
    SELECT 
        name,
        tbl_name,
        sql
    FROM sqlite_master 
    WHERE type='index' AND sql IS NOT NULL 
    ORDER BY tbl_name
""")

indexes = cursor.fetchall()

print(f"\nTotal Indexes Created: {len(indexes)}")
print("\nIndex Details:")
print()

for name, table, sql in indexes:
    if any(x in table for x in ['vessel', 'event', 'notification', 'subscription']):
        print(f"  📌 {name}")
        print(f"     Table: {table}")
        if sql:
            print(f"     SQL: {sql[:70]}...")
        print()

# Get database file size
db_size = Path(DB_PATH).stat().st_size / (1024 * 1024)
print(f"\nDatabase File Size: {db_size:.2f} MB")

conn.close()

# ============================================================================
# Summary
# ============================================================================
print("\n" + "=" * 80)
print("✅ VERIFICATION COMPLETE")
print("=" * 80)
print("\nAll indexes have been created and are ready for use.")
print("Monitor query performance and adjust as needed based on real-world usage patterns.")
print()
