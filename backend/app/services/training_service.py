from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.workout import Workout

def training_summary(db: Session, athlete_id: int, days: int = 7) -> dict:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)
    rows = db.scalars(select(Workout).where(Workout.athlete_id == athlete_id, Workout.created_at >= start).order_by(Workout.created_at)).all()
    buckets = {now.date() - timedelta(days=i): 0 for i in range(days)}
    for workout in rows:
        created = workout.created_at
        date = created.date() if created else now.date()
        if date in buckets:
            buckets[date] += workout.session_load
    values = list(reversed(list(buckets.values())))
    seven_total = sum(values)
    current = sum(values[-3:]) / max(1, len(values[-3:]))
    baseline = sum(values[:4]) / max(1, len(values[:4]))
    change = ((current - baseline) / baseline * 100) if baseline else 0
    return {'today_load': values[-1] if values else 0, 'seven_day_total': seven_total, 'seven_day_average': round(seven_total / days), 'recent_baseline': round(baseline), 'workload_change_percentage': round(change, 2), 'history': [{'label': date.isoformat(), 'value': value} for date, value in reversed(list(buckets.items()))]}
