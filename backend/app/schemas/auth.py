from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=150)
    password: str = Field(min_length=8, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: str
    initials: str
    github_username: str | None = None
    streak_days: int
    community_score: int

    model_config = {"from_attributes": True}


class ConnectGithubRequest(BaseModel):
    github_username: str | None = None
