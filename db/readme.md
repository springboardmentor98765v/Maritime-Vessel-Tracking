
---

## Database README.md

```markdown
# Maritime Vessel Tracking - Database

## Project Overview

The database module contains all database schemas, migrations, fixtures, and documentation for the Maritime Vessel Tracking platform. It supports SQLite (development) and PostgreSQL (production) with comprehensive schema for users, vessels, ports, voyages, safety events, and notifications.

## Database Technology Stack

- **Development**: SQLite3
- **Production**: PostgreSQL 13+
- **ORM**: Django ORM (with support for raw SQL)
- **Migrations**: Django migrations framework
- **Backups**: pg_dump (PostgreSQL), automated backup scripts
- **Monitoring**: pg_stat_statements, Django Debug Toolbar

## Database Architecture

### Database Diagram




## Database Schema Details

### Users & Authentication

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role VARCHAR(50) NOT NULL,  -- 'operator', 'analyst', 'admin'
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,
    company VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE vessels (
    id SERIAL PRIMARY KEY,
    imo INTEGER UNIQUE NOT NULL,
    mmsi INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),  -- 'Container Ship', 'Tanker', 'Bulk Carrier', etc.
    flag VARCHAR(3),    -- Country code
    status VARCHAR(50), -- 'In Port', 'In Transit', 'Anchored', etc.
    owner VARCHAR(255),
    operator VARCHAR(255),
    year_built INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vessel_metadata (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER UNIQUE NOT NULL,
    length DECIMAL(8, 2),
    beam DECIMAL(8, 2),
    draft DECIMAL(8, 2),
    deadweight_tonnage INTEGER,
    cargo_type VARCHAR(100),
    capacity DECIMAL(12, 2),
    powered_by VARCHAR(50),
    ice_class VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

CREATE TABLE vessel_positions (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2),     -- knots
    heading DECIMAL(5, 2),   -- degrees (0-360)
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);
CREATE INDEX idx_vessel_position_timestamp ON vessel_positions(vessel_id, timestamp DESC);

CREATE TABLE vessel_routes (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER NOT NULL,
    origin_port_id INTEGER,
    destination_port_id INTEGER,
    eta TIMESTAMP,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

CREATE TABLE vessel_alerts (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    alert_type VARCHAR(50),  -- 'position_change', 'port_arrival', 'weather', etc.
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);



CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(100),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    port_type VARCHAR(50),   -- 'Container', 'General Cargo', 'Bulk', etc.
    berth_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE port_statistics (
    id SERIAL PRIMARY KEY,
    port_id INTEGER NOT NULL,
    total_arrivals INTEGER,
    total_departures INTEGER,
    average_wait_time DECIMAL(8, 2),  -- hours
    average_berth_time DECIMAL(8, 2),
    congestion_level VARCHAR(50),     -- 'Low', 'Medium', 'High'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (port_id) REFERENCES ports(id) ON DELETE CASCADE
);

CREATE TABLE congestion_metrics (
    id SERIAL PRIMARY KEY,
    port_id INTEGER NOT NULL,
    congestion_level DECIMAL(5, 2),   -- 0-100%
    queue_length INTEGER,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (port_id) REFERENCES ports(id) ON DELETE CASCADE
);
CREATE INDEX idx_congestion_timestamp ON congestion_metrics(port_id, timestamp DESC);

CREATE TABLE arrivals_departures (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER NOT NULL,
    port_id INTEGER NOT NULL,
    arrival_time TIMESTAMP,
    departure_time TIMESTAMP,
    berth_number VARCHAR(50),
    cargo_loaded DECIMAL(12, 2),
    cargo_unloaded DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE,
    FOREIGN KEY (port_id) REFERENCES ports(id) ON DELETE CASCADE
);


CREATE TABLE safety_events (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100),       -- 'storm', 'piracy', 'accident', etc.
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    severity VARCHAR(50),    -- 'Low', 'Medium', 'High', 'Critical'
    description TEXT,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_safety_events_timestamp ON safety_events(timestamp DESC);

CREATE TABLE weather_alerts (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    alert_type VARCHAR(100),     -- 'storm', 'fog', 'high_wind', etc.
    severity VARCHAR(50),
    wind_speed DECIMAL(6, 2),    -- knots
    wave_height DECIMAL(6, 2),   -- meters
    timestamp TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE piracy_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius DECIMAL(8, 2),        -- kilometers
    threat_level VARCHAR(50),    -- 'Low', 'Medium', 'High'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accident_history (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    incident_date DATE,
    incident_type VARCHAR(100),  -- 'collision', 'grounding', 'fire', etc.
    description TEXT,
    damage_assessment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE SET NULL
);


CREATE TABLE voyages (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER NOT NULL,
    origin_port_id INTEGER,
    destination_port_id INTEGER,
    start_date TIMESTAMP,
    estimated_end_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    status VARCHAR(50),           -- 'planned', 'in_progress', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

CREATE TABLE voyage_history (
    id SERIAL PRIMARY KEY,
    voyage_id INTEGER NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    speed DECIMAL(5, 2),
    heading DECIMAL(5, 2),
    depth DECIMAL(8, 2),
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id) ON DELETE CASCADE
);
CREATE INDEX idx_voyage_history_timestamp ON voyage_history(voyage_id, timestamp DESC);

CREATE TABLE compliance_records (
    id SERIAL PRIMARY KEY,
    voyage_id INTEGER NOT NULL,
    regulation VARCHAR(255),     -- 'MARPOL', 'SOLAS', etc.
    status VARCHAR(50),          -- 'compliant', 'non_compliant', 'pending'
    check_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id) ON DELETE CASCADE
);


CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(100),            -- 'alert', 'info', 'warning', 'error'
    read BOOLEAN DEFAULT false,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read, timestamp DESC);

CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    notification_type VARCHAR(100),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE api_status (
    id SERIAL PRIMARY KEY,
    api_name VARCHAR(100),        -- 'MarineTraffic', 'AIS Hub', 'NOAA', etc.
    status VARCHAR(50),           -- 'operational', 'degraded', 'offline'
    last_check TIMESTAMP,
    error_message TEXT,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20),            -- 'DEBUG', 'INFO', 'WARNING', 'ERROR'
    message TEXT,
    context JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
Create INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(255),
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);