# 🚢 Maritime Vessel Tracking System

A premium, state-of-the-art maritime tracking and analytics platform featuring real-time vessel streaming, AIS data parsing, storm path forecasting, and global traffic density analytics.

---

## 📑 Table of Contents

- [🌟 Key Features](#-key-features)
- [🏗 Architecture](#-architecture)
- [🚀 Getting Started](#-getting-started)
- [🛠 Running the Application](#-running-the-application)
- [🐳 Docker Deployment](#-docker-deployment)
- [📡 API Documentation](#-api-documentation)
- [🧪 Testing the Advanced Features](#-testing-the-advanced-features)
- [🏗 Technology Stack](#-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Key Features

### 1. Real-time Vessel Streaming (WebSockets)
Live vessel status updates delivered via high-performance WebSockets. Utilizing Django Channels and Redis for a seamless, low-latency data flow from the ocean to your dashboard.

### 2. AIS Data Stream Parser
A robust parser for NMEA 0183 AIS messages. Decodes raw maritime signals into structured vessel information, including position, speed, course, and vessel specifications.

### 3. Storm Path Forecast Modeling
Advanced numerical modeling to predict hurricane and storm trajectories. Calculate vessel risk factors based on proximity to the predicted 'Cone of Uncertainty'.

### 4. Maritime Heatmap & Traffic Density
Global traffic analysis engine that aggregates trillions of position points into high-resolution heatmaps. Identify maritime hubs and high-congestion zones with ease.

### 5. Port Analytics
Comprehensive port management system with arrival predictions, congestion analysis, and operational metrics.

### 6. Voyage Management
Full lifecycle voyage tracking including route optimization, fuel consumption analytics, and ETA calculations.

### 7. Safety & Emergency Management
Storm event tracking, risk assessment tools, and emergency notification systems for maritime safety.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React/Vue)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Django REST API Server                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Admin Panel │  │  Auth      │  │  Vessel Tracking        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Voyages    │  │  Ports     │  │  Safety & Weather       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Django         │  │  Celery Workers │  │  External APIs  │
│  Channels       │  │  (Async Tasks)  │  │  (AIS, NOAA,    │
│  (WebSockets)   │  │                 │  │   MarineTraffic)│
└─────────────────┘  └─────────────────┘  └─────────────────┘
              │                 │
              ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│  Redis          │  │  PostgreSQL/    │
│  (Pub/Sub)      │  │  SQLite         │
└─────────────────┘  └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | 3.10+ | |
| Redis | Latest | Required for WebSockets and Celery |
| SQLite | - | Default database |
| PostgreSQL | 14+ | Optional, for production |

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd maritime-vessel-tracking/backend
   ```

2. **Setup Virtual Environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. **Configure Environment Variables**
   ```bash
   copy .env.example .env
   # Edit .env with your configuration
   ```

4. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run Migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create Superuser (Optional)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the Redis Server**
   Ensure Redis is running on your local machine (default port: 6379).

---

## 🛠 Running the Application

### 1. Start the Development Server (with WebSockets)

```bash
python manage.py runserver
```

### 2. Start Celery Worker (for AIS & Position Sync)

```bash
celery -A core worker --loglevel=info
```

### 3. Start Celery Beat (for Scheduled Tasks)

```bash
celery -A core beat --loglevel=info
```

### Development Ports

| Service | URL |
|---------|-----|
| Django Server | http://localhost:8000 |
| Admin Panel | http://localhost:8000/admin/ |
| Swagger API Docs | http://localhost:8000/swagger/ |
| ReDoc API Docs | http://localhost:8000/redoc/ |
| WebSocket | ws://localhost:8000/ws/vessels/ |

---

## 🐳 Docker Deployment

The project includes Docker configuration for containerized deployment.

### Quick Start with Docker Compose

```bash
cd backend/docker
docker-compose up -d
```

This will start:
- Django application server
- Redis container
- Celery worker
- Celery beat scheduler

---

## 📡 API Documentation

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/vessels/` | GET/POST | List/Create vessels |
| `/api/vessels/{id}/` | GET/PUT/DELETE | Vessel details |
| `/api/vessels/vessels/analytics_heatmap/` | GET | Traffic heatmap data |
| `/api/voyages/` | GET/POST | List/Create voyages |
| `/api/ports/` | GET/POST | List/Create ports |
| `/api/safety/events/storm_forecast/` | GET | Storm forecast data |
| `/api/auth/register/` | POST | User registration |
| `/api/auth/login/` | POST | User login |

### Example API Calls

```bash
# Get vessel heatmap data
curl "http://localhost:8000/api/vessels/vessels/analytics_heatmap/?grid_size=0.5"

# Get storm forecast
curl "http://localhost:8000/api/safety/events/storm_forecast/?lat=25.0&lon=-80.0&intensity=950"

# WebSocket connection (JavaScript)
const ws = new WebSocket('ws://localhost:8000/ws/vessels/');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Vessel update:', data);
};
```

---

## 🧪 Testing the Advanced Features

### Traffic Simulation
Run the included simulation script to see the AIS parser and storm modeling in action:
```bash
python utils/simulation.py
```

### Available Test Scripts

| Script | Purpose |
|--------|---------|
| `utils/simulation.py` | Generate synthetic vessel traffic and storm data |
| `utils/ais_parser.py` | Parse raw AIS NMEA messages |
| `apps/safety/storm_modeling.py` | Storm path prediction |

---

## 🏗 Technology Stack

### Backend
- **Framework:** Django 4.2+, Django REST Framework
- **Real-time:** Django Channels, Redis
- **Task Queue:** Celery, Redis

### Data & Analytics
- **Database:** SQLite (dev), PostgreSQL (prod)
- **Analytics:** NumPy, Pandas, Scipy
- **Maritime:** PyAIS

### External Integrations
- AIS Hub (MarineTraffic data provider)
- NOAA (Weather & Storm data)
- UNCTAD (Maritime statistics)

---

## 📁 Project Structure

```
maritime-vessel-tracking/
├── backend/
│   ├── core/                 # Django project settings
│   │   ├── settings.py       # Main configuration
│   │   ├── urls.py           # URL routing
│   │   ├── asgi.py           # ASGI config (WebSockets)
│   │   ├── celery.py         # Celery configuration
│   │   └── wsgi.py           # WSGI config
│   ├── apps/
│   │   ├── admin_panel/      # Admin dashboard
│   │   ├── authentication/   # User auth & permissions
│   │   ├── vessels/          # Vessel tracking & analytics
│   │   ├── voyages/         # Voyage management
│   │   ├── ports/           # Port management
│   │   ├── safety/           # Storm modeling & safety
│   │   └── notifications/   # Alert system
│   ├── integrations/         # External API clients
│   │   ├── aishub.py
│   │   ├── marinetraffic.py
│   │   ├── noaa.py
│   │   └── unctad.py
│   ├── utils/               # Shared utilities
│   │   ├── ais_parser.py    # AIS message parsing
│   │   ├── simulation.py    # Test data generation
│   │   ├── decorators.py
│   │   ├── exceptions.py
│   │   ├── permissions.py
│   │   └── validators.py
│   └── docker/              # Docker configuration
├── README.md
└── .env.example
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow PEP 8 guidelines
- Use meaningful variable and function names
- Add docstrings to all public functions
- Write tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Redis connection error | Ensure Redis is running: `redis-cli ping` |
| Celery task failures | Check Celery worker logs for details |
| WebSocket connection fails | Verify Redis is running and CORS settings |
| Database migration errors | Delete `db.sqlite3` and re-run migrations |

### Getting Help

- Check the [Swagger Documentation](http://localhost:8000/swagger/) for API details
- Review Django admin panel at `/admin/`
- Check Celery task logs for background job status

---

<div align="center">
  <p>Built with ❤️ for maritime innovation</p>
</div>
