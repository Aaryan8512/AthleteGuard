from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class RecoveryCreate(BaseModel):
    sleep_hours: float = Field(ge=0, le=14)
    fatigue: int = Field(ge=1, le=10)
    soreness: int = Field(ge=1, le=10)
    stress: int = Field(ge=1, le=10)
    rest_days: int = Field(ge=0, le=30)
    training_intensity: int = Field(ge=1, le=10)

class RecoveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    athlete_id: int
    sleep_hours: float
    fatigue: int
    soreness: int
    stress: int
    rest_days: int
    training_intensity: int
    recovery_score: int
    recovery_status: str
    breakdown: dict
    created_at: datetime
