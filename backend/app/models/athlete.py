from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Athlete(Base):
    __tablename__ = 'athletes'
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id', ondelete='CASCADE'), unique=True, index=True)
    sport: Mapped[str] = mapped_column(String(80))
    position: Mapped[str | None] = mapped_column(String(80))
    age: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[float | None] = mapped_column()
    team: Mapped[str | None] = mapped_column(String(120), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    user: Mapped['User'] = relationship(back_populates='athlete')
    workouts: Mapped[list['Workout']] = relationship(back_populates='athlete', cascade='all, delete-orphan')
    recoveries: Mapped[list['Recovery']] = relationship(back_populates='athlete', cascade='all, delete-orphan')
    movements: Mapped[list['MovementAnalysis']] = relationship(back_populates='athlete', cascade='all, delete-orphan')
    risks: Mapped[list['RiskAssessment']] = relationship(back_populates='athlete', cascade='all, delete-orphan')
