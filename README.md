# 🇧🇩 Oporajito (অপরাজিত)
> **Hyperlocal Skill-Sharing Web Application for Bangladesh**  
> *Neighbors learn from neighbors. No money involved — just skills, trust, and community.*

---

## 🧭 System Architecture & Tech Stack

Oporajito is built with a responsive mobile-first architecture that scales seamlessly across phones, tablets, and full-screen desktop browsers.

```text
oporajito/
├── frontend/                   # React 19 + Vite + React Router (Responsive Web App)
│   ├── src/
│   │   ├── api/                # API client (auth, users, requests, chat, reviews, notifications)
│   │   ├── components/         # AppHeader (Desktop navbar/Mobile header), BottomNav, NeighborCard, Modals
│   │   ├── context/            # AuthContext (BD Phone + OTP) & AppContext (Swaps, WebSockets, Reviews)
│   │   ├── data/               # Bangladesh 64 Districts, divisions, skill tags, mock data
│   │   ├── pages/              # Home, Requests, ChatThread, Profile, PublicProfile, Login, OTP, Onboarding
│   │   └── styles/             # tokens.css, design-system.css, index.css
│   ├── vercel.json             # Vercel SPA routing rewrites
│   ├── .env.production.example # Frontend production environment variables
│   └── package.json
├── backend/                    # FastAPI (Python 3.11+) + Motor (Async MongoDB)
│   ├── app/
│   │   ├── core/               # config.py, database.py, auth.py, seed.py
│   │   ├── models/             # Pydantic v2 schemas (user, request, chat, review, notification)
│   │   ├── routers/            # /auth, /users, /requests, /conversations, /reviews, /notifications
│   │   ├── services/           # chat_service.py (WebSocket manager), notification_service.py
│   │   └── main.py             # FastAPI entrypoint with CORS, error handlers, and lifespan
│   ├── tests/                  # Automated pytest test suites
│   ├── Dockerfile              # Production container build
│   ├── render.yaml             # Render free-tier deployment blueprint
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

### Core Technologies
- **Frontend**: React 19, Vite 6, React Router v7, Vanilla CSS with custom design tokens (Zero bulky UI frameworks).
- **Backend**: FastAPI, Pydantic v2, Motor (Async MongoDB client), Starlette WebSockets.
- **Database**: MongoDB (Local for dev; MongoDB Atlas M0 Free Tier for deployment).
- **Authentication**: Firebase Authentication (Phone number + 6-digit OTP verification via Firebase Admin SDK with zero-friction dev test fallback).
- **Design Tokens**: Bengali heritage palette — Deep Green (`#0B5E42`), Marigold (`#E8A33D`), Terracotta Clay (`#C4603F`), Ink (`#1C231F`), Paper (`#F3F6F0`), Kantha stitch dividers, and Fraunces + Manrope typography.
- **Privacy & Safety**: Phone numbers are strictly private and never exposed to other neighbors. Built-in daytime public meeting tips, neighbor blocking, and moderation reporting.

---

## ⚡ Quick Start Guide (Windows + VS Code)

### Prerequisites
1. **Node.js** (v18 or higher)
2. **Python** (v3.11 or higher)
3. **MongoDB** installed locally (or a free MongoDB Atlas connection string)

### 1. Run the Backend API
Open a PowerShell terminal in VS Code:

```powershell
cd backend

# Create and activate Python virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r requirements.txt

# Seed the database with 16 realistic Bangladeshi neighbors across all 8 divisions
python -m app.core.seed

# Start the FastAPI dev server with auto-reload
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

### 2. Run the Frontend Web Application
Open a second terminal in VS Code:

```powershell
cd frontend

# Install frontend dependencies
npm install

# Start Vite dev server
npm run dev
```
- **Frontend Application**: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Automated Testing

Run the automated backend test suites covering authentication, privacy enforcement, skill requests, state transitions, WebSockets, and ratings:

```powershell
cd backend
.\.venv\Scripts\pytest.exe -v
```

Output:
```text
tests/test_auth_and_users.py::test_health_check PASSED                   [ 16%]
tests/test_auth_and_users.py::test_auth_verify_and_onboarding PASSED     [ 33%]
tests/test_chat_and_websockets.py::test_chat_rest_and_conversations PASSED [ 50%]
tests/test_chat_and_websockets.py::test_chat_websocket_exchange PASSED   [ 66%]
tests/test_requests_and_notifications.py::test_requests_workflow_and_notifications PASSED [ 83%]
tests/test_reviews_and_safety.py::test_reviews_ratings_and_safety PASSED [100%]
======================== 6 passed in 0.98s =========================
```

Test the production frontend build:
```powershell
cd frontend
npm run build
```

---

## 🌐 100% Free-Tier Deployment Guide

### 1. Database: MongoDB Atlas (Free M0 Sandbox)
1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) (Free Tier, no credit card required).
2. Create a shared cluster (**M0 Sandbox**, 512 MB storage). Choose the **AWS / Singapore (ap-southeast-1)** or **AWS / Mumbai (ap-south-1)** region for lowest latency from Bangladesh.
3. In **Database Access**, create a user (e.g. `oporajito_admin`).
4. In **Network Access**, add `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect -> Drivers -> Python** to copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```

### 2. Backend: Render (Free Web Service)
1. Sign up at [render.com](https://render.com).
2. Click **New + -> Web Service** and link your Git repository (select the `backend` root directory).
3. Select **Python** runtime and the **Singapore** region.
4. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `ENVIRONMENT` = `production`
   - `MONGODB_URI` = *(Your MongoDB Atlas connection string)*
   - `MONGODB_DB_NAME` = `oporajito_db`
   - `ALLOW_DEV_TOKENS` = `true`
   - `CORS_ORIGINS` = `["*"]`
6. Click **Deploy Web Service**. Your live backend URL will be: `https://oporajito-api.onrender.com`.

### 3. Frontend: Vercel (Free Hobby Tier)
1. Sign up at [vercel.com](https://vercel.com).
2. Click **Add New Project** and import your Git repository.
3. Select `frontend` as the **Root Directory**.
4. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://oporajito-api.onrender.com/api/v1`
   - `VITE_WS_HOST` = `oporajito-api.onrender.com`
5. Click **Deploy**. Vercel will build and host your responsive web application with automatic SSL and CDN caching!

---

## 🔒 Neighbor Safety & Privacy Guarantee

1. **Strict Phone Number Secrecy**: Phone numbers are stored securely in MongoDB and verified via Firebase ID tokens. No public API, search endpoint, or profile ever exposes a neighbor's phone number or Firebase UID.
2. **In-App Encrypted Chat**: Neighbors coordinate exclusively through in-app WebSocket chats and notifications until they feel comfortable meeting in public.
3. **Public Daytime Meetups**: Safety reminders prompt users to conduct skill exchanges in public daytime neighborhood spots (e.g., local university campuses, community centers, cafes, or public libraries).
4. **Community Moderation**: Immediate one-click **Block** and **Report** buttons on every profile empower neighbors to keep the community safe and trustworthy.
