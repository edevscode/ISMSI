# ISMSI — Integrated Smart Municipal Safety and Incident System

A full-stack barangay incident management system for Barangay Bolacan, Bocaue, Bulacan. Built with Django REST Framework (backend) and React + Vite + TypeScript (frontend).

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Python | 3.11+ |
| Node.js | 18+ |
| MySQL | 8.0+ |
| Git | any recent |

---

## 1 — Clone the repository

```bash
git clone https://github.com/your-org/ismsi.git
cd ismsi
```

---

## 2 — Database setup

Create the database in MySQL:

```sql
CREATE DATABASE ismsi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The SQL dump is not included in the repository because it may contain sensitive user data. Contact the project maintainer for a sanitized schema dump, or let Django create the tables automatically:

```bash
cd backend
python manage.py migrate
```

Then seed the roles and create the admin account (step 3 below).

---

## 3 — Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Generate with `python -c "import secrets; print(secrets.token_hex(50))"` |
| `DATABASE_USER` | MySQL username (default: `root`) |
| `DATABASE_PASSWORD` | MySQL password |
| `DATABASE_NAME` | Database name (default: `ismsi_db`) |
| `CLOUDINARY_URL` | Cloudinary API URL — get from [cloudinary.com](https://cloudinary.com) dashboard |

### Seed roles and create the admin account

```bash
python create_admin.py
```

You will be prompted for the admin email, password, phone, and name. You can also pass them as flags:

```bash
python create_admin.py \
  --email admin@example.com \
  --phone 09171234567 \
  --first "System" \
  --last "Administrator"
```

### Start the development server

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000`.

---

## 4 — Frontend setup

```bash
cd frontend
npm install
```

### Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 5 — Running both together

Open two terminals:

**Terminal 1 — backend:**
```bash
cd backend && source venv/bin/activate   # or venv\Scripts\activate on Windows
python manage.py runserver
```

**Terminal 2 — frontend:**
```bash
cd frontend && npm run dev
```

---

## Project structure

```
ismsi/
├── backend/
│   ├── apps/
│   │   ├── accounts/        # Users, roles, JWT auth
│   │   ├── incidents/       # Incident reports & dispatch
│   │   ├── tanods/          # Tanod deployments & location
│   │   ├── notifications/   # Push notifications
│   │   ├── documents/       # Document requests
│   │   ├── cases/           # Barangay case management
│   │   └── verifications/   # Identity verification
│   ├── config/              # Django settings & URLs
│   ├── create_admin.py      # Admin seed script
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API clients
│   │   ├── components/      # Shared UI components
│   │   └── pages/
│   │       ├── admin/       # Admin command center pages
│   │       ├── tanod/       # Field responder pages
│   │       └── residents/   # Citizen portal pages
│   ├── .env.example
│   └── package.json
└── ISMSI.v1.1.sql           # Database schema
```

---

## User roles

| Role | Access |
|------|--------|
| **ADMIN** | Full command center — incidents, dispatch, analytics, settings |
| **TANOD** | Field responder app — current task, live map, escalation |
| **RESIDENT** | Citizen portal — report incidents, track status |

---

## Environment variables reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | Yes | — | Django secret key |
| `DEBUG` | No | `True` | Set to `False` in production |
| `DATABASE_NAME` | No | `ismsi_db` | MySQL database name |
| `DATABASE_USER` | No | `root` | MySQL username |
| `DATABASE_PASSWORD` | No | *(empty)* | MySQL password |
| `DATABASE_HOST` | No | `127.0.0.1` | MySQL host |
| `DATABASE_PORT` | No | `3306` | MySQL port |
| `CLOUDINARY_URL` | Yes | — | Cloudinary API URL for image uploads |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | Yes | — | Backend API base URL (no trailing slash) |
