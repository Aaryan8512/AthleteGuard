from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Recovery(Base):
    __tablename__ = 'recoveries'
    id: Mapped[int] = mapped_column(primary_key=True)
    athlete_id: Mapped[int] = mapped_column(ForeignKey('athletes.id', ondelete='CASCADE'), index=True)
    sleep_hours: Mapped[float] = mapped_column()
    fatigue: Mapped[int] = mapped_column(Integer)
    soreness: Mapped[int] = mapped_column(Integer)
    stress: Mapped[int] = mapped_column(Integer)
    rest_days: Mapped[int] = mapped_column(Integer)
    training_intensity: Mapped[int] = mapped_column(Integer)
    recovery_score: Mapped[int] = mapped_column(Integer)
    recovery_status: Mapped[str] = mapped_column(String(20))
    breakdown: Mapped[str] = mapped_column(String(1000), default='{}')
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    athlete: Mapped['Athlete'] = relationship(back_populates='recoveries')
