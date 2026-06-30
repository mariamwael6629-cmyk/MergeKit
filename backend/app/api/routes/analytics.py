from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsOut
from app.services.analytics_service import build_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsOut)
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_analytics(db, current_user)
