from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class RiskAssessment(Base):
    __tablename__ = 'risk_assessments'
    id: Mapped[int] = mapped_column(primary_key=True)
    athlete_id: Mapped[int] = mapped_column(ForeignKey('athletes.id', ondelete='CASCADE'), index=True)
    movement_quality: Mapped[int] = mapped_column(Integer)
    recovery_score: Mapped[int] = mapped_column(Integer)
    training_load: Mapped[int] = mapped_column(Integer)
    workload_change_percentage: Mapped[float] = mapped_column()
    risk_level: Mapped[str] = mapped_column(String(20))
    reasons: Mapped[str] = mapped_column(String(2000), default='[]')
    recommendation: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    athlete: Mapped['Athlete'] = relationship(back_populates='risks')
