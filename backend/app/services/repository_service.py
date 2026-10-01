from sqlalchemy.orm import Session
from app.models.repository import Repository
from app.models.user import User
from app.schemas.repository import RepositoryOut


def list_repos(user: User, db: Session, good_first_issue: bool | None, difficulty: str | None) -> list[RepositoryOut]:
    q = db.query(Repository)
    if good_first_issue is not None:
        q = q.filter(Repository.has_good_first_issue == good_first_issue)
    if difficulty:
        q = q.filter(Repository.difficulty == difficulty)
    return [RepositoryOut.model_validate(r) for r in q.all()]
