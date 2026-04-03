# Backend Integration Guide for Maritime Vessel Tracking

This guide outlines how the backend should be structured and how to connect it with the frontend application.

## 1. API Contract

The frontend expects a RESTful API served at `/api`.

### Base URL
`http://localhost:5000/api` (Default development URL)

### Endpoints

#### `GET /vessels`
Returns a list of all vessels.

**Response Format:**
```json
[
  {
    "id": 1,
    "name": "Vessel Alpha",
    "type": "Cargo",
    "lat": 51.505,
    "lng": -0.09,
    "status": "Active"
  },
  ...
]
```

#### `GET /vessels/:id`
Returns details for a specific vessel.

**Response Format:**
```json
{
  "id": 1,
  "name": "Vessel Alpha",
  "type": "Cargo",
  "lat": 51.505,
  "lng": -0.09,
  "status": "Active"
}
```

## 2. CORS & Proxy Configuration

### Development
The frontend is configured to proxy requests to `http://localhost:5000`.
- Ensure your backend server runs on port `5000`.
- If you use a different port, update `vite.config.js` in the frontend root.

### CORS
If the proxy is not used (e.g., production split hosting), enable CORS on the backend to allow requests from the frontend origin (e.g., `http://localhost:5173`).

## 3. Authentication (Future)
The API service is set up to attach a Bearer token from `localStorage` if present.
- **Header:** `Authorization: Bearer <token>`
- **Login Endpoint:** (To be defined, commonly `POST /auth/login`)

## 4. Testing Connection

1.  Start your backend server.
2.  Open `src/services/api.js` in the frontend.
3.  Set `const useMock = false;` in `getVessels` and `getVesselById`.
4.  Run the frontend: `npm run dev`.
5.  Check the "Network" tab in browser dev tools to see requests hitting your backend.
