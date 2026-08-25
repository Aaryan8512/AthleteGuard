from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class RiskInput(BaseModel):
    athlete_id: int | None = None
    movement_quality: int = Field(ge=0, le=100)
    recovery_score: int = Field(ge=0, le=100)
    training_load: int = Field(ge=0)
    workload_change_percentage: float
    movement_consistency: int = Field(ge=0, le=100)

class RiskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    athlete_id: int | None = None
    movement_quality: int
    recovery_score: int
    training_load: int
    workload_change_percentage: float
    risk_level: str
    reasons: list[str]
    recommendation: str
    created_at: datetime | None = None
