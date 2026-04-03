# Maritime Vessel Tracking – Milestone 3
## How to Run the Project

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 14+ | https://postgresql.org |
| pip | latest | bundled with Python |
| npm | latest | bundled with Node.js |

---

## 1. Database Setup (PostgreSQL)

Open pgAdmin or the psql shell and run:

```sql
CREATE DATABASE postgre;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'root';
GRANT ALL PRIVILEGES ON DATABASE postgre TO postgres;
```

> These credentials match what is already in `backend/.env` and `backend/core/settings.py`.  
> If you need different credentials, update those two files accordingly.

---

## 2. Backend Setup

### 2a. Create a virtual environment

```powershell
cd Maritime-Vessel-Tracking\backend

python -m venv venv_win
.\venv_win\Scripts\Activate.ps1
```

### 2b. Install dependencies

```powershell
pip install -r requirements.txt
```

### 2c. Run database migrations

```powershell
python manage.py migrate
```

### 2d. Create a superuser (admin account)

```powershell
python manage.py createsuperuser
```
Follow the prompts to set username, email, and password.

### 2e. Seed data (vessels, ports, safety zones, traffic history)

If vessels and ports are already seeded, skip to the M3 seeding step.

```powershell
# Seed vessels and ports (Milestone 1 & 2 data)
python manage.py seed_vessels_ports   # may already be done

# Seed Milestone 3 data (SafetyZones + PortTrafficHistory)
python manage.py seed_m3_data
```

### 2f. Start the Django development server

```powershell
python manage.py runserver
```

Backend runs at: **http://127.0.0.1:8000**

---

## 3. Frontend Setup

Open a new terminal (keep the backend running):

```powershell
cd Maritime-Vessel-Tracking\frontend

npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 4. All Available URLs

### Frontend Pages

| Page | URL |
|------|-----|
| Home / Landing | http://localhost:5173/ |
| Live Vessel Map | http://localhost:5173/map |
| Port Dashboard (M3) | http://localhost:5173/ports |
| Vessels List | http://localhost:5173/vessels |
| Vessel Detail | http://localhost:5173/vessels/:id |
| Voyage Replay | http://localhost:5173/voyages |
| Analytics Dashboard | http://localhost:5173/analytics |
| Login | http://localhost:5173/login |
| Register | http://localhost:5173/register |
| User Profile | http://localhost:5173/profile |
| Admin | http://localhost:5173/admin |
| Django Admin | http://127.0.0.1:8000/admin |

### Backend API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Register a new user |
| POST | `/auth/login/` | Login (returns JWT tokens) |
| POST | `/auth/logout/` | Logout (blacklist token) |
| POST | `/auth/token/refresh/` | Refresh access token |
| POST | `/auth/password-reset/` | Request password reset email |

#### Vessels
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vessels/` | List all vessels (filterable) |
| GET | `/vessels/:id/` | Single vessel details |
| GET | `/vessels/:id/events/` | Events for a vessel |
| POST | `/vessels/:id/subscribe/` | Subscribe to vessel alerts |
| DELETE | `/vessels/:id/subscribe/` | Unsubscribe |

#### Ports (M3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ports/` | List all ports |
| GET | `/ports/congestion/` | Ports ranked by congestion score |
| GET | `/ports/analytics/` | Aggregate analytics for dashboards |
| GET | `/ports/:id/analytics/` | Analytics + traffic history for one port |

#### Safety (M3)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vessels/safety/zones/` | Active safety zones (storms, piracy, etc.) |
| GET | `/vessels/safety/alerts/` | Risk alerts for all vessels |
| GET | `/safety-events/` | Legacy safety event overlays |

#### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications/` | Current user's notifications |
| POST | `/notifications/:id/read/` | Mark notification as read |

#### Voyages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/voyages/` | List all voyages |

---

## 5. What Milestone 3 Added

### Backend
| Component | File | Description |
|-----------|------|-------------|
| UNCTAD Port Data Service | `services/port_data_service.py` | Fetches/simulates UNCTAD port arrivals, departures, trade flow |
| NOAA Safety Data Service | `services/safety_data_service.py` | Fetches/simulates NOAA weather & hazard zones |
| Port Analytics Service | `services/port_analytics_service.py` | Calculates congestion scores from port data |
| Safety Detection Service | `services/safety_detection_service.py` | Detects vessel–zone overlap using Haversine distance |
| Port Analytics API | `GET /ports/analytics/` | Aggregate dashboard data |
| Safety Zones API | `GET /vessels/safety/zones/` | Active safety zones for map overlays |
| Safety Alerts API | `GET /vessels/safety/alerts/` | Real-time vessel risk detection |
| Congestion Notifications | `apps/ports/views.py` | Notifies users when vessels head to critical ports |
| Safety Notifications | `apps/vessels/views.py` | Notifies subscribed users of high-severity zone breaches |

### Database Tables Added / Extended
| Table | Changes |
|-------|---------|
| `ports_port` | Added `congestion_score`, `avg_wait_time`, `last_analytics_update`, indexes |
| `ports_porttraffichistory` | New table — stores per-port traffic history for chart data |
| `vessels_safetyzones` | New table — stores active safety zones (storm, piracy, accident, cyclone) |
| `vessels_externalsafetydata` | New staging table — raw NOAA/UNCTAD data before processing |
| `notifications_notification` | `vessel` FK made optional to support general safety alerts |

### Frontend
| Component | Route/File | Description |
|-----------|-----------|-------------|
| Port Dashboard | `/ports` — `PortsPage.jsx` | Table + charts of port congestion data |
| Arrivals vs Departures Chart | `PortsPage.jsx` | Recharts BarChart |
| Congestion Score Chart | `PortsPage.jsx` | Recharts BarChart with score per port |
| Safety Overlays | `MapPage.jsx` | Leaflet circles (red=storm, orange=cyclone, yellow=piracy, purple=accident) |
| Overlay Toggle Controls | `MapPage.jsx` | Checkboxes to show/hide each safety layer type |
| Risk Alert Panel | `MapPage.jsx` | Slide-in panel listing high/critical vessel alerts |
| Notification Dropdown | `Header.jsx` | Bell icon showing real-time user notifications |

---

## 6. Common Issues & Fixes

### "No module named psycopg2"
```powershell
pip install psycopg2-binary
```

### Migration errors / "table does not exist"
```powershell
python manage.py migrate --run-syncdb
```

### Port 5173 already in use
```powershell
npx vite --port 5174
```

### Frontend can't reach backend (CORS errors)
Make sure the backend has `CORS_ALLOW_ALL_ORIGINS = True` in `core/settings.py` (it already does).

### Safety alerts return empty list
Run the seed command first:
```powershell
python manage.py seed_m3_data
```

---

## 7. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 + Vite |
| Frontend Styling | Tailwind CSS + Custom CSS |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| HTTP Client | Axios |
| Backend Framework | Django 4.2 + Django REST Framework |
| Authentication | JWT (SimpleJWT) |
| Database | PostgreSQL 14 |
| ORM | Django ORM |
