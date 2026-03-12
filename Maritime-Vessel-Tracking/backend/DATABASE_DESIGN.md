# Database Design Documentation
## Maritime Vessel Tracking System

## 1. Overview

This database is designed using Django ORM with proper normalization and indexing for performance optimization.

The system contains the following main entities:

- User (Custom authentication model)
- Vessel
- Port
- Voyage
- Notification

---

## 2. Entity Descriptions

### 2.1 Vessel
- imo_number (Unique, Indexed)
- name (Indexed)
- type
- flag
- cargo_type
- last_position_lat
- last_position_lon
- last_update
- created_at

Indexes:
- imo_number (unique + index)
- name (index)

---

### 2.2 Port
- name (Indexed)
- location
- country (Indexed)
- congestion_score
- avg_wait_time
- arrivals (PositiveInteger)
- departures (PositiveInteger)
- last_update
- created_at

Indexes:
- name
- country

---

### 2.3 Voyage
- vessel (ForeignKey → Vessel)
- port_from (ForeignKey → Port)
- port_to (ForeignKey → Port)
- departure_time
- arrival_time
- status (Indexed)
- created_at

Indexes:
- status

Relationships:
- One Vessel → Many Voyages
- One Port → Many Voyage Departures
- One Port → Many Voyage Arrivals

---

### 2.4 Notification
- user (ForeignKey → User)
- vessel (ForeignKey → Vessel)
- message
- type (Indexed)
- timestamp
- is_read

Indexes:
- type

Relationships:
- One User → Many Notifications
- One Vessel → Many Notifications

---

## 3. Normalization

The database follows normalization principles:

- No data redundancy
- Foreign key relationships used instead of duplicated data
- Proper separation of entities

---

## 4. Indexing Strategy

Indexes were added on:

- Unique identifiers
- Frequently searched fields
- Filtering fields (status, type)
- Lookup fields (name, country)

This ensures optimized query performance.

---

## 5. Migration Strategy

- Schema changes handled via Django migrations
- Version-controlled in Git
- Safe schema evolution using default values for new fields

---

## 6. Production Considerations

For production deployment:
- Database engine should be migrated from SQLite to PostgreSQL
- Proper indexing and query optimization should be monitored
