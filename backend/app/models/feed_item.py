from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime
from datetime import datetime
from app.db.database import Base


class FeedItem(Base):
    __tablename__ = "feed_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    actor: Mapped[str] = mapped_column(String(120))
    action: Mapped[str] = mapped_column(String(200))
    repo: Mapped[str] = mapped_column(String(200), default="")
    item_type: Mapped[str] = mapped_column(String(40), default="pr")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
