# Maritime Vessel Tracking - Backend

## Project Overview

The backend is a Django REST Framework application that provides APIs for live vessel tracking, port congestion analytics, and safety overlays. It integrates with multiple maritime data sources (MarineTraffic, AIS Hub, UNCTAD, NOAA) to deliver real-time insights for shipping companies, port authorities, and maritime insurers.

## Technology Stack

- **Framework**: Django 4.x + Django REST Framework (DRF)
- **Language**: Python 3.10+
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Task Queue**: Celery (optional, for background jobs)
- **API Documentation**: drf-spectacular / Swagger
- **Testing**: pytest, Django test client
- **HTTP Client**: requests, aiohttp
- **Data Processing**: pandas, numpy

## Installation & Setup

### Prerequisites
- Python 3.10+
- pip (Python package manager)
- Virtual environment (venv or virtualenv)
- PostgreSQL (for production)

### Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration


Project Structure

backend/
├── manage.py
├── requirements.txt
├── .env.example
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── core/                           # Main Django app configuration
│   ├── settings.py                # Settings configuration
│   ├── urls.py                    # Main URL routing
│   ├── asgi.py                    # ASGI for WebSocket support
│   └── wsgi.py
├── apps/
│   ├── authentication/            # User authentication & roles
│   │   ├── models.py             # User, Role models
│   │   ├── serializers.py        # JWT serializers
│   │   ├── views.py              # Login, register, profile endpoints
│   │   ├── urls.py
│   │   └── tests/
│   │
│   ├── vessels/                   # Vessel tracking & metadata
│   │   ├── models.py             # Vessel, Position, Route models
│   │   ├── serializers.py
│   │   ├── views.py              # Vessel list, detail, filter endpoints
│   │   ├── urls.py
│   │   ├── tasks.py              # Celery tasks for API syncing
│   │   └── tests/
│   │
│   ├── ports/                     # Port congestion analytics
│   │   ├── models.py             # Port, Congestion, ArrivalDeparture models
│   │   ├── serializers.py
│   │   ├── views.py              # Port stats, congestion endpoints
│   │   ├── urls.py
│   │   ├── analytics.py          # Congestion calculation logic
│   │   └── tests/
│   │
│   ├── safety/                    # Safety overlays & weather
│   │   ├── models.py             # SafetyEvent, WeatherAlert, PiracyZone
│   │   ├── serializers.py
│   │   ├── views.py              # Safety data endpoints
│   │   ├── urls.py
│   │   └── tests/
│   │
│   ├── voyages/                   # Historical voyage & audit
│   │   ├── models.py             # Voyage, VoyageHistory, Compliance
│   │   ├── serializers.py
│   │   ├── views.py              # Voyage history, replay endpoints
│   │   ├── urls.py
│   │   └── tests/
│   │
│   ├── notifications/             # Event notifications
│   │   ├── models.py             # Notification, Alert models
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tasks.py              # Celery tasks for sending notifications
│   │
│   └── admin/                     # Admin tools & management
│       ├── models.py             # APIStatus, SystemLog models
│       ├── serializers.py
│       ├── views.py              # Admin dashboard endpoints
│       ├── urls.py
│       └── tests/
│
├── integrations/                  # External API integrations
│   ├── marinetraffic.py          # MarineTraffic API client
│   ├── aishub.py                 # AIS Hub API client
│   ├── noaa.py                   # NOAA Ocean Data API
│   ├── unctad.py                 # UNCTAD port statistics
│   └── base.py                   # Base API client class
│
├── utils/                         # Utility functions
│   ├── decorators.py             # Custom decorators
│   ├── permissions.py            # Role-based permissions
│   ├── serializers.py            # Common serializers
│   ├── validators.py             # Data validators
│   └── helpers.py                # Helper functions
│
├── static/                        # Static files (icons, etc.)
└── media/                         # User uploads (logs, exports)