from pydantic import BaseModel


class RepositoryOut(BaseModel):
    id: int
    full_name: str
    description: str
    stars_display: str
    language: str
    icon: str
    tags: list[str]
    match_pct: int
