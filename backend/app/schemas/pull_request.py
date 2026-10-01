from pydantic import BaseModel, field_validator
from datetime import datetime


class PullRequestOut(BaseModel):
    id: int
    repo: str
    title: str
    status: str
    tag: str
    additions: int
    deletions: int
    awaiting_review: bool
    created_at: datetime
    merged_at: datetime | None

    model_config = {"from_attributes": True}

    @field_validator("repo")
    @classmethod
    def validate_repo(cls, v: str) -> str:
        if v and "/" not in v:
            raise ValueError("repo must be in owner/name format")
        return v


class PRListResponse(BaseModel):
    items: list[PullRequestOut]
    total: int
