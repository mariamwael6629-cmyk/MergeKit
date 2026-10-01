# MergeKit API

FastAPI backend for MergeKit — the open-source contribution tracking and analytics platform.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # adjust values if needed
uvicorn app.main:app --reload --port 8000
```

On first start the app creates the SQLite database and seeds it with a demo
user (`demo@mergekit.dev` / `demo1234`) plus sample repositories, pull
requests, leaderboard users, challenges, and feed items so the frontend has
data to render immediately.

## Docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

## Project layout

```
backend/
  app/
    main.py              FastAPI app, CORS, error handlers, startup seeding
    core/                settings, JWT/password helpers, auth dependency
    db/                  SQLAlchemy engine/session, seed script
    models/               SQLAlchemy ORM models
    schemas/              Pydantic request/response models
    services/             business logic, queried by routes
    api/routes/            FastAPI routers (auth, dashboard, pull-requests,
                            repositories, community, analytics)
  requirements.txt
  .env.example
```

## Auth

JWT bearer tokens via `POST /api/auth/login` (OAuth2 password flow) or
`POST /api/auth/register` for new accounts. Send the token as
`Authorization: Bearer <token>` on subsequent requests.

## API summary

| Method | Path                          | Description                          |
|--------|-------------------------------|---------------------------------------|
| POST   | /api/auth/register            | Create a new account                  |
| POST   | /api/auth/login                | Get a JWT access token               |
| GET    | /api/auth/me                   | Current user profile                 |
| POST   | /api/auth/connect-github       | Link a GitHub username (stub)        |
| GET    | /api/dashboard                 | Stats, heatmap, streak, activity     |
| GET    | /api/pull-requests              | List the current user's PRs          |
| POST   | /api/pull-requests              | Create a PR record                   |
| GET    | /api/pull-requests/{id}         | PR detail                            |
| GET    | /api/repositories                | Discovery feed of recommended repos |
| GET    | /api/community/leaderboard       | Weekly leaderboard                  |
| GET    | /api/community/challenges        | Active challenges                   |
| GET    | /api/community/feed              | Community activity feed             |
| GET    | /api/analytics                   | Aggregated analytics for charts     |
