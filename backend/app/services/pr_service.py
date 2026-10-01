from sqlalchemy.orm import Session
from app.models.pull_request import PullRequest
from app.models.user import User
from app.schemas.pull_request import PRListResponse, PullRequestOut


def list_prs(user: User, db: Session, tag: str | None, status: str | None, skip: int, limit: int) -> PRListResponse:
    q = db.query(PullRequest).filter(PullRequest.user_id == user.id)
    if tag:
        q = q.filter(PullRequest.tag == tag)
    if status:
        q = q.filter(PullRequest.status == status)
    total = q.count()
    items = q.order_by(PullRequest.created_at.desc()).offset(skip).limit(limit).all()
    return PRListResponse(items=[PullRequestOut.model_validate(p) for p in items], total=total)
