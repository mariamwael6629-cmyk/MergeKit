from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardOut
from app.services.dashboard_service import build_dashboard

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_dashboard(db, current_user)
