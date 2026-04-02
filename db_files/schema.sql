-- Maritime Vessel Tracking Schema Definitions
-- Generated to align with db_files/readme.md and Milestones 1-4

-- This file provides the raw SQL structure documentation for the PostgreSQL deployment.
-- Django ORM creates these tables natively via makemigrations & migrate.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vessels (
    id SERIAL PRIMARY KEY,
    imo INTEGER UNIQUE NOT NULL,
    mmsi INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), 
    flag VARCHAR(3),   
    status VARCHAR(50), 
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
    speed DECIMAL(5, 2),
    heading DECIMAL(5, 2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

CREATE TABLE voyages (
    id SERIAL PRIMARY KEY,
    vessel_id INTEGER NOT NULL,
    origin_port_id INTEGER,
    destination_port_id INTEGER,
    start_date TIMESTAMP,
    estimated_end_date TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);

-- Documentation complete. 
