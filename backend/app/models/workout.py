from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Workout(Base):
    __tablename__ = 'workouts'
    id: Mapped[int] = mapped_column(primary_key=True)
    athlete_id: Mapped[int] = mapped_column(ForeignKey('athletes.id', ondelete='CASCADE'), index=True)
    exercise: Mapped[str] = mapped_column(String(80))
    duration_minutes: Mapped[int] = mapped_column(Integer)
    intensity: Mapped[int] = mapped_column(Integer)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)
    session_load: Mapped[int] = mapped_column(Integer)
    performance_score: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    athlete: Mapped['Athlete'] = relationship(back_populates='workouts')
