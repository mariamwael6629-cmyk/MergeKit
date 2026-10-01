from pydantic import BaseModel


class MonthlyPoint(BaseModel):
    month: str
    count: int


class TagBreakdown(BaseModel):
    tag: str
    count: int


class AnalyticsResponse(BaseModel):
    monthly_contributions: list[MonthlyPoint]
    tag_breakdown: list[TagBreakdown]
    total_additions: int
    total_deletions: int
    merge_rate: float
