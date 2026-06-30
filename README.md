# 🚀 MergeKit

MergeKit is a high-performance, full-stack open-source contribution tracking and analytics platform. It seamlessly aggregates a developer's pull requests across multiple repositories into a visual, data-driven portfolio—complete with advanced analytics, gamified community leaderboards, and an intelligent discovery engine.

---

## ✨ Key Features

### 📊 1. Analytics & Impact Dashboard
* **Dynamic Insights:** Tracks total contributions, merged/open PRs, active repositories, and real-time contribution streaks.
* **Contribution Heatmap:** An interactive, GitHub-style calendar grid visualizing annual contribution frequency.
* **Advanced Metrics:** Monitors merge success rates, average code review turnaround times, total lines added/deleted, and organizational reach.
* **Impact Scoring:** Evaluates PR quality, review velocity, documentation coverage, and merge rates.

### 💼 2. Interactive Pull Request Portfolio
* **Granular Filtering:** Easily filter contributions by status (`Merged`, `Open`, `Closed`), programming language, or custom tags.
* **Detailed PR Cards:** Displays code-line deltas (`+` / `-`), auto-generated impact badges (e.g., `High Impact`, `Performance Win`), and real-time status notes.

### 🤖 3. Intelligent Discovery Engine
* **Personalized Repository Matcher:** Smart recommendations tailored to the developer's unique tech stack, ranked by a calculated match score.
* **Targeted Tag Filters:** Instantly find issues labeled `good first issue`, `help wanted`, `hacktoberfest`, `frontend`, `backend`, or `AI/ML`.

### 🏆 4. Community Feed & Gamification
* **Weekly Leaderboards:** Ranks global users based on community score metrics and total contribution volume.
* **Weekly Challenges:** Point-based milestone tracking to keep developers engaged and motivated.
* **Live Activity Stream:** A real-time, global feed showing active community PR submissions and merges.

---

## 🛠️ Project Structure


```

.
├── frontend/           # Ultra-fast, zero-build Static SPA
│   ├── index.html
│   ├── css/style.css
│   └── js/{api.js, app.js}
└── backend/            # High-performance FastAPI REST API
├── app/
│   ├── api/routes/   # Auth, dashboard, pull_requests, repositories, community, analytics
│   ├── core/         # Configuration, JWT security, and dependencies
│   ├── db/           # SQLAlchemy engine initialization & seed scripts
│   ├── models/       # SQLAlchemy ORM database models
│   ├── schemas/      # Pydantic v2 request/response schemas
│   └── services/     # Isolated domain business logic
└── requirements.txt

```

> 💡 **Note:** For deep-dive instructions regarding backend environment variables, configuration, and API endpoint documentation, please review `backend/README.md`.

---

## 🔧 Tech Stack

* **Frontend:** Vanilla JavaScript (ES6+), Chart.js (Data Visualization), Tabler Icons — *Zero build steps, ultra-fast loading times*.
* **Backend:** FastAPI, SQLAlchemy 2.0 (ORM), Pydantic v2 (Data Validation), JWT Authentication (`python-jose`), and `bcrypt` password hashing.
* **Database:** SQLite by default for rapid local setup (Fully configurable via `DATABASE_URL`).

---

## 🏃 Local Setup & Installation

Follow these quick steps to get a local instance of MergeKit up and running:

### 1. Spin up the Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies & set up environment
pip install -r requirements.txt
cp .env.example .env

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000

```

### 2. Launch the Frontend (Separate Terminal)

```bash
cd frontend

# Start a simple lightweight local server
python -m http.server 5500

```

Once both services are running, open your browser and navigate to: **`http://localhost:5500`**.

---

## 🔑 Demo Account Access

On its initial run, the backend automatically seeds a local SQLite database with a pre-configured developer profile to let you explore the dashboard instantly:

* **Email:** `demo@mergekit.dev`
* **Password:** `demo1234`
```