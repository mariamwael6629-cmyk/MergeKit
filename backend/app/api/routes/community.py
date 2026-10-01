from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.community import LeaderboardEntry, FeedItemOut
from app.services import community_service

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return community_service.get_leaderboard(db)


@router.get("/feed", response_model=list[FeedItemOut])
def feed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return community_service.get_feed(current_user.id, db)
