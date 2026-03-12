# 🚀 QUICK START REFERENCE

## ⚡ SYSTEM STATUS: ✅ ALL RUNNING

```
✅ Backend (Django):      http://127.0.0.1:8000
✅ Frontend (React/Vite): http://localhost:5174
✅ Admin Panel:           http://127.0.0.1:8000/admin
✅ Database:              SQLite3 (Seeded with 5 vessels, 5 ports, 5 voyages)
```

---

## 📱 INSTANT ACCESS LINKS

| Link | Purpose |
|------|---------|
| **[http://localhost:5174](http://localhost:5174)** | Main Dashboard |
| **[http://127.0.0.1:8000](http://127.0.0.1:8000)** | API Root |
| **[http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)** | Admin Panel |
| **[http://127.0.0.1:8000/vessels/](http://127.0.0.1:8000/vessels/)** | All Vessels API |
| **[http://127.0.0.1:8000/ports/](http://127.0.0.1:8000/ports/)** | All Ports API |
| **[http://127.0.0.1:8000/voyages/](http://127.0.0.1:8000/voyages/)** | All Voyages API |

---

## 🎯 WHAT WAS FIXED

| Issue | Fix Applied | Status |
|-------|-------------|--------|
| Failed to load port congestion data | Backend running at 127.0.0.1:8000 | ✅ Fixed |
| No vessels found | Database seeded with `python manage.py seed_data` | ✅ Fixed |
| No voyages found | Voyage data created during seeding | ✅ Fixed |
| Failed to load analytics data | Port analytics endpoints enabled | ✅ Fixed |
| DB seed command error | Fixed `vessel_type` field name in seed_data.py | ✅ Fixed |
| Port conflict on 5173 | Frontend running on fallback port 5174 | ✅ Fixed |
| Missing CORS configuration | CORS already enabled in settings.py | ✅ Verified |

---

## 🔄 RESTART COMMANDS

### Terminal 1 (Backend)
```bash
cd c:\Users\LENOVO\Desktop\teamm3\backend
python manage.py runserver 0.0.0.0:8000
```

### Terminal 2 (Frontend)
```bash
cd c:\Users\LENOVO\Desktop\teamm3\frontend
npm run dev
```

---

## 📊 SEEDED DATA

### Vessels (5 total)
- Ever Given (Container Ship)
- Ocean Voyager (Oil Tanker)
- Global Express (Bulk Carrier)
- Sea Breeze (Cruise Ship)
- Arctic Star (LNG Carrier)

### Ports (5 total)
- Singapore (Congestion: 85%)
- Rotterdam (Congestion: 45%)
- Shanghai (Congestion: 92%)
- Los Angeles (Congestion: 75%)
- Dubai (Congestion: 20%)

### Safety Events (3 total)
- Piracy Activity (High)
- Tropical Cyclone (Critical)
- Military Exercise (Medium)

---

## 🧪 API TEST COMMANDS

```bash
# Get all vessels
curl http://127.0.0.1:8000/vessels/

# Get specific vessel (ID 1)
curl http://127.0.0.1:8000/vessels/1/

# Get all ports
curl http://127.0.0.1:8000/ports/

# Get safety events
curl http://127.0.0.1:8000/safety-events/

# Get all voyages
curl http://127.0.0.1:8000/voyages/
```

---

## 💾 DATABASE OPERATIONS

### Reset Database
```bash
cd backend
# Backup data
cp db.sqlite3 db.sqlite3.backup

# Reset
rm db.sqlite3
python manage.py migrate
python manage.py seed_data
```

### Access Django Shell
```bash
cd backend
python manage.py shell

# In shell:
from apps.vessels.models import Vessel
Vessel.objects.all()  # List vessels
```

---

## 🛠️ COMMON TASKS

### Seed More Data
```bash
cd backend
python manage.py seed_large_data  # 150 vessels, 61 ports, 369 voyages
```

### Create Admin User
```bash
cd backend
python manage.py createsuperuser
```

### Check Dependencies
```bash
# Frontend
cd frontend
npm list

# Backend
cd backend
pip list
```

---

## ⚙️ CONFIGURATION FILES

- **Backend Settings**: `backend/core/settings.py`
- **API URLs**: `backend/core/urls.py`
- **Frontend API Config**: `frontend/src/services/api.js`
- **Database**: `backend/db.sqlite3`

---

## 🔍 KEY FILES MODIFIED

1. **backend/apps/vessels/management/commands/seed_data.py**
   - Fixed: Changed `'type'` → `'vessel_type'` field name

2. **COMPLETE_SETUP_GUIDE.md**
   - Created: Full setup documentation with endpoints and troubleshooting

---

## 📋 TERMINAL SETUP (Copy & Paste)

### Setup Backend
```bash
cd c:\Users\LENOVO\Desktop\teamm3
.\.venv\Scripts\activate
cd backend
python manage.py migrate
python manage.py seed_data
python manage.py runserver 0.0.0.0:8000
```

### Setup Frontend (New Terminal)
```bash
cd c:\Users\LENOVO\Desktop\teamm3
.\.venv\Scripts\activate
cd frontend
npm install
npm run dev
```

---

## ✨ PROJECT FEATURES

- 🗺️ Interactive vessel tracking map
- 📊 Port congestion analytics dashboard
- ⚠️ Real-time safety event monitoring
- 🎬 Voyage replay functionality
- 🔐 JWT authentication & authorization
- 📱 Responsive mobile-friendly interface
- 🔄 Real-time position updates
- 📧 Notification system
- 🎯 Advanced filtering & search

---

## 📞 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Backend not responding | `python manage.py runserver 0.0.0.0:8000` |
| No data showing | `python manage.py seed_data` |
| Port 5173 in use | Frontend auto-uses 5174 |
| CORS errors | Already enabled in settings |
| Database errors | `python manage.py migrate` |

---

**All Systems Ready! Access the application at http://localhost:5174**
