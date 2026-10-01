from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Date
from datetime import date
from app.db.database import Base


class ContributionDay(Base):
    __tablename__ = "contribution_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    day: Mapped[date] = mapped_column(Date, index=True)
    count: Mapped[int] = mapped_column(Integer, default=0)
