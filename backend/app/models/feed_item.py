from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class FeedItem(Base):
    __tablename__ = "feed_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    actor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(20), nullable=False)  # merged/opened/closed
    repo: Mapped[str] = mapped_column(String(150), nullable=False)
    pr_title: Mapped[str] = mapped_column(String(300), nullable=False)
    meta: Mapped[str] = mapped_column(String(150), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    actor: Mapped["User"] = relationship(back_populates="feed_items")
