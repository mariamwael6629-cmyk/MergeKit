from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    initials: Mapped[str] = mapped_column(String(4), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    github_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    community_score: Mapped[int] = mapped_column(Integer, default=0)
    pr_quality_pct: Mapped[int] = mapped_column(Integer, default=0)
    review_speed_pct: Mapped[int] = mapped_column(Integer, default=0)
    doc_coverage_pct: Mapped[int] = mapped_column(Integer, default=0)
    contributions_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    pull_requests: Mapped[list["PullRequest"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    contribution_days: Mapped[list["ContributionDay"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    challenges: Mapped[list["Challenge"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    feed_items: Mapped[list["FeedItem"]] = relationship(back_populates="actor", cascade="all, delete-orphan")
