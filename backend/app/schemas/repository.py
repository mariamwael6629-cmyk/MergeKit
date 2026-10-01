from pydantic import BaseModel


class RepositoryOut(BaseModel):
    id: int
    full_name: str
    description: str
    language: str
    stars: int
    forks: int
    open_issues: int
    has_good_first_issue: bool
    difficulty: str
    topics: str

    model_config = {"from_attributes": True}
