from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.models.database import get_db
from app import schemas, crud

router = APIRouter(tags=["sessions"])

@router.post("/sessions/", response_model=schemas.SessionResponse, status_code=201)
def create_session(session_data: schemas.SessionCreate, db: Session = Depends(get_db)):
    """
    Schedule a new work session with title, duration in minutes, and optional goal.
    """
    return crud.create_session(db=db, session_data=session_data)

@router.get("/sessions/", response_model=List[schemas.SessionResponse])
def get_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all sessions.
    """
    return crud.get_sessions(db=db, skip=skip, limit=limit)

@router.get("/sessions/{session_id}", response_model=schemas.SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    """
    Get a specific session by ID.
    """
    return crud.get_session(db=db, session_id=session_id)

@router.patch("/sessions/{session_id}/start", response_model=schemas.SessionResponse)
def start_session(session_id: int, db: Session = Depends(get_db)):
    """
    Start a scheduled session.
    """
    return crud.start_session(db=db, session_id=session_id)

@router.patch("/sessions/{session_id}/pause", response_model=schemas.SessionResponse)
def pause_session(
    session_id: int, 
    reason: str = Query(..., description="Reason for pausing the session"),
    db: Session = Depends(get_db)
):
    """
    Pause an active session and log the interruption reason.
    """
    interruption_data = schemas.InterruptionCreate(reason=reason)
    return crud.pause_session(db=db, session_id=session_id, interruption_data=interruption_data)

@router.patch("/sessions/{session_id}/resume", response_model=schemas.SessionResponse)
def resume_session(session_id: int, db: Session = Depends(get_db)):
    """
    Resume a paused session.
    """
    return crud.resume_session(db=db, session_id=session_id)

@router.patch("/sessions/{session_id}/complete", response_model=schemas.SessionResponse)
def complete_session(session_id: int, db: Session = Depends(get_db)):
    """
    Mark a session as completed.
    """
    return crud.complete_session(db=db, session_id=session_id)

@router.get("/sessions/history", response_model=List[schemas.SessionHistoryResponse])
def get_session_history(db: Session = Depends(get_db)):
    """
    Get a summary of past sessions with durations, pauses, and completion ratio.
    """
    return crud.get_session_history(db=db)

@router.get("/sessions/{session_id}/interruptions", response_model=List[schemas.InterruptionResponse])
def get_session_interruptions(session_id: int, db: Session = Depends(get_db)):
    """
    Get all interruptions for a specific session.
    """
    return crud.get_session_interruptions(db=db, session_id=session_id)
