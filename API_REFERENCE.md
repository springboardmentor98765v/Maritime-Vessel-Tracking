# 🔌 Maritime Vessel Tracking - API Reference

## Base URL
```
http://127.0.0.1:8000
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require JWT Bearer token in Authorization header.

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register/
Content-Type: application/json

{
  "username": "user@example.com",
  "email": "user@example.com",
  "password": "securepass123"
}

Response: 201 Created
{
  "id": 1,
  "username": "user@example.com",
  "email": "user@example.com",
  "message": "User created successfully"
}
```

### Login (Get JWT Token)
```
POST /auth/login/
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "securepass123"
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "user@example.com",
    "email": "user@example.com"
  }
}
```

### Refresh Token
```
POST /auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get Current User Profile
```
GET /auth/profile/
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "username": "user@example.com",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Update User Profile
```
PUT /auth/profile/
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "newemail@example.com"
}

Response: 200 OK
{
  "id": 1,
  "username": "user@example.com",
  "email": "newemail@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Change Password
```
POST /auth/change-password/
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "oldpass123",
  "new_password": "newpass123"
}

Response: 200 OK
{
  "message": "Password changed successfully"
}
```

### Logout
```
POST /auth/logout/
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Successfully logged out"
}
```

---

## 🚢 Vessel Endpoints

### List All Vessels
```
GET /vessels/
Authorization: Bearer <token>

Query Parameters:
  ?name=Ever              - Filter by name
  ?type=Container         - Filter by vessel type
  ?flag=Panama            - Filter by flag
  ?cargo_type=General     - Filter by cargo type
  ?limit=10               - Pagination limit
  ?offset=0               - Pagination offset

Response: 200 OK
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "imo_number": "9811000",
      "name": "Ever Given",
      "vessel_type": "Container Ship",
      "flag": "Panama",
      "cargo_type": "General Cargo",
      "operator": "Global Shipping Inc.",
      "last_position_lat": 30.01,
      "last_position_lon": 32.58,
      "speed": 15.5,
      "heading": 45.0,
      "destination": "Singapore",
      "last_update": "2024-03-05T12:34:56Z",
      "created_at": "2024-03-05T10:00:00Z"
    }
  ]
}
```

### Get Vessel Details
```
GET /vessels/1/
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "imo_number": "9811000",
  "name": "Ever Given",
  "vessel_type": "Container Ship",
  "flag": "Panama",
  "cargo_type": "General Cargo",
  "operator": "Global Shipping Inc.",
  "last_position_lat": 30.01,
  "last_position_lon": 32.58,
  "speed": 15.5,
  "heading": 45.0,
  "destination": "Singapore",
  "last_update": "2024-03-05T12:34:56Z",
  "created_at": "2024-03-05T10:00:00Z"
}
```

### Update Vessel Position
```
POST /vessels/1/position/
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 31.5,
  "longitude": 33.2,
  "speed": 16.2,
  "heading": 45.0,
  "destination": "Rotterdam"
}

Response: 201 Created
{
  "id": 1,
  "vessel": 1,
  "latitude": 31.5,
  "longitude": 33.2,
  "speed": 16.2,
  "heading": 45.0,
  "timestamp": "2024-03-05T13:00:00Z"
}
```

### Get Vessel Events
```
GET /vessels/1/events/
Authorization: Bearer <token>

Response: 200 OK
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "vessel": 1,
      "event_type": "Arrival",
      "timestamp": "2024-03-04T12:00:00Z",
      "details": "Ever Given arrived at anchor."
    }
  ]
}
```

### Subscribe to Vessel Updates
```
POST /vessels/1/subscribe/
Authorization: Bearer <token>

Response: 201 Created
{
  "id": 1,
  "user": 1,
  "vessel": 1,
  "created_at": "2024-03-05T13:00:00Z"
}
```

### Unsubscribe from Vessel Updates
```
DELETE /vessels/1/subscribe/
Authorization: Bearer <token>

Response: 204 No Content
```

### List User Subscriptions
```
GET /vessels/subscriptions/
Authorization: Bearer <token>

Response: 200 OK
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "vessel": {
        "id": 1,
        "name": "Ever Given",
        "imo_number": "9811000"
      },
      "created_at": "2024-03-05T13:00:00Z"
    }
  ]
}
```

---

## ⚓ Port Endpoints

### List All Ports
```
GET /ports/
Authorization: Bearer <token>

Response: 200 OK
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "name": "Port of Singapore",
      "location": "Singapore",
      "country": "Singapore",
      "latitude": 1.264,
      "longitude": 103.84,
      "congestion_score": 85,
      "avg_wait_time": 24.5,
      "arrivals": 45,
      "departures": 42,
      "last_update": "2024-03-05T12:00:00Z"
    }
  ]
}
```

### Get Port Details
```
GET /ports/1/
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "name": "Port of Singapore",
  "location": "Singapore",
  "country": "Singapore",
  "latitude": 1.264,
  "longitude": 103.84,
  "congestion_score": 85,
  "avg_wait_time": 24.5,
  "arrivals": 45,
  "departures": 42,
  "last_update": "2024-03-05T12:00:00Z"
}
```

### Get Port Congestion Dashboard
```
GET /ports/congestion/
Authorization: Bearer <token>

Response: 200 OK
{
  "total_ports": 5,
  "high_congestion_ports": 2,
  "average_congestion": 63.4,
  "ports": [
    {
      "id": 3,
      "name": "Port of Shanghai",
      "congestion_score": 92,
      "avg_wait_time": 36.2,
      "status": "high"
    },
    {
      "id": 1,
      "name": "Port of Singapore",
      "congestion_score": 85,
      "avg_wait_time": 24.5,
      "status": "high"
    }
  ]
}
```

### Get Port Analytics
```
GET /ports/analytics/
Authorization: Bearer <token>

Response: 200 OK
{
  "total_vessels_served": 125,
  "average_stay_duration": 3.5,
  "peak_traffic_hour": 14,
  "trend_data": [
    {
      "date": "2024-03-01",
      "vessel_count": 15,
      "avg_congestion": 60.0
    }
  ]
}
```

---

## 🛤️ Voyage Endpoints

### List All Voyages
```
GET /voyages/
Authorization: Bearer <token>

Query Parameters:
  ?vessel=1               - Filter by vessel ID
  ?status=In%20Transit    - Filter by status
  ?port_from=1            - Filter by departure port
  ?port_to=2              - Filter by arrival port

Response: 200 OK
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "vessel": {
        "id": 1,
        "name": "Ever Given",
        "imo_number": "9811000"
      },
      "port_from": {
        "id": 5,
        "name": "Port of Dubai"
      },
      "port_to": {
        "id": 1,
        "name": "Port of Singapore"
      },
      "departure_time": "2024-02-28T10:00:00Z",
      "arrival_time": "2024-03-08T10:00:00Z",
      "status": "In Transit",
      "estimated_distance": 2800.5,
      "created_at": "2024-02-28T08:00:00Z"
    }
  ]
}
```

### Get Voyage Details
```
GET /voyages/1/
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "vessel": {
    "id": 1,
    "name": "Ever Given",
    "imo_number": "9811000",
    "vessel_type": "Container Ship"
  },
  "port_from": {
    "id": 5,
    "name": "Port of Dubai",
    "country": "UAE"
  },
  "port_to": {
    "id": 1,
    "name": "Port of Singapore",
    "country": "Singapore"
  },
  "departure_time": "2024-02-28T10:00:00Z",
  "arrival_time": "2024-03-08T10:00:00Z",
  "status": "In Transit",
  "estimated_distance": 2800.5,
  "average_speed": 15.5,
  "created_at": "2024-02-28T08:00:00Z"
}
```

### Get Voyage Replay (Historical Positions)
```
GET /voyages/1/replay/
Authorization: Bearer <token>

Response: 200 OK
{
  "id": 1,
  "vessel": 1,
  "positions": [
    {
      "timestamp": "2024-02-28T10:00:00Z",
      "latitude": 25.27,
      "longitude": 55.33,
      "speed": 14.2,
      "heading": 45.0
    },
    {
      "timestamp": "2024-02-28T11:00:00Z",
      "latitude": 25.45,
      "longitude": 55.5,
      "speed": 15.1,
      "heading": 45.0
    }
  ],
  "total_positions": 156
}
```

---

## 🛡️ Safety Events Endpoints

### Get All Safety Events
```
GET /safety-events/
Authorization: Bearer <token>

Response: 200 OK
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "event_type": "piracy",
      "title": "Suspected Piracy Activity",
      "latitude": 12.0,
      "longitude": 45.0,
      "radius_nm": 100,
      "severity": "high",
      "active_from": "2024-03-01T08:00:00Z",
      "active_until": null,
      "is_active": true,
      "description": "Reports of suspicious activity"
    }
  ]
}
```

---

## 📨 Notifications Endpoints

### List User Notifications
```
GET /notifications/
Authorization: Bearer <token>

Response: 200 OK
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "user": 1,
      "title": "Vessel Position Update",
      "message": "Ever Given has arrived at Singapore",
      "type": "position_update",
      "is_read": false,
      "created_at": "2024-03-05T12:00:00Z"
    }
  ]
}
```

### Create Notification
```
POST /notifications/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Custom Alert",
  "message": "Important safety alert",
  "type": "alert"
}

Response: 201 Created
{
  "id": 1,
  "title": "Custom Alert",
  "message": "Important safety alert",
  "type": "alert",
  "is_read": false,
  "created_at": "2024-03-05T13:00:00Z"
}
```

### Mark Notification as Read
```
PATCH /notifications/1/
Authorization: Bearer <token>
Content-Type: application/json

{
  "is_read": true
}

Response: 200 OK
{
  "id": 1,
  "is_read": true,
  "updated_at": "2024-03-05T13:05:00Z"
}
```

### Delete Notification
```
DELETE /notifications/1/
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 📝 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

---

## 🔑 Error Response Format

```json
{
  "error": "Error message",
  "details": {
    "field_name": ["Error detail 1", "Error detail 2"]
  }
}
```

---

## 📌 Sample cURL Requests

### Get JWT Token
```bash
curl -X POST http://127.0.0.1:8000/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```

### Get All Vessels (with token)
```bash
curl -X GET http://127.0.0.1:8000/vessels/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Vessel Position
```bash
curl -X POST http://127.0.0.1:8000/vessels/1/position/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 31.5,
    "longitude": 33.2,
    "speed": 16.2,
    "heading": 45.0,
    "destination": "Rotterdam"
  }'
```

---

## 🧪 Test the API Online

Visit: **http://127.0.0.1:8000/api/** (if DRF browsable API is enabled)

Or use tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/)

---

**Last Updated**: March 5, 2026  
**API Version**: v1.0  
**Base URL**: http://127.0.0.1:8000
