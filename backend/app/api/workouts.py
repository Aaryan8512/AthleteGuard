from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import current_athlete, accessible_athlete
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.athlete import Athlete
from app.models.workout import Workout
from app.schemas.workout import WorkoutCreate, WorkoutResponse

router = APIRouter(prefix='/api/workouts', tags=['Workouts'])

def owner(workout: Workout, user, db):
    if not workout: raise HTTPException(404, 'Workout not found')
    accessible_athlete(workout.athlete_id, user, db)
    return workout

@router.post('', response_model=WorkoutResponse, status_code=201)
def create(data: WorkoutCreate, athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    workout = Workout(athlete_id=athlete.id, exercise=data.exercise, duration_minutes=data.duration_minutes, intensity=data.intensity, repetitions=data.repetitions, session_load=data.duration_minutes * data.intensity, performance_score=data.performance_score)
    db.add(workout); db.commit(); db.refresh(workout); return workout

@router.get('', response_model=list[WorkoutResponse])
def list_workouts(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role in ('coach', 'admin'):
        return db.scalars(select(Workout).order_by(Workout.created_at.desc())).all()
    athlete = db.scalar(select(Athlete).where(Athlete.user_id == current_user.id))
    return db.scalars(select(Workout).where(Workout.athlete_id == athlete.id).order_by(Workout.created_at.desc())).all() if athlete else []

@router.get('/{workout_id}', response_model=WorkoutResponse)
def get(workout_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return owner(db.get(Workout, workout_id), current_user, db)

@router.delete('/{workout_id}', status_code=204)
def delete(workout_id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    workout = owner(db.get(Workout, workout_id), current_user, db); db.delete(workout); db.commit()
