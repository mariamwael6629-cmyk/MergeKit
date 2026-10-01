from pydantic import BaseModel, EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    username: str
    avatar_url: str
    bio: str
    streak: int
    score: int
    contributions_count: int

    model_config = {"from_attributes": True}


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    username: str
    password: str
