from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from app.db.database import Base


class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(String(500), default="")
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")
    points: Mapped[int] = mapped_column(Integer, default=100)
    current: Mapped[int] = mapped_column(Integer, default=0)
    target: Mapped[int] = mapped_column(Integer, default=1)
    completed: Mapped[bool] = mapped_column(default=False)
