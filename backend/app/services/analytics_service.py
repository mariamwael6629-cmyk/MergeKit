from collections import OrderedDict
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.pull_request import PullRequest
from app.models.user import User
from app.schemas.analytics import AnalyticsOut, OutcomeBreakdown, SeriesData

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
ORG_MAP = {
    "vercel": "Vercel", "facebook": "Meta", "google": "Google", "huggingface": "Hugging Face",
    "langchain-ai": "LangChain", "prisma": "Prisma", "recharts": "Recharts", "shadcn-ui": "shadcn",
    "tailwindlabs": "Tailwind Labs", "supabase": "Supabase", "trpc": "tRPC", "biomejs": "Biome",
}


def build_analytics(db: Session, user: User) -> AnalyticsOut:
    prs = db.query(PullRequest).filter(PullRequest.user_id == user.id).order_by(PullRequest.created_at).all()

    total = len(prs)
    merged = sum(1 for p in prs if p.status == "merged")
    open_ = sum(1 for p in prs if p.status == "open")
    closed = sum(1 for p in prs if p.status == "closed")
    merge_rate = round((merged / total) * 100) if total else 0

    lines_contributed = sum(p.additions + p.deletions for p in prs)
    month_start = date.today().replace(day=1)
    lines_this_month = sum(p.additions + p.deletions for p in prs if p.created_at.date() >= month_start)

    orgs = {p.repo.split("/")[0] for p in prs}
    orgs_sample = [ORG_MAP.get(o, o.capitalize()) for o in list(orgs)[:3]]

    # monthly volume over the last 12 months
    today = date.today()
    buckets: "OrderedDict[str, int]" = OrderedDict()
    for i in range(11, -1, -1):
        month_index = (today.month - 1 - i) % 12
        buckets[MONTHS[month_index]] = 0
    for p in prs:
        label = MONTHS[p.created_at.month - 1]
        if label in buckets:
            buckets[label] += 1
    monthly_volume = SeriesData(labels=list(buckets.keys()), data=list(buckets.values()))

    outcome = OutcomeBreakdown(
        merged=round((merged / total) * 100) if total else 0,
        open=round((open_ / total) * 100) if total else 0,
        closed=round((closed / total) * 100) if total else 0,
    )

    growth_buckets: "OrderedDict[str, int]" = OrderedDict((m, 0) for m in buckets.keys())
    running = 0
    month_order = list(buckets.keys())
    counts_by_month = {m: 0 for m in month_order}
    for p in prs:
        label = MONTHS[p.created_at.month - 1]
        if label in counts_by_month:
            counts_by_month[label] += 1
    for m in month_order:
        running += counts_by_month[m]
        growth_buckets[m] = running
    growth = SeriesData(labels=list(growth_buckets.keys()), data=list(growth_buckets.values()))

    return AnalyticsOut(
        merge_success_rate=merge_rate,
        merge_success_delta=4,
        avg_review_time_days=2.4,
        avg_review_time_delta=-0.8,
        lines_contributed=lines_contributed,
        lines_contributed_delta=lines_this_month,
        orgs_count=len(orgs),
        orgs_sample=orgs_sample or ["—"],
        monthly_volume=monthly_volume,
        outcome_breakdown=outcome,
        growth=growth,
    )
