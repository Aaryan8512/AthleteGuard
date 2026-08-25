from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.security import require_roles
from app.models.athlete import Athlete
from app.models.risk import RiskAssessment
from app.schemas.athlete import AthleteResponse

router = APIRouter(prefix='/api/coach', tags=['Coach'])

def summary(a):
    latest = a.risks[-1] if a.risks else None
    return {'id': a.id, 'name': a.user.name, 'sport': a.sport, 'performance': a.workouts[-1].performance_score if a.workouts and a.workouts[-1].performance_score is not None else None, 'recovery': a.recoveries[-1].recovery_score if a.recoveries else None, 'training_load': sum(w.session_load for w in a.workouts if w.created_at), 'risk': latest.risk_level if latest else None}

@router.get('/athletes')
def athletes(sport: str | None = None, team: str | None = None, risk_level: str | None = None, user=Depends(require_roles('coach', 'admin')), db: Session = Depends(get_db)):
    rows = db.scalars(select(Athlete).options(joinedload(Athlete.user), joinedload(Athlete.workouts), joinedload(Athlete.recoveries), joinedload(Athlete.risks))).unique().all()
    result = [summary(a) for a in rows if (not sport or a.sport.lower() == sport.lower()) and (not team or a.team == team) and (not risk_level or (a.risks and a.risks[-1].risk_level == risk_level))]
    return result

@router.get('/dashboard')
def dashboard(user=Depends(require_roles('coach', 'admin')), db: Session = Depends(get_db)):
    rows = athletes(user=user, db=db); return {'total_athletes': len(rows), 'low_risk_count': sum(x['risk'] == 'LOW' for x in rows), 'moderate_count': sum(x['risk'] == 'MODERATE' for x in rows), 'attention_count': sum(x['risk'] == 'HIGH' for x in rows), 'athletes': rows}

@router.get('/athletes/{athlete_id}')
def athlete(athlete_id: int, user=Depends(require_roles('coach', 'admin')), db: Session = Depends(get_db)):
    row = db.get(Athlete, athlete_id)
    if not row: from fastapi import HTTPException; raise HTTPException(404, 'Athlete not found')
    return summary(row)
