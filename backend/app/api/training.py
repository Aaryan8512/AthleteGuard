from fastapi import APIRouter, Depends
from app.api.deps import current_athlete
from app.core.database import get_db
from app.services.training_service import training_summary

router = APIRouter(prefix='/api/training', tags=['Training Load'])

@router.get('/today')
@router.get('/7-days')
@router.get('/history')
def summary(athlete=Depends(current_athlete), db=Depends(get_db)):
    return training_summary(db, athlete.id)
