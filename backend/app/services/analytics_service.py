from sqlalchemy.orm import Session
from app.models.pull_request import PullRequest
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse, MonthlyPoint, TagBreakdown
from collections import defaultdict


def get_analytics(user: User, db: Session) -> AnalyticsResponse:
    prs = db.query(PullRequest).filter(PullRequest.user_id == user.id).all()

    monthly: dict[str, int] = defaultdict(int)
    tags: dict[str, int] = defaultdict(int)
    total_add = 0
    total_del = 0
    merged = 0

    for p in prs:
        key = p.created_at.strftime("%Y-%m")
        monthly[key] += 1
        if p.tag:
            tags[p.tag] += 1
        total_add += p.additions
        total_del += p.deletions
        if p.status == "merged":
            merged += 1

    sorted_months = sorted(monthly.items())[-12:]
    merge_rate = round(merged / len(prs) * 100, 1) if prs else 0.0

    return AnalyticsResponse(
        monthly_contributions=[MonthlyPoint(month=m, count=c) for m, c in sorted_months],
        tag_breakdown=[TagBreakdown(tag=t, count=c) for t, c in sorted(tags.items(), key=lambda x: -x[1])],
        total_additions=total_add,
        total_deletions=total_del,
        merge_rate=merge_rate,
    )
