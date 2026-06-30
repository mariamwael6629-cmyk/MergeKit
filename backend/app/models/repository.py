from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Repository(Base):
    __tablename__ = "repositories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(150), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    stars: Mapped[int] = mapped_column(Integer, default=0)
    language: Mapped[str] = mapped_column(String(50), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="ti-code")
    tags: Mapped[str] = mapped_column(String(300), default="")  # comma-separated
    match_pct: Mapped[int] = mapped_column(Integer, default=0)

    def tag_list(self) -> list[str]:
        return [t.strip() for t in self.tags.split(",") if t.strip()]

    def stars_display(self) -> str:
        if self.stars >= 1000:
            return f"{self.stars / 1000:.1f}".rstrip("0").rstrip(".") + "k"
        return str(self.stars)
