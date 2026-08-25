from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import current_athlete
from app.core.database import get_db
from app.models.athlete import Athlete
from app.models.movement import MovementAnalysis
from app.schemas.movement import MovementInput, MovementResponse, LandmarkAnalysisRequest
from app.services.movement_service import movement_analyzer

router = APIRouter(prefix='/api/movement', tags=['Movement'])

def save(data: dict, athlete: Athlete, db: Session):
    data['athlete_id'] = athlete.id
    result = movement_analyzer.analyze(data)
    row = MovementAnalysis(**result); db.add(row); db.commit(); db.refresh(row); return row

@router.post('/analyze', response_model=MovementResponse, status_code=201)
def analyze(data: MovementInput, athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    return save(data.model_dump(exclude={'athlete_id'}), athlete, db)

@router.post('/squat', response_model=MovementResponse, status_code=201)
def squat(data: MovementInput, athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    payload = data.model_dump(exclude={'athlete_id'}); payload['exercise'] = 'squat'; return save(payload, athlete, db)

@router.post('/landmarks', response_model=MovementResponse, status_code=201)
def landmarks(data: LandmarkAnalysisRequest, athlete: Athlete = Depends(current_athlete), db: Session = Depends(get_db)):
    points = [point.model_dump() for point in data.landmarks]
    knee_angle = movement_analyzer.calculate_joint_angle(points[23], points[25], points[27])
    depth = round(max(0, min(100, (180 - knee_angle) * 1.25)))
    payload = {'exercise': data.exercise, 'repetitions': 0, 'depth_score': depth, 'knee_alignment_score': 100, 'stability_score': round(sum(point['visibility'] for point in points) / len(points) * 100), 'consistency_score': 100, 'workout_id': data.workout_id}
    return save(payload, athlete, db)
