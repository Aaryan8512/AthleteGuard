from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_athlete
from app.core.database import get_db
from app.models.movement import MovementAnalysis
from app.models.recovery import Recovery
from app.models.risk import RiskAssessment
from app.models.workout import Workout
from app.services.recommendation_service import recommendations
from app.services.training_service import training_summary

router = APIRouter(prefix='/api/dashboard', tags=['Dashboard'])

@router.get('/athlete')
def athlete_dashboard(athlete=Depends(current_athlete), db: Session = Depends(get_db)):
    training = training_summary(db, athlete.id)
    recovery = db.scalars(select(Recovery).where(Recovery.athlete_id == athlete.id).order_by(Recovery.created_at.desc())).all()
    movement = db.scalar(select(MovementAnalysis).where(MovementAnalysis.athlete_id == athlete.id).order_by(MovementAnalysis.created_at.desc()))
    risk = db.scalar(select(RiskAssessment).where(RiskAssessment.athlete_id == athlete.id).order_by(RiskAssessment.created_at.desc()))
    sessions = db.scalars(select(Workout).where(Workout.athlete_id == athlete.id).order_by(Workout.created_at.desc()).limit(10)).all()
    recovery_score = recovery[0].recovery_score if recovery else None
    movement_score = movement.movement_quality_score if movement else None
    return {'performance_score': sessions[0].performance_score if sessions else None, 'recovery_score': recovery_score, 'training_load': training['today_load'], 'movement_quality': movement_score, 'risk_indicator': risk.risk_level if risk else None, 'recent_sessions': [{'id': x.id, 'exercise': x.exercise, 'duration_minutes': x.duration_minutes, 'session_load': x.session_load, 'created_at': x.created_at} for x in sessions], 'training_history': training['history'], 'recovery_history': [{'date': x.created_at, 'score': x.recovery_score} for x in recovery], 'recommendations': recommendations(recovery_score, training['workload_change_percentage'], movement_score)}
