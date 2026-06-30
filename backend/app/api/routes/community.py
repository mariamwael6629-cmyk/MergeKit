from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.community import ChallengeOut, FeedItemOut, LeaderboardEntryOut
from app.services.community_service import get_challenges, get_feed, get_leaderboard

router = APIRouter(prefix="/community", tags=["community"])


@router.get("/leaderboard", response_model=list[LeaderboardEntryOut])
def leaderboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_leaderboard(db, current_user)


@router.get("/challenges", response_model=list[ChallengeOut])
def challenges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_challenges(db, current_user)


@router.get("/feed", response_model=list[FeedItemOut])
def feed(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_feed(db)
