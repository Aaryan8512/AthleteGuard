import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
from app.main import app

engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
TestingSession = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
Base.metadata.create_all(engine)

def override_db():
    db = TestingSession()
    try: yield db
    finally: db.close()

app.dependency_overrides[get_db] = override_db
client = TestClient(app)

def register(email, role='athlete'):
    response = client.post('/api/auth/register', json={'name': email.split('@')[0], 'email': email, 'password': 'StrongPass123!', 'role': role, 'sport': 'Cricket'})
    assert response.status_code == 201, response.text
    return response.json()

def token(email):
    return client.post('/api/auth/login', json={'email': email, 'password': 'StrongPass123!'}).json()['access_token']

def test_registration_login_and_me():
    register('api-athlete@example.com')
    access_token = token('api-athlete@example.com')
    response = client.get('/api/auth/me', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    assert response.json()['email'] == 'api-athlete@example.com'

def test_workout_load_is_calculated_server_side():
    register('workout-athlete@example.com')
    access_token = token('workout-athlete@example.com')
    response = client.post('/api/workouts', headers={'Authorization': f'Bearer {access_token}'}, json={'exercise': 'squat', 'duration_minutes': 35, 'intensity': 8, 'repetitions': 16, 'session_load': 1})
    assert response.status_code == 201
    assert response.json()['session_load'] == 280

def test_athlete_cannot_access_another_athlete():
    register('owner@example.com')
    register('other@example.com')
    other_token = token('other@example.com')
    other_id = client.get('/api/athletes/me', headers={'Authorization': f'Bearer {other_token}'}).json()['id']
    access_token = token('owner@example.com')
    response = client.get(f'/api/athletes/{other_id}', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 403

def test_coach_can_view_team():
    register('coach@example.com', role='coach')
    access_token = token('coach@example.com')
    response = client.get('/api/coach/athletes', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
