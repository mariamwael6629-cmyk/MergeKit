from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.repository import RepositoryOut
from app.services import repository_service

router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.get("", response_model=list[RepositoryOut])
def list_repos(
    good_first_issue: bool | None = Query(None),
    difficulty: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return repository_service.list_repos(current_user, db, good_first_issue, difficulty)
