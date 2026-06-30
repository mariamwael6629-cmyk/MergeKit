from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class PullRequestOut(BaseModel):
    id: int
    repo: str
    title: str
    description: str
    status: Literal["merged", "open", "closed"]
    language: str
    additions: int
    deletions: int
    impact_tag: str
    tag: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PullRequestCreate(BaseModel):
    repo: str = Field(min_length=1, max_length=150)
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(default="", max_length=1000)
    status: Literal["merged", "open", "closed"] = "open"
    language: str = Field(min_length=1, max_length=50)
    additions: int = Field(ge=0, default=0)
    deletions: int = Field(ge=0, default=0)
    impact_tag: str = Field(default="", max_length=100)
    tag: str = Field(default="", max_length=30)

    @field_validator("repo")
    @classmethod
    def repo_must_look_like_owner_name(cls, v: str) -> str:
        if "/" not in v:
            raise ValueError("repo must be in 'owner/name' format")
        return v
