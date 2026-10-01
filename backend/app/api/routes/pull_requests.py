from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.pull_request import PRListResponse
from app.services import pr_service

router = APIRouter(prefix="/pull-requests", tags=["pull-requests"])


@router.get("", response_model=PRListResponse)
def list_prs(
    tag: str | None = Query(None),
    status: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return pr_service.list_prs(current_user, db, tag, status, skip, limit)
