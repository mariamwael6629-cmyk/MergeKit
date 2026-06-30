import random
from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.challenge import Challenge
from app.models.contribution_day import ContributionDay
from app.models.feed_item import FeedItem
from app.models.pull_request import PullRequest
from app.models.repository import Repository
from app.models.user import User

RNG_SEED = 42

LANGS = ["TypeScript", "Python", "Go", "Rust"]
LANG_WEIGHTS = [41, 28, 18, 13]
TAGS = ["beginner", "intermediate", "advanced", "frontend", "backend", "ai_ml"]
REPO_POOL = [
    "vercel/ai", "facebook/react", "langchain-ai/langchain", "recharts/recharts",
    "shadcn-ui/ui", "prisma/prisma", "tailwindlabs/tailwindcss", "supabase/supabase",
    "trpc/trpc", "biomejs/biome",
]
STATUS_WEIGHTS = [("merged", 67), ("open", 4), ("closed", 29)]

CURATED_PRS = [
    dict(
        repo="vercel/ai", title="feat: add streaming support for OpenAI chat completions",
        description="Implemented real-time streaming using ReadableStream API, enabling token-by-token delivery. Reduced perceived latency by 60% in user testing.",
        status="merged", language="TypeScript", additions=284, deletions=12,
        impact_tag="High impact", tag="frontend", hours_ago=2,
    ),
    dict(
        repo="facebook/react", title="fix: hydration mismatch when using useFormState with server actions",
        description="Tracked down a subtle timing issue in concurrent mode where form state diverged between server and client renders.",
        status="open", language="TypeScript", additions=47, deletions=8,
        impact_tag="In review", tag="advanced", hours_ago=24, awaiting_review=True,
    ),
    dict(
        repo="langchain-ai/langchain", title="docs: add comprehensive vector store integration examples",
        description="Added 12 runnable examples covering Pinecone, Weaviate, and pgvector integrations with RAG pipelines.",
        status="merged", language="Python", additions=192, deletions=3,
        impact_tag="2.4k views", tag="ai_ml", hours_ago=72,
    ),
    dict(
        repo="shadcn-ui/ui", title="chore: migrate to pnpm",
        description="Duplicate of #1823",
        status="closed", language="TypeScript", additions=0, deletions=0,
        impact_tag="Duplicate of #1823", tag="frontend", hours_ago=120,
    ),
    dict(
        repo="recharts/recharts", title="perf: lazy-load chart components with dynamic imports",
        description="Reduced initial bundle size by 34% by converting synchronous chart imports to dynamic chunks loaded on demand.",
        status="merged", language="TypeScript", additions=91, deletions=67,
        impact_tag="Perf win", tag="frontend", hours_ago=144,
    ),
    dict(
        repo="shadcn-ui/ui", title="feat: add Combobox component with multi-select support",
        description="New headless combobox primitive with keyboard navigation, ARIA attributes, and multi-select variant for complex filter UIs.",
        status="merged", language="TypeScript", additions=318, deletions=0,
        impact_tag="Featured", tag="frontend", hours_ago=200,
    ),
    dict(
        repo="prisma/prisma", title="feat: add native JSON path filtering for PostgreSQL jsonb columns",
        description="Extends Prisma query engine to support PostgreSQL's native jsonb path operators for complex nested queries.",
        status="open", language="Rust", additions=156, deletions=22,
        impact_tag="In review", tag="backend", hours_ago=48, awaiting_review=True,
    ),
]

MONTHLY_TARGETS = [6, 8, 10, 9, 12, 11, 14, 13, 16, 15, 18, 17]

REPOSITORIES = [
    dict(
        full_name="huggingface/transformers", icon="ti-robot", stars=128000, match_pct=98, language="Python",
        description="State-of-the-art ML models. Looking for help with documentation on new model architectures and adding Python type hints to inference pipelines.",
        tags="good first issue,help wanted,Python,AI / ML",
    ),
    dict(
        full_name="vercel/next.js", icon="ti-brand-nextjs", stars=122000, match_pct=95, language="TypeScript",
        description="The React framework. Active issues around App Router edge cases, TypeScript generics for server actions, and performance profiling tooling.",
        tags="help wanted,TypeScript,Frontend",
    ),
    dict(
        full_name="langchain-ai/langgraph", icon="ti-topology-star", stars=8400, match_pct=91, language="TypeScript",
        description="Graph-based LLM orchestration. Needs TypeScript port of new node types, streaming examples, and integration tests for multi-agent patterns.",
        tags="good first issue,hacktoberfest,TypeScript,AI / ML",
    ),
    dict(
        full_name="drizzle-team/drizzle-orm", icon="ti-database", stars=23000, match_pct=88, language="TypeScript",
        description="TypeScript ORM with SQL-like syntax. Looking for contributors to improve D1 and Turso adapter, and extend the query builder type inference.",
        tags="good first issue,TypeScript,Backend",
    ),
]

LEADERBOARD_USERS = [
    dict(full_name="Sarah Akhtar", username="sarah_akhtar", email="sarah@example.com", initials="SA", score=12840, contributions=42),
    dict(full_name="Marcus Rivera", username="marcus_rivera", email="marcus@example.com", initials="MR", score=11210, contributions=38),
    dict(full_name="Liu Ting", username="liu_ting", email="liu@example.com", initials="LT", score=8760, contributions=31),
    dict(full_name="Jenna Park", username="jenna_park", email="jenna@example.com", initials="JP", score=8130, contributions=29),
]

FEED_TEMPLATE = [
    dict(actor="Marcus Rivera", action="merged", repo="tailwindlabs/tailwindcss",
         pr_title="feat: add new CSS variable-based theming system", meta="+412 lines", minutes_ago=14),
    dict(actor="Sarah Akhtar", action="opened", repo="supabase/supabase",
         pr_title="fix: realtime subscription leak on unmount", meta="TypeScript", minutes_ago=38),
    dict(actor="__demo__", action="merged", repo="vercel/ai",
         pr_title="feat: add streaming support for OpenAI", meta="+284 lines · High impact", minutes_ago=120),
    dict(actor="Liu Ting", action="merged", repo="trpc/trpc",
         pr_title="docs: add subscriptions guide with examples", meta="+280 lines", minutes_ago=180),
    dict(actor="Jenna Park", action="opened", repo="biomejs/biome",
         pr_title="feat: add CSS formatting support", meta="Rust · Advanced", minutes_ago=300),
]


def _weighted_choice(rng: random.Random, options_with_weights):
    options = [o for o, _ in options_with_weights]
    weights = [w for _, w in options_with_weights]
    return rng.choices(options, weights=weights, k=1)[0]


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return  # already seeded

    rng = random.Random(RNG_SEED)
    now = datetime.now(timezone.utc)

    demo = User(
        email=settings.demo_user_email,
        username="demo_user",
        full_name="Amir Khalil",
        initials="AK",
        hashed_password=hash_password(settings.demo_user_password),
        streak_days=14,
        community_score=9240,
        pr_quality_pct=92,
        review_speed_pct=78,
        doc_coverage_pct=85,
    )
    db.add(demo)
    db.flush()

    other_users = {}
    for u in LEADERBOARD_USERS:
        user = User(
            email=u["email"], username=u["username"], full_name=u["full_name"], initials=u["initials"],
            hashed_password=hash_password("changeme123"), streak_days=rng.randint(3, 20),
            community_score=u["score"], pr_quality_pct=rng.randint(70, 95),
            review_speed_pct=rng.randint(60, 95), doc_coverage_pct=rng.randint(60, 95),
            contributions_count=u["contributions"],
        )
        db.add(user)
        other_users[u["full_name"]] = user
    db.flush()

    for r in REPOSITORIES:
        db.add(Repository(**r))

    # curated, recent PRs for the demo user
    for pr in CURATED_PRS:
        hours_ago = pr.pop("hours_ago")
        awaiting = pr.pop("awaiting_review", False)
        db.add(PullRequest(
            user_id=demo.id, created_at=now - timedelta(hours=hours_ago),
            awaiting_review=awaiting, **pr,
        ))

    # synthetic historical PRs to populate monthly/analytics charts
    today = date.today()
    for i, target_count in enumerate(MONTHLY_TARGETS):
        months_back = 11 - i
        month_date = (today.replace(day=1) - timedelta(days=months_back * 30))
        for _ in range(target_count):
            day_offset = rng.randint(0, 27)
            created = datetime(month_date.year, month_date.month, 1, tzinfo=timezone.utc) + timedelta(days=day_offset, hours=rng.randint(0, 23))
            status = _weighted_choice(rng, STATUS_WEIGHTS)
            language = _weighted_choice(rng, list(zip(LANGS, LANG_WEIGHTS)))
            tag = rng.choice(TAGS)
            repo = rng.choice(REPO_POOL)
            additions = rng.randint(10, 350)
            deletions = rng.randint(0, 120)
            impact_tag = {
                "merged": rng.choice(["High impact", "Perf win", "Featured", "Good catch"]),
                "open": "In review",
                "closed": "Closed",
            }[status]
            db.add(PullRequest(
                user_id=demo.id, repo=repo, title=f"chore: routine update in {repo.split('/')[1]}",
                description="Routine contribution generated for analytics history.",
                status=status, language=language, additions=additions, deletions=deletions,
                impact_tag=impact_tag, tag=tag, awaiting_review=(status == "open" and rng.random() < 0.5),
                created_at=created,
            ))

    # contribution heatmap: 365 days, last 14 always active to match the streak
    for offset in range(365, -1, -1):
        day = today - timedelta(days=offset)
        if offset <= 13:
            count = rng.randint(2, 9)
        else:
            roll = rng.random()
            count = 0 if roll < 0.35 else rng.randint(1, 8)
        level = 0 if count == 0 else min(4, 1 + count // 3)
        db.add(ContributionDay(user_id=demo.id, day=day, count=count, level=level))

    db.add_all([
        Challenge(user_id=demo.id, title="Ship 3 merged PRs this week",
                  description="Merge at least 3 pull requests to any open-source repository before Sunday midnight UTC.",
                  points=500, progress=2, target=3, days_left=3),
        Challenge(user_id=demo.id, title="Review 5 community PRs",
                  description="Leave meaningful code reviews on at least 5 pull requests from other contributors.",
                  points=250, progress=1, target=5, days_left=3),
    ])

    for item in FEED_TEMPLATE:
        actor = demo if item["actor"] == "__demo__" else other_users[item["actor"]]
        db.add(FeedItem(
            actor_id=actor.id, action=item["action"], repo=item["repo"], pr_title=item["pr_title"],
            meta=item["meta"], created_at=now - timedelta(minutes=item["minutes_ago"]),
        ))

    db.commit()
