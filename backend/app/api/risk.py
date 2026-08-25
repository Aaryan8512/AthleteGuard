import json
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_athlete
from app.core.database import get_db
from app.models.athlete import Athlete
from app.models.risk import RiskAssessment
from app.schemas.risk import RiskInput, RiskResponse
from app.services.risk_service import assess_risk

router = APIRouter(prefix='/api/risk', tags=['Risk Indicator'])

def output(row):
    return RiskResponse.model_validate({
        column: getattr(row, column)
        for column in RiskResponse.model_fields
        if column != 'reasons'
    } | {'reasons': json.loads(row.reasons)}).model_dump()

@router.post('/assess', response_model=RiskResponse, status_code=201)
def assess(data: RiskInput, athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    result = assess_risk(data.movement_quality, data.recovery_score, data.training_load, data.workload_change_percentage, data.movement_consistency)
    row = RiskAssessment(athlete_id=athlete.id, **result, reasons=json.dumps(result['reasons'])); db.add(row); db.commit(); db.refresh(row); return output(row)

@router.get('/latest', response_model=RiskResponse | None)
def latest(athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    row = db.scalar(select(RiskAssessment).where(RiskAssessment.athlete_id == athlete.id).order_by(RiskAssessment.created_at.desc())); return output(row) if row else None

@router.get('/history', response_model=list[RiskResponse])
def history(athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    return [output(row) for row in db.scalars(select(RiskAssessment).where(RiskAssessment.athlete_id == athlete.id).order_by(RiskAssessment.created_at.desc())).all()]
