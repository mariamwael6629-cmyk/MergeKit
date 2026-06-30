from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.repository import RepositoryOut
from app.services.repository_service import list_repositories

router = APIRouter(prefix="/repositories", tags=["repositories"])


@router.get("", response_model=list[RepositoryOut])
def get_repositories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_repositories(db)
