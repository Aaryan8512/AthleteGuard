from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_athlete, accessible_athlete
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.athlete import Athlete
from app.models.user import User
from app.models.workout import Workout
from app.models.recovery import Recovery
from app.models.movement import MovementAnalysis
from app.models.risk import RiskAssessment
from app.services.recommendation_service import recommendations
from app.services.training_service import training_summary
from app.schemas.athlete import AthleteResponse, AthleteUpdate

router = APIRouter(prefix='/api/athletes', tags=['Athletes'])

def response(athlete: Athlete) -> dict:
    return {'id': athlete.id, 'user_id': athlete.user_id, 'name': athlete.user.name, 'email': athlete.user.email, 'sport': athlete.sport, 'position': athlete.position, 'age': athlete.age, 'height': athlete.height, 'team': athlete.team, 'created_at': athlete.created_at}

@router.get('/me', response_model=AthleteResponse)
def get_me(athlete: Athlete = Depends(current_athlete)): return response(athlete)

@router.get('/{athlete_id}', response_model=AthleteResponse)
def get_athlete(athlete_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return response(accessible_athlete(athlete_id, current_user, db))

@router.put('/{athlete_id}', response_model=AthleteResponse)
def update_athlete(athlete_id: int, data: AthleteUpdate, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    athlete = accessible_athlete(athlete_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items(): setattr(athlete, key, value)
    db.commit(); db.refresh(athlete)
    return response(athlete)

@router.get('/{athlete_id}/dashboard')
def dashboard(athlete_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    athlete = accessible_athlete(athlete_id, current_user, db)
    training = training_summary(db, athlete.id)
    workout = db.scalar(select(Workout).where(Workout.athlete_id == athlete.id).order_by(Workout.created_at.desc()))
    recovery = db.scalar(select(Recovery).where(Recovery.athlete_id == athlete.id).order_by(Recovery.created_at.desc()))
    movement = db.scalar(select(MovementAnalysis).where(MovementAnalysis.athlete_id == athlete.id).order_by(MovementAnalysis.created_at.desc()))
    risk = db.scalar(select(RiskAssessment).where(RiskAssessment.athlete_id == athlete.id).order_by(RiskAssessment.created_at.desc()))
    return {
        'performance_score': workout.performance_score if workout else None,
        'recovery_score': recovery.recovery_score if recovery else None,
        'training_load': training['today_load'],
        'movement_quality': movement.movement_quality_score if movement else None,
        'risk_indicator': risk.risk_level if risk else None,
        'recent_sessions': [],
        'training_history': training['history'],
        'recovery_history': [],
        'recommendations': recommendations(recovery.recovery_score if recovery else None, training['workload_change_percentage'], movement.movement_quality_score if movement else None),
    }
