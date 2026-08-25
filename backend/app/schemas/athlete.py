from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class AthleteUpdate(BaseModel):
    sport: str | None = Field(default=None, max_length=80)
    position: str | None = Field(default=None, max_length=80)
    age: int | None = Field(default=None, ge=5, le=100)
    height: float | None = Field(default=None, gt=0, le=300)
    team: str | None = Field(default=None, max_length=120)

class AthleteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int
    name: str
    email: str
    sport: str
    position: str | None
    age: int | None
    height: float | None
    team: str | None
    created_at: datetime

class DashboardResponse(BaseModel):
    performance_score: int | None
    recovery_score: int | None
    training_load: int
    movement_quality: int | None
    risk_indicator: str | None
    recent_sessions: list[dict]
    training_history: list[dict]
    recovery_history: list[dict]
    recommendations: list[str]
