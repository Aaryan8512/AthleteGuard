from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class WorkoutCreate(BaseModel):
    athlete_id: int | None = None
    exercise: str = Field(min_length=1, max_length=80)
    duration_minutes: int = Field(gt=0, le=600)
    intensity: int = Field(ge=1, le=10)
    repetitions: int = Field(ge=0, le=10000)
    performance_score: int | None = Field(default=None, ge=0, le=100)

class WorkoutResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    athlete_id: int
    exercise: str
    duration_minutes: int
    intensity: int
    repetitions: int
    session_load: int
    performance_score: int | None
    created_at: datetime
