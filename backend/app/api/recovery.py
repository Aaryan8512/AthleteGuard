import json
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_athlete
from app.core.database import get_db
from app.models.athlete import Athlete
from app.models.recovery import Recovery
from app.schemas.recovery import RecoveryCreate, RecoveryResponse
from app.services.recovery_service import calculate_recovery

router = APIRouter(prefix='/api/recovery', tags=['Recovery'])

def output(row):
    value = RecoveryResponse.model_validate({
        column: getattr(row, column)
        for column in RecoveryResponse.model_fields
        if column != 'breakdown'
    } | {'breakdown': json.loads(row.breakdown)}).model_dump()
    return value

@router.post('', response_model=RecoveryResponse, status_code=201)
def create(data: RecoveryCreate, athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    score, status, breakdown = calculate_recovery(data.model_dump())
    row = Recovery(athlete_id=athlete.id, **data.model_dump(), recovery_score=score, recovery_status=status, breakdown=json.dumps(breakdown))
    db.add(row); db.commit(); db.refresh(row); return output(row)

@router.get('/latest', response_model=RecoveryResponse | None)
def latest(athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    row = db.scalar(select(Recovery).where(Recovery.athlete_id == athlete.id).order_by(Recovery.created_at.desc())); return output(row) if row else None

@router.get('/history', response_model=list[RecoveryResponse])
def history(athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    return [output(row) for row in db.scalars(select(Recovery).where(Recovery.athlete_id == athlete.id).order_by(Recovery.created_at.desc())).all()]
