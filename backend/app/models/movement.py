from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class MovementAnalysis(Base):
    __tablename__ = 'movement_analyses'
    id: Mapped[int] = mapped_column(primary_key=True)
    athlete_id: Mapped[int] = mapped_column(ForeignKey('athletes.id', ondelete='CASCADE'), index=True)
    workout_id: Mapped[int | None] = mapped_column(ForeignKey('workouts.id', ondelete='SET NULL'), index=True)
    exercise: Mapped[str] = mapped_column(String(80))
    repetitions: Mapped[int] = mapped_column(Integer)
    depth_score: Mapped[int] = mapped_column(Integer)
    knee_alignment_score: Mapped[int] = mapped_column(Integer)
    stability_score: Mapped[int] = mapped_column(Integer)
    consistency_score: Mapped[int] = mapped_column(Integer)
    movement_quality_score: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    athlete: Mapped['Athlete'] = relationship(back_populates='movements')
