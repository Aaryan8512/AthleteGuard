from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import User, Athlete, Workout, Recovery, MovementAnalysis, RiskAssessment
from app.services.recovery_service import calculate_recovery
from app.services.movement_service import movement_analyzer
from app.services.risk_service import assess_risk

athletes = [('Priya Mehta', 'Cricket', 'All-rounder', 'Athlete Club'), ('Daniel Okafor', 'Football', 'Midfielder', 'Athlete Club'), ('Mei Tanaka', 'Badminton', 'Singles', 'Athlete Club'), ('Lucas Silva', 'Basketball', 'Forward', 'Athlete Club')]

def main():
    with SessionLocal() as db:
        if db.scalar(select(User).where(User.email == 'coach@athleteguard.local')):
            print('Seed already exists'); return
        coach = User(name='Team Coach', email='coach@athleteguard.local', password_hash=hash_password('ChangeMe123!'), role='coach'); db.add(coach)
        db.flush()
        for index, (name, sport, position, team) in enumerate(athletes, 1):
            user = User(name=name, email=f'athlete{index}@athleteguard.local', password_hash=hash_password('ChangeMe123!'), role='athlete'); db.add(user); db.flush()
            athlete = Athlete(user_id=user.id, sport=sport, position=position, age=20 + index, height=170 + index, team=team); db.add(athlete); db.flush()
            for day in range(7):
                workout = Workout(athlete_id=athlete.id, exercise='squat', duration_minutes=30 + index, intensity=5 + index % 4, repetitions=10 + day, session_load=(30 + index) * (5 + index % 4), performance_score=75 + index)
                workout.created_at = datetime.now(timezone.utc) - timedelta(days=6 - day); db.add(workout); db.flush()
                recovery_data = {'sleep_hours': 7, 'fatigue': 3 + index % 3, 'soreness': 2 + index % 3, 'stress': 3 + index % 4, 'rest_days': 1, 'training_intensity': 5 + index % 4}
                score, status, breakdown = calculate_recovery(recovery_data); recovery = Recovery(athlete_id=athlete.id, **recovery_data, recovery_score=score, recovery_status=status, breakdown=__import__('json').dumps(breakdown)); recovery.created_at = workout.created_at; db.add(recovery)
                movement_data = {'athlete_id': athlete.id, 'workout_id': workout.id, 'exercise': 'squat', 'repetitions': 10 + day, 'depth_score': 82 + index, 'knee_alignment_score': 80 + index, 'stability_score': 78 + index, 'consistency_score': 84 + index}; movement = MovementAnalysis(**movement_analyzer.analyze(movement_data)); movement.created_at = workout.created_at; db.add(movement)
                risk_data = assess_risk(movement.movement_quality_score, score, workout.session_load, 5 + index, movement.consistency_score); db.add(RiskAssessment(athlete_id=athlete.id, **risk_data, reasons=__import__('json').dumps(risk_data['reasons'])))
        db.commit(); print('Seeded coach and 4 athletes with 7 days of records.')

if __name__ == '__main__': main()
