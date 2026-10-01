from pydantic import BaseModel


class HeatmapDay(BaseModel):
    date: str
    count: int


class ChallengeOut(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    points: int
    current: int
    target: int
    completed: bool

    model_config = {"from_attributes": True}


class DashboardResponse(BaseModel):
    total_contributions: int
    merged_prs: int
    open_prs: int
    score: int
    streak: int
    heatmap: list[HeatmapDay]
    challenges: list[ChallengeOut]
