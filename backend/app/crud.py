from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from fastapi import HTTPException
from typing import List, Optional
from . import schemas
from .models.models import Session as DbSession, Interruption

# Create a new session
def create_session(db: Session, session_data: schemas.SessionCreate):
    new_session = DbSession(
        title=session_data.title,
        goal=session_data.goal,
        scheduled_duration=session_data.scheduled_duration,
        status="scheduled"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

# Get all sessions
def get_sessions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(DbSession).order_by(desc(DbSession.created_at)).offset(skip).limit(limit).all()

# Get a specific session by ID
def get_session(db: Session, session_id: int):
    session = db.query(DbSession).filter(DbSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail=f"Session with id {session_id} not found")
    return session

# Start a session
def start_session(db: Session, session_id: int):
    session = get_session(db, session_id)
    
    # Validate current status
    if session.status != "scheduled":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot start session: Session must be in 'scheduled' state, current state: {session.status}"
        )
    
    # Update session status and start time
    session.status = "active"
    session.start_time = datetime.now()
    
    db.commit()
    db.refresh(session)
    return session

# Pause a session
def pause_session(db: Session, session_id: int, interruption_data: schemas.InterruptionCreate):
    session = get_session(db, session_id)
    
    # Validate current status
    if session.status != "active":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot pause session: Session must be in 'active' state, current state: {session.status}"
        )
    
    # Create interruption record
    interruption = Interruption(
        session_id=session_id,
        reason=interruption_data.reason,
        pause_time=datetime.now()
    )
    db.add(interruption)
    
    # Update session status
    session.status = "paused"
    
    # Check if this is the 4th or more interruption
    interruption_count = db.query(Interruption).filter(Interruption.session_id == session_id).count() + 1
    if interruption_count >= 4:
        session.status = "interrupted"
    
    db.commit()
    db.refresh(session)
    return session

# Resume a session
def resume_session(db: Session, session_id: int):
    session = get_session(db, session_id)
    
    # Validate current status
    if session.status != "paused":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot resume session: Session must be in 'paused' state, current state: {session.status}"
        )
    
    # Update session status
    session.status = "active"
    
    db.commit()
    db.refresh(session)
    return session

# Complete a session
def complete_session(db: Session, session_id: int):
    session = get_session(db, session_id)
    
    # Validate current status
    if session.status not in ["active", "paused"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot complete session: Session must be in 'active' or 'paused' state, current state: {session.status}"
        )
    
    # Set end time
    current_time = datetime.now()
    session.end_time = current_time
    
    # Check if session was abandoned (paused but never resumed)
    if session.status == "paused":
        session.status = "abandoned"
    else:
        # Calculate if session is overdue
        if session.start_time:
            actual_duration = (current_time - session.start_time).total_seconds() / 60  # in minutes
            if actual_duration > session.scheduled_duration * 1.1:  # 10% over scheduled time
                session.status = "overdue"
            else:
                session.status = "completed"
    
    db.commit()
    db.refresh(session)
    return session

# Get session history with stats
def get_session_history(db: Session):
    sessions = db.query(DbSession).all()
    history = []
    
    for session in sessions:
        # Calculate pause count
        pause_count = db.query(Interruption).filter(Interruption.session_id == session.id).count()
        
        # Calculate completion ratio
        completion_ratio = 0
        if session.status in ["completed", "overdue"] and session.start_time and session.end_time:
            actual_duration = (session.end_time - session.start_time).total_seconds() / 60  # in minutes
            completion_ratio = actual_duration / session.scheduled_duration if session.scheduled_duration > 0 else 0
        
        history.append({
            "id": session.id,
            "title": session.title,
            "goal": session.goal,
            "status": session.status,
            "pause_count": pause_count,
            "completion_ratio": completion_ratio
        })
    
    return history

# Get interruptions for a session
def get_session_interruptions(db: Session, session_id: int):
    # First check if the session exists
    get_session(db, session_id)
    return db.query(Interruption).filter(Interruption.session_id == session_id).all()
