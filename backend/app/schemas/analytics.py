from pydantic import BaseModel


class SeriesData(BaseModel):
    labels: list[str]
    data: list[int]


class OutcomeBreakdown(BaseModel):
    merged: int
    open: int
    closed: int


class AnalyticsOut(BaseModel):
    merge_success_rate: int
    merge_success_delta: int
    avg_review_time_days: float
    avg_review_time_delta: float
    lines_contributed: int
    lines_contributed_delta: int
    orgs_count: int
    orgs_sample: list[str]
    monthly_volume: SeriesData
    outcome_breakdown: OutcomeBreakdown
    growth: SeriesData
