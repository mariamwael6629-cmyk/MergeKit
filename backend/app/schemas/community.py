from pydantic import BaseModel


class LeaderboardEntryOut(BaseModel):
    rank: int
    name: str
    initials: str
    contributions: int
    score: int
    is_current_user: bool


class ChallengeOut(BaseModel):
    id: int
    title: str
    description: str
    points: int
    progress: int
    target: int
    days_left: int

    model_config = {"from_attributes": True}


class FeedItemOut(BaseModel):
    id: int
    actor_name: str
    actor_initials: str
    action: str
    repo: str
    pr_title: str
    meta: str
    time_ago: str
