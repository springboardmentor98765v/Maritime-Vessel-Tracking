# Maritime Vessel Tracking - Complete Setup Guide

## 🚀 Quick Start (ALL SYSTEMS READY)

Your project is now **fully configured and running**! Both servers are active and ready to use.

---

## 📱 Access the Application

### **Frontend (React/Vite)**
- **URL**: http://localhost:5174
- **Status**: Running on port 5174
- **Note**: Port 5173 was in use, so fallback to 5174

### **Backend (Django REST API)**
- **URL**: http://127.0.0.1:8000
- **Status**: Running on port 8000
- **Admin Panel**: http://127.0.0.1:8000/admin

### **Admin Account**
- **Username**: admin
- **Password**: admin123  (if set up, adjust as needed)

---

## 📋 Prerequisites

Before running the project, ensure you have:

1. **Python 3.8+** - [Download](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download](https://nodejs.org/)
3. **Git** - [Download](https://git-scm.com/)
4. **Virtual Environment** - Created in `.venv` folder

---

## 🔧 Step-by-Step Setup Instructions

### **Step 1: Activate Python Virtual Environment**

```bash
# Navigate to project root
cd c:\Users\LENOVO\Desktop\teamm3

# Activate virtual environment (Windows PowerShell)
& .\.venv\Scripts\Activate.ps1

# Or if using Command Prompt (cmd.exe)
.venv\Scripts\activate
```

**Expected Output**: `(.venv)` prefix in your terminal

---

### **Step 2: Setup Backend (Django)**

```bash
# Navigate to backend folder
cd backend

# Apply database migrations (if needed)
python manage.py migrate

# Seed the database with test data
python manage.py seed_data

# Create superuser for admin panel (optional, if not already created)
python manage.py createsuperuser
```

**Seeded Data Includes:**
- ✅ 5 Vessels (Ever Given, Ocean Voyager, Global Express, Sea Breeze, Arctic Star)
- ✅ 5 Ports (Singapore, Rotterdam, Shanghai, Los Angeles, Dubai)
- ✅ 5 Voyages (with various statuses)
- ✅ 3 Safety Events (Piracy, Storm, Restricted Areas)

---

### **Step 3: Run Backend Server**

```bash
# From backend folder
python manage.py runserver 0.0.0.0:8000
```

**Expected Output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

**✅ Backend is now running at: http://127.0.0.1:8000**

---

### **Step 4: Setup Frontend (React + Vite)**

In a **new terminal**, navigate to the frontend folder:

```bash
# Navigate to project root
cd c:\Users\LENOVO\Desktop\teamm3

# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
# OR: npx vite
```

**Expected Output:**
```
  VITE v7.3.1  ready in 560 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend is now running at: http://localhost:5173 or http://localhost:5174**

---

## 🌐 All Localhost Links

| **Component** | **URL** | **Type** |
|---|---|---|
| **Frontend** | http://localhost:5174 | React App |
| **Backend API** | http://127.0.0.1:8000 | REST API |
| **Django Admin** | http://127.0.0.1:8000/admin | Admin Panel |
| **API Docs** | http://127.0.0.1:8000/api/docs | API Documentation |

---

## 📡 Complete API Endpoints Reference

### **Authentication Endpoints**
```
POST   /auth/register/              - Register new user
POST   /auth/login/                 - User login (get JWT token)
POST   /auth/refresh/               - Refresh JWT token
POST   /auth/logout/                - User logout
POST   /auth/password-reset/        - Request password reset
POST   /auth/password-reset-confirm/- Confirm password reset
GET    /auth/profile/               - Get current user profile
PUT    /auth/profile/               - Update user profile
POST   /auth/change-password/       - Change password
```

### **Vessel Endpoints**
```
GET    /vessels/                    - List all vessels (filters: name, type, flag, cargo_type)
GET    /vessels/<id>/               - Get vessel details
POST   /vessels/<id>/position/      - Update vessel position
GET    /vessels/<id>/events/        - Get vessel events history
POST   /vessels/<id>/subscribe/     - Subscribe to vessel updates
DELETE /vessels/<id>/subscribe/     - Unsubscribe from vessel updates
GET    /vessels/subscriptions/      - List user subscriptions
```

#### **Vessel List Query Parameters**
```
GET /vessels/?name=Ever&type=Container&flag=Panama&cargo_type=Cargo
GET /vessels/?limit=10&offset=0    - Pagination
```

### **Port Endpoints**
```
GET    /ports/                      - List all ports
GET    /ports/<id>/                 - Get port details
GET    /ports/congestion/           - Get port congestion dashboard
GET    /ports/analytics/            - Get port analytics data
```

### **Voyage Endpoints**
```
GET    /voyages/                    - List all voyages (filters: vessel, status, port_from, port_to)
GET    /voyages/<id>/               - Get voyage details
GET    /voyages/<id>/replay/        - Get voyage replay data (historical positions)
```

#### **Voyage List Query Parameters**
```
GET /voyages/?vessel=1&status=In%20Transit&port_from=1&port_to=2
```

### **Safety Events Endpoints**
```
GET    /safety-events/              - List all active safety events
```

### **Notifications Endpoints**
```
GET    /notifications/              - List user notifications
POST   /notifications/              - Create notification
GET    /notifications/<id>/         - Get notification details
DELETE /notifications/<id>/         - Delete notification
```

---

## ✅ Verify Installation

### **Test Backend Connection**

Open your browser or use curl:

```bash
# Test backend is running
curl http://127.0.0.1:8000/vessels/

# Expected: JSON response with vessel list
```

### **Test Frontend Connection**

- Open http://localhost:5174 in your browser
- You should see the Maritime Vista dashboard

---

## 🗄️ Database Information

- **Type**: SQLite
- **Location**: `backend/db.sqlite3`
- **ORM**: Django ORM
- **Models**: Vessel, Port, Voyage, SafetyEvent, VesselEvent

### **View Database (Optional)**

```bash
# Django shell
cd backend
python manage.py shell

# Then in Python:
from apps.vessels.models import Vessel
Vessel.objects.all()  # List all vessels
```

---

## 🐛 Troubleshooting

### **Error: "Failed to load port congestion data"**
✅ **Solution**: Ensure backend is running at http://127.0.0.1:8000
```bash
# In backend folder:
python manage.py runserver 0.0.0.0:8000
```

### **Error: "No vessels found"**
✅ **Solution**: Run the seed_data command
```bash
cd backend
python manage.py seed_data
```

### **Error: "Port 5173 is in use"**
✅ **Solution**: Frontend will automatically use port 5174, or kill process:
```bash
# Windows PowerShell
Get-Process -Name node | Stop-Process -Force

# Then restart: npm run dev
```

### **Error: "Backend connection refused"**
✅ **Solution**: 
1. Check if backend is running: `python manage.py runserver 0.0.0.0:8000`
2. Check firewall settings
3. Verify backend URL in frontend `src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});
```

### **Error: "CORS issues"**
✅ **Solution**: CORS is already enabled in settings. Verify in `backend/core/settings.py`:
```python
CORS_ALLOW_ALL_ORIGINS = True
```

### **Error: "No migrations to apply"**
✅ **Solution**: This is normal. Database schema is already in place.

---

## 📊 Sample Data Overview

### **Seeded Vessels**
| Name | Type | Flag | Cargo |
|---|---|---|---|
| Ever Given | Container Ship | Panama | General Cargo |
| Ocean Voyager | Oil Tanker | Marshall Islands | Crude Oil |
| Global Express | Bulk Carrier | Liberia | Iron Ore |
| Sea Breeze | Cruise Ship | Bahamas | Passengers |
| Arctic Star | LNG Carrier | Norway | LNG |

### **Seeded Ports**
| Name | Country | Congestion Score |
|---|---|---|
| Port of Singapore | Singapore | 85 |
| Port of Rotterdam | Netherlands | 45 |
| Port of Shanghai | China | 92 |
| Port of Los Angeles | USA | 75 |
| Port of Dubai | UAE | 20 |

### **Seeded Safety Events**
- Suspected Piracy Activity (High Severity)
- Tropical Cyclone Warning (Critical Severity)
- Military Exercise Area (Medium Severity)

---

## 🔄 Restart Full Stack

To stop and restart everything:

```bash
# Terminal 1: Backend
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Frontend
cd c:\Users\LENOVO\Desktop\teamm3\frontend
npm run dev
```

Then access:
- **Frontend**: http://localhost:5174
- **Backend**: http://127.0.0.1:8000

---

## 📝 Project Structure

```
teamm3/
├── backend/                    # Django REST API
│   ├── apps/
│   │   ├── authentication/     # User auth & JWT
│   │   ├── vessels/            # Vessel management
│   │   ├── ports/              # Port management
│   │   ├── voyages/            # Voyage tracking
│   │   ├── notifications/      # User notifications
│   │   └── admin/              # Admin views
│   ├── core/                   # Django settings & URLs
│   ├── manage.py               # Django CLI
│   ├── db.sqlite3              # Database
│   └── requirements.txt         # Python dependencies
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── context/            # React Context
│   │   └── App.jsx             # Main app
│   ├── package.json            # Node dependencies
│   └── vite.config.js          # Vite configuration
│
└── .venv/                      # Python virtual environment
```

---

## 🎯 Common Tasks

### **Add New Vessels**
```bash
cd backend
python manage.py shell

from apps.vessels.models import Vessel
from django.utils import timezone

Vessel.objects.create(
    imo_number='1234567',
    name='New Vessel',
    vessel_type='Cargo Ship',
    flag='Greece',
    cargo_type='General',
    last_update=timezone.now()
)
```

### **Create Admin User**
```bash
cd backend
python manage.py createsuperuser
# Follow prompts
```

### **Fresh Database Reset**
```bash
cd backend
# Delete db.sqlite3
rm db.sqlite3
# Recreate
python manage.py migrate
python manage.py seed_data
```

---

## 🚀 Production Deployment Checklist

- [ ] Set `DEBUG = False` in `settings.py`
- [ ] Add allowed hosts to `ALLOWED_HOSTS`
- [ ] Use environment variables for sensitive data
- [ ] Set up PostgreSQL (instead of SQLite)
- [ ] Configure HTTPS/SSL
- [ ] Set up CORS properly (not `CORS_ALLOW_ALL_ORIGINS`)
- [ ] Use production WSGI server (Gunicorn)
- [ ] Set up frontend build: `npm run build`

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify both servers are running in separate terminals
3. Check console output for error messages
4. Ensure ports 5174 and 8000 are available
5. Try clearing browser cache (Ctrl+Shift+Delete)

---

## ✨ Features

- ✅ Real-time vessel tracking
- ✅ Port congestion analytics
- ✅ Safety events monitoring
- ✅ Voyage replay functionality
- ✅ User authentication with JWT
- ✅ Responsive dashboard
- ✅ Interactive map integration
- ✅ Admin panel for data management

---

**Last Updated**: March 5, 2026  
**Status**: ✅ All Systems Ready  
**Backend**: http://127.0.0.1:8000  
**Frontend**: http://localhost:5174
