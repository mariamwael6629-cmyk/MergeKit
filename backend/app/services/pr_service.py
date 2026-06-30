from sqlalchemy.orm import Session

from app.models.pull_request import PullRequest
from app.models.user import User
from app.schemas.pull_request import PullRequestCreate


def list_pull_requests(db: Session, user: User) -> list[PullRequest]:
    return (
        db.query(PullRequest)
        .filter(PullRequest.user_id == user.id)
        .order_by(PullRequest.created_at.desc())
        .all()
    )


def get_pull_request(db: Session, user: User, pr_id: int) -> PullRequest | None:
    return (
        db.query(PullRequest)
        .filter(PullRequest.id == pr_id, PullRequest.user_id == user.id)
        .first()
    )


def create_pull_request(db: Session, user: User, payload: PullRequestCreate) -> PullRequest:
    pr = PullRequest(user_id=user.id, **payload.model_dump())
    db.add(pr)
    db.commit()
    db.refresh(pr)
    return pr
