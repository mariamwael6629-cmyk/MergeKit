# MergeKit

Open-source contribution tracker for developers. Track PRs, discover repos, and compete on leaderboards.

## Project Structure

```
.
├── frontend/          # Vanilla JS SPA
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js     # API client + JWT management
│       └── app.js     # Tab logic, render functions
└── backend/           # FastAPI Python backend
    ├── requirements.txt
    ├── .env.example
    └── app/
        ├── main.py
        ├── core/      # config, security, deps
        ├── db/        # database, seed
        ├── models/    # SQLAlchemy models
        ├── schemas/   # Pydantic schemas
        ├── services/  # business logic
        └── api/       # route handlers
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API runs at `http://localhost:8000`  
Docs: `http://localhost:8000/api/docs`

### Frontend

Open `frontend/index.html` in a browser, or use any static server:

```bash
cd frontend
python -m http.server 5500
```

Visit `http://localhost:5500`

## Demo Credentials

| Email | Password |
|-------|----------|
| demo@mergekit.dev | demo1234 |

The frontend auto-logs in as the demo user on page load.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/token` | Login (OAuth2 form) |
| POST | `/api/auth/register` | Register |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/dashboard` | Dashboard data |
| GET  | `/api/pull-requests` | List PRs (filters: tag, status) |
| GET  | `/api/repositories` | Discover repos |
| GET  | `/api/community/leaderboard` | Leaderboard |
| GET  | `/api/community/feed` | Activity feed |
| GET  | `/api/analytics` | Analytics data |
