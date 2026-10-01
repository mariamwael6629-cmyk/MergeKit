from sqlalchemy.orm import Session
from app.models.user import User
from app.models.pull_request import PullRequest
from app.models.contribution_day import ContributionDay
from app.models.challenge import Challenge
from app.schemas.dashboard import DashboardResponse, HeatmapDay, ChallengeOut
from datetime import date, timedelta


def get_dashboard(user: User, db: Session) -> DashboardResponse:
    prs = db.query(PullRequest).filter(PullRequest.user_id == user.id).all()
    merged = [p for p in prs if p.status == "merged"]
    open_prs = [p for p in prs if p.status == "open"]

    today = date.today()
    start = today - timedelta(days=364)
    days = (
        db.query(ContributionDay)
        .filter(ContributionDay.user_id == user.id, ContributionDay.day >= start)
        .all()
    )
    heatmap = [HeatmapDay(date=str(d.day), count=d.count) for d in days]

    challenges = db.query(Challenge).filter(Challenge.user_id == user.id).all()

    return DashboardResponse(
        total_contributions=user.contributions_count or len(prs),
        merged_prs=len(merged),
        open_prs=len(open_prs),
        score=user.score,
        streak=user.streak,
        heatmap=heatmap,
        challenges=[ChallengeOut.model_validate(c) for c in challenges],
    )
