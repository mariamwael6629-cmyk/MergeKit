from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.pull_request import PullRequest
from app.models.feed_item import FeedItem
from app.schemas.community import LeaderboardEntry, FeedItemOut
from datetime import datetime


def _time_ago(dt: datetime) -> str:
    diff = datetime.utcnow() - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "just now"
    if seconds < 3600:
        return f"{seconds // 60}m ago"
    if seconds < 86400:
        return f"{seconds // 3600}h ago"
    return f"{seconds // 86400}d ago"


def get_leaderboard(db: Session) -> list[LeaderboardEntry]:
    users = db.query(User).order_by(User.score.desc()).limit(10).all()
    merged_counts = dict(
        db.query(PullRequest.user_id, func.count(PullRequest.id))
        .filter(PullRequest.status == "merged")
        .group_by(PullRequest.user_id)
        .all()
    )
    result = []
    for rank, u in enumerate(users, 1):
        result.append(LeaderboardEntry(
            rank=rank,
            user_id=u.id,
            name=u.name,
            username=u.username,
            avatar_url=u.avatar_url,
            score=u.score,
            contributions=merged_counts.get(u.id) or u.contributions_count,
        ))
    return result


def get_feed(user_id: int, db: Session) -> list[FeedItemOut]:
    items = (
        db.query(FeedItem)
        .filter(FeedItem.user_id == user_id)
        .order_by(FeedItem.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        FeedItemOut(
            id=f.id,
            actor=f.actor,
            action=f.action,
            repo=f.repo,
            item_type=f.item_type,
            time_ago=_time_ago(f.created_at),
        )
        for f in items
    ]
