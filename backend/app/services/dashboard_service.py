from collections import Counter
from datetime import date, datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.contribution_day import ContributionDay
from app.models.pull_request import PullRequest
from app.models.repository import Repository
from app.models.user import User
from app.schemas.dashboard import (
    ActivityItem,
    DashboardOut,
    DashboardSummary,
    HeatmapDay,
    ImpactMetric,
    ImpactSummary,
    LanguageShare,
    StreakDay,
    StreakInfo,
)

LANG_COLORS = {
    "TypeScript": "#3178c6",
    "Python": "#3572a5",
    "Go": "#00add8",
    "Rust": "#dea584",
    "JavaScript": "#f1e05a",
}


def _time_ago(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = now - dt
    seconds = diff.total_seconds()
    if seconds < 3600:
        return f"{max(1, int(seconds // 60))}m ago"
    if seconds < 86400:
        return f"{int(seconds // 3600)}h ago"
    return f"{int(seconds // 86400)}d ago"


def build_dashboard(db: Session, user: User) -> DashboardOut:
    today = date.today()
    month_start = today.replace(day=1)

    all_prs = db.query(PullRequest).filter(PullRequest.user_id == user.id).all()
    merged = [p for p in all_prs if p.status == "merged"]
    open_prs = [p for p in all_prs if p.status == "open"]

    merged_this_month = [p for p in merged if p.created_at.date() >= month_start]
    open_awaiting = [p for p in open_prs if p.awaiting_review]

    repos_count = db.query(Repository).count()
    distinct_repos = {p.repo for p in all_prs}
    repos_this_month = {p.repo for p in all_prs if p.created_at.date() >= month_start}

    contrib_days = db.query(ContributionDay).filter(ContributionDay.user_id == user.id).order_by(ContributionDay.day).all()
    total_contributions = sum(c.count for c in contrib_days)
    total_this_month = sum(c.count for c in contrib_days if c.day >= month_start)

    summary = DashboardSummary(
        initials=user.initials,
        repos_count=repos_count,
        total_contributions=total_contributions,
        total_contributions_delta=total_this_month,
        merged_prs=len(merged),
        merged_prs_delta=len(merged_this_month),
        open_prs=len(open_prs),
        open_prs_awaiting_review=len(open_awaiting),
        repos_contributed=len(distinct_repos),
        repos_contributed_delta=len(repos_this_month),
        streak_days=user.streak_days,
        community_score=user.community_score,
        community_percentile="Top 3%",
    )

    merge_rate = round((len(merged) / len(all_prs)) * 100) if all_prs else 0
    impact = ImpactSummary(
        score_pct=round((user.pr_quality_pct + user.review_speed_pct + user.doc_coverage_pct + merge_rate) / 4),
        metrics=[
            ImpactMetric(name="PR quality", pct=user.pr_quality_pct),
            ImpactMetric(name="Review speed", pct=user.review_speed_pct),
            ImpactMetric(name="Doc coverage", pct=user.doc_coverage_pct),
            ImpactMetric(name="Merge rate", pct=merge_rate),
        ],
    )

    # languages: prefer last 30 days, fall back to all-time
    recent_cutoff = today - timedelta(days=30)
    recent_prs = [p for p in all_prs if p.created_at.date() >= recent_cutoff] or all_prs
    lang_counts = Counter(p.language for p in recent_prs)
    total_lang = sum(lang_counts.values()) or 1
    languages = [
        LanguageShare(name=lang, pct=round((count / total_lang) * 100), color=LANG_COLORS.get(lang, "#8a8580"))
        for lang, count in lang_counts.most_common()
    ]

    heatmap = [
        HeatmapDay(date=c.day.isoformat(), level=c.level, count=c.count)
        for c in contrib_days
    ]

    last_28 = contrib_days[-28:] if len(contrib_days) >= 28 else contrib_days
    streak_history = [StreakDay(active=c.count > 0, is_today=(c.day == today)) for c in last_28]

    streak = StreakInfo(days=user.streak_days, history=streak_history)

    recent = (
        db.query(PullRequest)
        .filter(PullRequest.user_id == user.id)
        .order_by(PullRequest.created_at.desc())
        .limit(5)
        .all()
    )
    activity = []
    for pr in recent:
        if pr.status == "merged":
            atype = "merged"
            meta = f"+{pr.additions} / −{pr.deletions} lines · {pr.language}"
        elif pr.status == "open":
            atype = "opened"
            meta = f"+{pr.additions} / −{pr.deletions} lines · {pr.language}"
        else:
            atype = "closed"
            meta = pr.impact_tag or "Closed"
        activity.append(ActivityItem(
            id=pr.id, type=atype, title=pr.title, repo=pr.repo, meta=meta, time_ago=_time_ago(pr.created_at)
        ))

    return DashboardOut(
        summary=summary,
        impact=impact,
        languages=languages,
        heatmap=heatmap,
        streak=streak,
        recent_activity=activity,
    )
