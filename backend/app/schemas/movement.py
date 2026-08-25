from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class MovementInput(BaseModel):
    athlete_id: int | None = None
    workout_id: int | None = None
    exercise: str = Field(min_length=1, max_length=80)
    repetitions: int = Field(ge=0, le=10000)
    depth_score: int = Field(ge=0, le=100)
    knee_alignment_score: int = Field(ge=0, le=100)
    stability_score: int = Field(ge=0, le=100)
    consistency_score: int = Field(ge=0, le=100)

class MovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    athlete_id: int | None = None
    workout_id: int | None = None
    exercise: str
    repetitions: int
    depth_score: int
    knee_alignment_score: int
    stability_score: int
    consistency_score: int
    movement_quality_score: int
    created_at: datetime | None = None

class Landmark(BaseModel):
    x: float
    y: float
    z: float = 0
    visibility: float = Field(default=1, ge=0, le=1)

class LandmarkAnalysisRequest(BaseModel):
    athlete_id: int | None = None
    workout_id: int | None = None
    exercise: str = Field(default='squat', max_length=80)
    landmarks: list[Landmark] = Field(min_length=33, max_length=33)
