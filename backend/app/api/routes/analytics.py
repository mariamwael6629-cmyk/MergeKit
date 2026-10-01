from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import AnalyticsResponse
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("", response_model=AnalyticsResponse)
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return analytics_service.get_analytics(current_user, db)
