import random
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.repository import Repository
from app.models.pull_request import PullRequest
from app.models.contribution_day import ContributionDay
from app.models.challenge import Challenge
from app.models.feed_item import FeedItem
from app.core.security import hash_password

LEADERBOARD_USERS = [
    {"name": "Sarah Chen",   "username": "schen",  "email": "sarah@example.com",  "contributions": 42, "score": 12840},
    {"name": "Marcus Lee",   "username": "mlee",   "email": "marcus@example.com", "contributions": 38, "score": 11210},
    {"name": "Liu Wei",      "username": "lwei",   "email": "liu@example.com",    "contributions": 31, "score": 8760},
    {"name": "Jenna Park",   "username": "jpark",  "email": "jenna@example.com",  "contributions": 29, "score": 8130},
]

CURATED_PRS = [
    {"repo": "rust-lang/rust",       "title": "Fix borrow-checker diagnostic for nested closures",         "status": "merged", "tag": "backend",  "additions": 142, "deletions": 38},
    {"repo": "vercel/next.js",       "title": "Add streaming SSR support for App Router layouts",          "status": "open",   "tag": "frontend", "additions": 210, "deletions": 45, "awaiting_review": True},
    {"repo": "python/cpython",       "title": "Improve error messages for f-string syntax errors",         "status": "open",   "tag": "backend",  "additions": 67,  "deletions": 12, "awaiting_review": True},
    {"repo": "denoland/deno",        "title": "Implement Web Crypto API ed25519 key generation",           "status": "merged", "tag": "backend",  "additions": 87,  "deletions": 12},
    {"repo": "microsoft/TypeScript", "title": "Narrowing refinement for generic conditional types",        "status": "open",   "tag": "frontend", "additions": 178, "deletions": 56, "awaiting_review": True},
    {"repo": "golang/go",            "title": "runtime: improve goroutine scheduler fairness",             "status": "merged", "tag": "backend",  "additions": 95,  "deletions": 23},
    {"repo": "sveltejs/svelte",      "title": "Add reactive store subscriptions in SSR context",           "status": "merged", "tag": "frontend", "additions": 134, "deletions": 29},
]

TAGS = ["frontend", "backend", "docs", "testing", "devops", "security", "performance"]

REPOS = [
    {
        "full_name": "rust-lang/rust", "description": "Empowering everyone to build reliable and efficient software.",
        "language": "Rust", "stars": 94200, "forks": 12100, "open_issues": 9100,
        "has_good_first_issue": True, "difficulty": "hard", "topics": "systems,compiler,memory-safety",
    },
    {
        "full_name": "vercel/next.js", "description": "The React Framework for the Web.",
        "language": "TypeScript", "stars": 121000, "forks": 25800, "open_issues": 2300,
        "has_good_first_issue": True, "difficulty": "medium", "topics": "react,ssr,web,framework",
    },
    {
        "full_name": "python/cpython", "description": "The Python programming language.",
        "language": "Python", "stars": 62400, "forks": 29900, "open_issues": 8700,
        "has_good_first_issue": True, "difficulty": "medium", "topics": "python,interpreter,stdlib",
    },
    {
        "full_name": "microsoft/vscode", "description": "Visual Studio Code - Open Source.",
        "language": "TypeScript", "stars": 162000, "forks": 28400, "open_issues": 5600,
        "has_good_first_issue": False, "difficulty": "hard", "topics": "editor,ide,electron",
    },
]


def seed(db: Session):
    if db.query(User).first():
        return

    rng = random.Random(42)
    today = date.today()

    # Demo user
    demo = User(
        name="Amir Khalil",
        email="demo@mergekit.dev",
        username="amir_k",
        hashed_password=hash_password("demo1234"),
        bio="Open source enthusiast & systems programmer.",
        streak=14,
        score=9240,
        contributions_count=247,
    )
    db.add(demo)
    db.flush()

    # Leaderboard users
    for u in LEADERBOARD_USERS:
        db.add(User(
            name=u["name"], email=u["email"], username=u["username"],
            hashed_password=hash_password("password123"),
            streak=rng.randint(3, 30),
            score=u["score"],
            contributions_count=u["contributions"],
        ))

    # Repositories
    for r in REPOS:
        db.add(Repository(owner_id=demo.id, **r))

    # Curated PRs
    for i, pr in enumerate(CURATED_PRS):
        days_ago = i * 2
        created = datetime.utcnow() - timedelta(days=days_ago, hours=rng.randint(1, 12))
        merged_at = created + timedelta(hours=rng.randint(2, 48)) if pr["status"] == "merged" else None
        db.add(PullRequest(
            user_id=demo.id,
            repo=pr["repo"],
            title=pr["title"],
            status=pr["status"],
            tag=pr["tag"],
            additions=pr["additions"],
            deletions=pr["deletions"],
            awaiting_review=pr.get("awaiting_review", False),
            created_at=created,
            merged_at=merged_at,
        ))

    # Synthetic historical PRs (~150 total for analytics)
    repos_short = [r["full_name"] for r in REPOS]
    for i in range(149):
        days_ago = rng.randint(1, 365)
        status = rng.choice(["merged", "merged", "merged", "open", "closed"])
        created = datetime.utcnow() - timedelta(days=days_ago, hours=rng.randint(0, 23))
        merged_at = created + timedelta(hours=rng.randint(1, 72)) if status == "merged" else None
        db.add(PullRequest(
            user_id=demo.id,
            repo=rng.choice(repos_short),
            title=f"Synthetic contribution #{i+1}",
            status=status,
            tag=rng.choice(TAGS),
            additions=rng.randint(5, 400),
            deletions=rng.randint(0, 200),
            awaiting_review=(status == "open" and rng.random() < 0.4),
            created_at=created,
            merged_at=merged_at,
        ))

    # 365-day heatmap
    for offset in range(365):
        d = today - timedelta(days=offset)
        count = 0
        r = rng.random()
        if r < 0.35:
            count = 0
        elif r < 0.60:
            count = rng.randint(1, 2)
        elif r < 0.80:
            count = rng.randint(2, 4)
        elif r < 0.92:
            count = rng.randint(4, 7)
        else:
            count = rng.randint(7, 14)
        if count > 0:
            db.add(ContributionDay(user_id=demo.id, day=d, count=count))

    # Challenges
    db.add(Challenge(user_id=demo.id, title="Merge 5 PRs this week", difficulty="hard",   points=500, current=3, target=5))
    db.add(Challenge(user_id=demo.id, title="Review 3 community PRs", difficulty="medium", points=250, current=1, target=3))

    # Feed items
    feed_data = [
        {"actor": "Sarah Chen",   "action": "merged your PR in",   "repo": "rust-lang/rust",       "item_type": "pr"},
        {"actor": "Marcus Lee",   "action": "reviewed your PR in", "repo": "vercel/next.js",       "item_type": "review"},
        {"actor": "Liu Wei",      "action": "starred",             "repo": "python/cpython",       "item_type": "star"},
        {"actor": "Jenna Park",   "action": "opened an issue in",  "repo": "microsoft/vscode",     "item_type": "issue"},
        {"actor": "Marcus Lee",   "action": "commented on your PR in", "repo": "denoland/deno",   "item_type": "comment"},
    ]
    for i, f in enumerate(feed_data):
        db.add(FeedItem(
            user_id=demo.id,
            actor=f["actor"],
            action=f["action"],
            repo=f["repo"],
            item_type=f["item_type"],
            created_at=datetime.utcnow() - timedelta(hours=i * 3 + 1),
        ))

    db.commit()
