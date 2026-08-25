from pydantic import BaseModel

class TrainingSummary(BaseModel):
    today_load: int
    seven_day_total: int
    seven_day_average: int
    recent_baseline: int
    workload_change_percentage: float
    history: list[dict]
