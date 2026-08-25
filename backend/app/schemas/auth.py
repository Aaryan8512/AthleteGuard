from pydantic import BaseModel, ConfigDict, EmailStr, Field

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default='athlete', pattern='^(athlete|coach)$')
    sport: str | None = Field(default=None, max_length=80)
    position: str | None = Field(default=None, max_length=80)
    age: int | None = Field(default=None, ge=5, le=100)
    height: float | None = Field(default=None, gt=0, le=300)
    team: str | None = Field(default=None, max_length=120)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    role: str
