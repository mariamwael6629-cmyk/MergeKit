from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    name: str
    username: str
    avatar_url: str
    score: int
    contributions: int

    model_config = {"from_attributes": True}


class FeedItemOut(BaseModel):
    id: int
    actor: str
    action: str
    repo: str
    item_type: str
    time_ago: str

    model_config = {"from_attributes": True}
