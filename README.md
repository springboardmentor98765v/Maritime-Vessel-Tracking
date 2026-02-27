
├── backend/               Django 4.2 REST API
│   ├── apps/
│   │   ├── authentication/  JWT auth, user model, password reset
│   │   ├── vessels/         Vessel CRUD, events, subscriptions, safety events
│   │   ├── ports/           Port congestion, analytics
│   │   ├── voyages/         Voyage tracking, replay
│   │   └── notifications/   User notification model
│   ├── core/
│   │   ├── settings.py      Django configuration
│   │   └── urls.py          Main URL routing
│   └── integrations/        NOAA, AISHub, MarineTraffic adapters
│
└── frontend/              React 18 + Vite
    └── src/
        ├── pages/           8 page components
        ├── components/      Header, Footer, RadarDisplay
        ├── services/        Axios API clients
        ├── context/         AuthContext
        └── hooks/           useAuth
