from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.challenge import Challenge
from app.models.feed_item import FeedItem
from app.models.pull_request import PullRequest
from app.models.user import User
from app.schemas.community import ChallengeOut, FeedItemOut, LeaderboardEntryOut


def get_leaderboard(db: Session, current_user: User, limit: int = 10) -> list[LeaderboardEntryOut]:
    users = db.query(User).order_by(User.community_score.desc()).limit(limit).all()
    merged_counts = dict(
        db.query(PullRequest.user_id, func.count(PullRequest.id))
        .filter(PullRequest.status == "merged")
        .group_by(PullRequest.user_id)
        .all()
    )
    entries = []
    for idx, u in enumerate(users, start=1):
        entries.append(LeaderboardEntryOut(
            rank=idx,
            name=u.full_name,
            initials=u.initials,
            contributions=merged_counts.get(u.id) or u.contributions_count,
            score=u.community_score,
            is_current_user=(u.id == current_user.id),
        ))
    return entries


def get_challenges(db: Session, user: User) -> list[ChallengeOut]:
    challenges = db.query(Challenge).filter(Challenge.user_id == user.id).all()
    return [ChallengeOut.model_validate(c) for c in challenges]


def _time_ago(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    seconds = (now - dt).total_seconds()
    if seconds < 3600:
        return f"{max(1, int(seconds // 60))} minutes ago"
    if seconds < 86400:
        return f"{int(seconds // 3600)} hours ago"
    return f"{int(seconds // 86400)} days ago"


def get_feed(db: Session, limit: int = 10) -> list[FeedItemOut]:
    items = db.query(FeedItem).order_by(FeedItem.created_at.desc()).limit(limit).all()
    out = []
    for item in items:
        out.append(FeedItemOut(
            id=item.id,
            actor_name=item.actor.full_name,
            actor_initials=item.actor.initials,
            action=item.action,
            repo=item.repo,
            pr_title=item.pr_title,
            meta=item.meta,
            time_ago=_time_ago(item.created_at),
        ))
    return out
