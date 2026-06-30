from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.pull_request import PullRequestCreate, PullRequestOut
from app.services.pr_service import create_pull_request, get_pull_request, list_pull_requests

router = APIRouter(prefix="/pull-requests", tags=["pull-requests"])


@router.get("", response_model=list[PullRequestOut])
def get_pull_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return list_pull_requests(db, current_user)


@router.post("", response_model=PullRequestOut, status_code=status.HTTP_201_CREATED)
def post_pull_request(payload: PullRequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_pull_request(db, current_user, payload)


@router.get("/{pr_id}", response_model=PullRequestOut)
def get_pull_request_detail(pr_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pr = get_pull_request(db, current_user, pr_id)
    if not pr:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pull request not found")
    return pr
