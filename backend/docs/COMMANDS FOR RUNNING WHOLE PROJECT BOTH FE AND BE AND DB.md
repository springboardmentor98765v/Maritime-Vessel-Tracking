# 🚀 Project Startup Guide — Maritime Vessel Tracking
          
     THESE ARE NOT WORKING ILL UPDATE OR FOLLOW BELOW COMMANDS

1.         cd backend

2.         python -m venv venv_win

3.         .\venv_win\Scripts\Activate.ps1

4.         pip install -r requirements.txt

5.         python manage.py migrate

6.         python manage.py createsuperuser

7.         python manage.py seed_m3_data

8.         python manage.py runserver


1.         cd frontend

2.         npm install

3.         npm run dev

















This guide walks you through running the **full project** locally: PostgreSQL database, Django backend, and React frontend.

## ⚡ Quick Start Links
If your environment is already set up and running, here are the links you need:
- **Frontend App:** [http://localhost:5173](http://localhost:5173) (Open this to use the app)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Django Admin:** [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

## ✅ Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js + npm | v18+ |
| PostgreSQL | 14+ |

---

## 🗄️ Step 1 — Database Setup (PostgreSQL)

1. Open **pgAdmin** or the `psql` command line.
2. Create a new database named **`teamm3`**.
3. Make sure the user is **`postgres`** and the password is **`root`**.

> **If your credentials differ**, update the `DATABASES` block in `backend/core/settings.py`.

**PostgreSQL connection details used by the project:**
| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `teamm3` |
| User | `postgres` |
| Password | `root` |

---

## ⚙️ Step 2 — Backend Setup (Django)

Open a terminal in the **project root** (`teamm3/`) and run:

```powershell
# 1. Move into the backend folder
cd backend

# 2. Create a virtual environment (first time only)
python -m venv .venv

# 3. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# 4. Install all Python dependencies
pip install -r requirements.txt

# 5. Apply database migrations
python manage.py migrate

# 6. Seed all baseline data (ports, vessels, routes, safety zones)
python manage.py seed_baseline

# 7. Start the Django development server
python manage.py runserver
```

**Backend is now live at:** 👉 **[http://localhost:8000](http://localhost:8000)**

### Backend API Endpoints

| Endpoint | Description |
|----------|-------------|
| `http://localhost:8000/admin/` | Django Admin Panel |
| `http://localhost:8000/vessels/` | Vessels API |
| `http://localhost:8000/ports/` | Ports API |
| `http://localhost:8000/voyages/` | Voyages API |
| `http://localhost:8000/auth/` | Authentication (login / register) |
| `http://localhost:8000/notifications/` | Notifications API |
| `http://localhost:8000/safety-events/` | Safety Events / Overlay API |

---

## 🌐 Step 3 — Frontend Setup (React + Vite)

Open a **new terminal window** (keep the backend running), navigate to the project root, and run:

```powershell
# 1. Move into the frontend folder
cd frontend                                                                                                                                                                             

# 2. Install Node dependencies (first time only)
npm install

# 3. Start the Vite development server
npm run dev
```

**Frontend is now live at:** 👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔗 All Local Server Links (Quick Reference)

| Service | URL | Notes |
|---------|-----|-------|
| **React Frontend** | [http://localhost:5173](http://localhost:5173) | Main app — open this in your browser |
| **Django Backend API** | [http://localhost:8000](http://localhost:8000) | REST API root |
| **Django Admin Panel** | [http://localhost:8000/admin/](http://localhost:8000/admin/) | Manage DB records via UI |
| **PostgreSQL Database** | localhost:5432 | Connect via pgAdmin or psql |
| **Vessels API** | [http://localhost:8000/vessels/](http://localhost:8000/vessels/) | Live vessel tracking data |
| **Ports API** | [http://localhost:8000/ports/](http://localhost:8000/ports/) | Port data & analytics |
| **Voyages API** | [http://localhost:8000/voyages/](http://localhost:8000/voyages/) | Voyage records |
| **Safety Events API** | [http://localhost:8000/safety-events/](http://localhost:8000/safety-events/) | Safety overlay data |
| **Notifications API**| [http://localhost:8000/notifications/](http://localhost:8000/notifications/) | Notifications |
| **Auth API** | [http://localhost:8000/auth/](http://localhost:8000/auth/) | JWT login & registration |

---

## 🔄 Optional — Simulate Live Vessel Data

To run the live vessel data simulator (generates real-time movement data):

```powershell
# In backend/ with .venv activated
python manage.py simulate_live_api
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|---------|
| `ModuleNotFoundError` when seeding | Make sure `.venv` is activated: `.\.venv\Scripts\Activate.ps1` |
| PostgreSQL connection error | Ensure PostgreSQL service is running on port `5432` |
| Migration errors | Run `python manage.py makemigrations` then `python manage.py migrate` |
| Frontend not loading data | Confirm backend is running at `http://localhost:8000` |
| `npm install` fails | Make sure Node.js v18+ is installed (`node -v`) |
| Port already in use (8000) | Another process is using port 8000 — kill it or use `python manage.py runserver 8001` |

---

## ⚡ Pro Tips

- **Command Palette:** Press `Cmd+K` (or `Ctrl+K`) anywhere in the frontend app to instantly search for vessels, ports, or jump between dashboard views.

---

## 💾 Exporting Live Data

To export all the live database data to a PostgreSQL `.sql` file:
1. Make sure PostgreSQL is running on port 5432 and the `teamm3` database exists.
2. In the project root (`teamm3/`), simply run:
   ```cmd
   export_live_data.bat
   ```
3. A new file named `live_data_export.sql` will be generated in the root directory. You can use this file to restore or inspect the live database contents.

---

## 📥 Importing Live Data (For Teammates)

If another person wants to use your exact database locally with the 1000 vessels:

1. They need to share or download the `live_data_export.sql` file you generated.
2. They must have PostgreSQL installed locally on port `5432`.
3. They must first create an empty database named `teamm3` in their pgAdmin or `psql`.
4. Run the import script in the root directory:
   ```cmd
   import_live_data.bat
   ```
   *(Or they can manually run: `psql -U postgres -h localhost -p 5432 -d teamm3 -f live_data_export.sql`)*
5. The `teamm3` database will now match your live instance exactly!
