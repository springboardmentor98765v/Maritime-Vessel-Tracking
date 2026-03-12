
---

## Frontend README.md

```markdown
# Maritime Vessel Tracking - Frontend

## Project Overview

The frontend is a modern React.js web application providing an interactive platform for live vessel tracking, port congestion analytics, and safety visualization. Users can track vessels on dynamic maps, view port statistics, receive alerts, and access historical voyage data with an intuitive dashboard.

## Technology Stack

- **Framework**: React 18.x
- **Language**: JavaScript (ES6+) / TypeScript (optional)
- **State Management**: Redux/Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Maps**: Leaflet/Mapbox GL
- **UI Components**: Material-UI / Tailwind CSS
- **Visualization**: Recharts, D3.js
- **Real-time**: WebSockets (Socket.io)
- **Testing**: Jest, React Testing Library
- **Build Tool**: Vite / Create React App

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Git
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install dependencies
npm install
# or
yarn install

# Create .env file
cp .env.example .env
# Edit .env with backend API URL and API keys


Project Structure


frontend/
├── package.json
├── vite.config.js          # Vite configuration
├── .env.example
├── docker/
│   ├── Dockerfile
│   └── nginx.conf
├── public/                 # Static assets
│   ├── icons/
│   ├── flags/              # Country flags
│   └── index.html
├── src/
│   ├── index.js
│   ├── App.jsx
│   ├── App.css
│   │
│   ├── components/         # Reusable UI components
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   │
│   │   ├── maps/
│   │   │   ├── VesselMap.jsx       # Main tracking map
│   │   │   ├── MapControls.jsx     # Zoom, layers, filters
│   │   │   ├── VesselMarker.jsx
│   │   │   ├── PortMarker.jsx
│   │   │   ├── SafetyOverlay.jsx   # Weather, piracy zones
│   │   │   └── RoutePolyline.jsx
│   │   │
│   │   ├── vessels/
│   │   │   ├── VesselList.jsx
│   │   │   ├── VesselCard.jsx
│   │   │   ├── VesselDetail.jsx    # Detailed vessel info
│   │   │   ├── VesselFilter.jsx    # Search & filter UI
│   │   │   ├── VesselSubscribe.jsx # Alert subscription
│   │   │   └── VesselHistory.jsx
│   │   │
│   │   ├── ports/
│   │   │   ├── PortList.jsx
│   │   │   ├── PortCard.jsx
│   │   │   ├── PortDetail.jsx
│   │   │   ├── CongestionChart.jsx
│   │   │   ├── ArrivalsDepartures.jsx
│   │   │   └── PortStatistics.jsx
│   │   │
│   │   ├── safety/
│   │   │   ├── WeatherAlerts.jsx
│   │   │   ├── PiracyZones.jsx
│   │   │   ├── AccidentHistory.jsx
│   │   │   └── SafetyTimeline.jsx
│   │   │
│   │   ├── voyages/
│   │   │   ├── VoyageList.jsx
│   │   │   ├── VoyageDetail.jsx
│   │   │   ├── VoyageReplay.jsx    # Historical playback
│   │   │   └── ComplianceAudit.jsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── NotificationCenter.jsx
│   │   │   └── AlertCard.jsx
│   │   │
│   │   ├── dashboards/
│   │   │   ├── OperatorDashboard.jsx
│   │   │   ├── AnalystDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── DashboardCard.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── ProfileEditor.jsx
│   │   │   └── PrivateRoute.jsx
│   │   │
│   │   └── charts/
│   │       ├── TimeSeriesChart.jsx
│   │       ├── CongestionGauge.jsx
│   │       ├── RouteMap.jsx
│   │       └── StatisticsPanel.jsx
│   │
│   ├── pages/              # Page-level components
│   │   ├── HomePage.jsx
│   │   ├── TrackingPage.jsx
│   │   ├── PortAnalyticsPage.jsx
│   │   ├── SafetyPage.jsx
│   │   ├── VoyageHistoryPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── AdminPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── stores/             # Redux / State Management
│   │   ├── index.js        # Redux store configuration
│   │   ├── slices/
│   │   │   ├── authSlice.js       # User auth state
│   │   │   ├── vesselSlice.js     # Vessels state
│   │   │   ├── portSlice.js       # Ports state
│   │   │   ├── safetySlice.js     # Safety events state
│   │   │   ├── voyageSlice.js     # Voyages state
│   │   │   ├── notificationSlice.js
│   │   │   ├── mapSlice.js        # Map state (zoom, center, layers)
│   │   │   └── uiSlice.js         # UI state (modals, filters)
│   │   └── middleware/
│   │       └── logger.js
│   │
│   ├── services/           # API & Business Logic
│   │   ├── api.js          # Axios instance & interceptors
│   │   ├── authService.js  # Login, register, token refresh
│   │   ├── vesselService.js
│   │   ├── portService.js
│   │   ├── safetyService.js
│   │   ├── voyageService.js
│   │   ├── notificationService.js
│   │   ├── websocketService.js    # WebSocket connection
│   │   └── exportService.js       # Data export (CSV, PDF)
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.js      # Authentication hook
│   │   ├── useVessels.js
│   │   ├── usePorts.js
│   │   ├── useMap.js       # Map interactions
│   │   ├── useNotifications.js
│   │   ├── useLocalStorage.js
│   │   └── useFetch.js
│   │
│   ├── utils/              # Utility functions
│   │   ├── constants.js    # App constants, enums
│   │   ├── formatters.js   # Date, number formatting
│   │   ├── validators.js   # Form validators
│   │   ├── mapHelpers.js   # Map calculations
│   │   ├── dateHelpers.js
│   │   ├── storageHelpers.js
│   │   └── apiHelpers.js
│   │
│   ├── styles/             # Global styles
│   │   ├── index.css
│   │   ├── variables.css   # CSS variables (colors, spacing)
│   │   ├── animations.css
│   │   └── responsive.css
│   │
│   ├── assets/             # Images, fonts
│   │   ├── images/
│   │   ├── fonts/
│   │   ├── icons/
│   │   └── logos/
│   │
│   └── tests/              # Test files
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
│
├── .env.example
├── .gitignore
├── README.md
├── eslintrc.json
├── prettier.config.js
└── package-lock.json / yarn.lock