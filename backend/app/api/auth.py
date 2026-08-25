from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, hash_password, verify_password, get_current_user
from app.models.user import User
from app.models.athlete import Athlete
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix='/api/auth', tags=['Authentication'])

@router.post('/register', response_model=UserResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == data.email.lower())):
        raise HTTPException(409, 'Email is already registered')
    user = User(name=data.name, email=data.email.lower(), password_hash=hash_password(data.password), role=data.role)
    db.add(user); db.flush()
    if data.role == 'athlete':
        db.add(Athlete(user_id=user.id, sport=data.sport or 'Unspecified', position=data.position, age=data.age, height=data.height, team=data.team))
    db.commit(); db.refresh(user)
    return user

@router.post('/login', response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, 'Incorrect email or password')
    return TokenResponse(access_token=create_access_token(str(user.id)))

@router.get('/me', response_model=UserResponse)
def me(current_user=Depends(get_current_user)):
    return current_user
