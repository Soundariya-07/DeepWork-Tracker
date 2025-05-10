from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.database import get_db
from app import schemas, crud

router = APIRouter()

@router.post("/tasks/", response_model=schemas.TaskResponse, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    return crud.create_task(db=db, task=task)

@router.get("/tasks/", response_model=List[schemas.TaskResponse])
def read_tasks(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all tasks with optional filtering by category"""
    tasks = crud.get_tasks(db, skip=skip, limit=limit, category=category)
    return tasks

@router.get("/tasks/{task_id}", response_model=schemas.TaskResponse)
def read_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task by ID"""
    return crud.get_task(db=db, task_id=task_id)

@router.patch("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    """Update a task's details"""
    return crud.update_task(db=db, task_id=task_id, task_update=task)

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    return crud.delete_task(db=db, task_id=task_id)

@router.patch("/tasks/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, status_update: schemas.TaskStatusUpdate, db: Session = Depends(get_db)):
    """Update a task's status following the state machine rules"""
    return crud.update_task_status(db=db, task_id=task_id, status_update=status_update)

@router.post("/tasks/{task_id}/interruptions", response_model=schemas.InterruptionResponse)
def create_task_interruption(
    task_id: int, 
    interruption: schemas.InterruptionCreate, 
    db: Session = Depends(get_db)
):
    """Create an interruption for a task"""
    return crud.create_interruption(db=db, task_id=task_id, interruption=interruption)

@router.get("/tasks/{task_id}/interruptions", response_model=List[schemas.InterruptionResponse])
def read_task_interruptions(task_id: int, db: Session = Depends(get_db)):
    """Get all interruptions for a task"""
    return crud.get_task_interruptions(db=db, task_id=task_id)

@router.get("/stats/tasks", response_model=schemas.TaskStats)
def get_task_stats(days: int = Query(7, ge=1, le=365), db: Session = Depends(get_db)):
    """Get task statistics for the specified number of days"""
    return crud.get_task_stats(db=db, days=days)

@router.get("/stats/categories", response_model=List[schemas.CategoryStats])
def get_category_stats(days: int = Query(7, ge=1, le=365), db: Session = Depends(get_db)):
    """Get category statistics for the specified number of days"""
    return crud.get_category_stats(db=db, days=days)

@router.get("/stats/daily", response_model=List[schemas.DailyStats])
def get_daily_stats(days: int = Query(7, ge=1, le=30), db: Session = Depends(get_db)):
    """Get daily statistics for the specified number of days"""
    return crud.get_daily_stats(db=db, days=days)
