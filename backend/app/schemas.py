from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    INTERRUPTED = "interrupted"
    ABANDONED = "abandoned"
    OVERDUE = "overdue"

class SessionCreate(BaseModel):
    title: str
    goal: Optional[str] = None
    scheduled_duration: int = Field(..., gt=0, description="Scheduled duration in minutes")

class InterruptionCreate(BaseModel):
    reason: str

class InterruptionResponse(BaseModel):
    id: int
    session_id: int
    reason: str
    pause_time: datetime

    class Config:
        orm_mode = True

class SessionResponse(BaseModel):
    id: int
    title: str
    goal: Optional[str]
    scheduled_duration: int
    status: str
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    created_at: datetime
    interruptions: List[InterruptionResponse] = []

    class Config:
        orm_mode = True

class SessionHistoryResponse(BaseModel):
    id: int
    title: str
    goal: Optional[str]
    status: str
    pause_count: int
    completion_ratio: float

    class Config:
        orm_mode = True

class StatusUpdateResponse(BaseModel):
    id: int
    status: str
    message: str
