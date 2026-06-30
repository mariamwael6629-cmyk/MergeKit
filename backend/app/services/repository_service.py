from sqlalchemy.orm import Session

from app.models.repository import Repository
from app.schemas.repository import RepositoryOut


def list_repositories(db: Session) -> list[RepositoryOut]:
    repos = db.query(Repository).order_by(Repository.match_pct.desc()).all()
    return [
        RepositoryOut(
            id=r.id,
            full_name=r.full_name,
            description=r.description,
            stars_display=r.stars_display(),
            language=r.language,
            icon=r.icon,
            tags=r.tag_list(),
            match_pct=r.match_pct,
        )
        for r in repos
    ]
