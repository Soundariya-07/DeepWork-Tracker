from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    goal = Column(Text)
    scheduled_duration = Column(Integer, nullable=False)  # in minutes
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    status = Column(String, default="scheduled")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Add check constraint for status values
    __table_args__ = (
        CheckConstraint(
            "status IN ('scheduled', 'active', 'paused', 'completed', 'interrupted', 'abandoned', 'overdue')", 
            name="valid_status"
        ),
    )
    
    # Relationships
    interruptions = relationship("Interruption", back_populates="session", cascade="all, delete-orphan")
    
    @property
    def pause_count(self):
        return len(self.interruptions)
    
    @property
    def completion_ratio(self):
        if not self.start_time or not self.end_time or self.scheduled_duration == 0:
            return 0
        
        actual_duration = (self.end_time - self.start_time).total_seconds() / 60  # in minutes
        return actual_duration / self.scheduled_duration

class Interruption(Base):
    __tablename__ = "interruptions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String, nullable=False)
    pause_time = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    session = relationship("Session", back_populates="interruptions")
