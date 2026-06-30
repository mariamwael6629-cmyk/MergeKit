from pydantic import BaseModel


class DashboardSummary(BaseModel):
    initials: str
    repos_count: int
    total_contributions: int
    total_contributions_delta: int
    merged_prs: int
    merged_prs_delta: int
    open_prs: int
    open_prs_awaiting_review: int
    repos_contributed: int
    repos_contributed_delta: int
    streak_days: int
    community_score: int
    community_percentile: str


class ImpactMetric(BaseModel):
    name: str
    pct: int


class ImpactSummary(BaseModel):
    score_pct: int
    metrics: list[ImpactMetric]


class LanguageShare(BaseModel):
    name: str
    pct: int
    color: str


class HeatmapDay(BaseModel):
    date: str
    level: int
    count: int


class StreakDay(BaseModel):
    active: bool
    is_today: bool


class StreakInfo(BaseModel):
    days: int
    history: list[StreakDay]


class ActivityItem(BaseModel):
    id: int
    type: str
    title: str
    repo: str
    meta: str
    time_ago: str


class DashboardOut(BaseModel):
    summary: DashboardSummary
    impact: ImpactSummary
    languages: list[LanguageShare]
    heatmap: list[HeatmapDay]
    streak: StreakInfo
    recent_activity: list[ActivityItem]
