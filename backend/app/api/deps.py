from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.athlete import Athlete

def current_athlete(current_user=Depends(get_current_user), db: Session = Depends(get_db)) -> Athlete:
    athlete = db.query(Athlete).filter(Athlete.user_id == current_user.id).first()
    if not athlete:
        raise HTTPException(status_code=404, detail='Athlete profile not found')
    return athlete

def accessible_athlete(athlete_id: int, current_user, db: Session) -> Athlete:
    athlete = db.get(Athlete, athlete_id)
    if not athlete: raise HTTPException(status_code=404, detail='Athlete not found')
    if current_user.role == 'athlete' and athlete.user_id != current_user.id:
        raise HTTPException(status_code=403, detail='Athletes can access only their own data')
    return athlete
