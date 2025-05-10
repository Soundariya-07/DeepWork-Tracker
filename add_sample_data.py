"""
Add sample data to the SQLite database for the DeepWork app.
This will create some sample sessions and interruptions.
"""

import sqlite3
import uuid
import datetime
import random

# SQLite database setup
DB_PATH = 'deepwork.db'

def add_sample_data():
    """Add sample data to the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Clear existing data
    cursor.execute("DELETE FROM interruptions")
    cursor.execute("DELETE FROM sessions")
    
    # Create base date (current time - 3 days)
    base_date = datetime.datetime.now() - datetime.timedelta(days=3)
    
    # Create sample sessions
    sessions = [
        # Completed sessions with history starting from May 7, 2025
        {
            "id": str(uuid.uuid4()),
            "title": "Code Refactoring",
            "goal": "Improve code quality and maintainability",
            "status": "completed",
            "scheduled_duration": 60,
            "created_at": (base_date + datetime.timedelta(hours=1)).isoformat(),
            "started_at": (base_date + datetime.timedelta(hours=1, minutes=5)).isoformat(),
            "completed_at": (base_date + datetime.timedelta(hours=2, minutes=10)).isoformat(),
            "actual_duration": 65,
            "interruption_count": 1
        },
        {
            "id": str(uuid.uuid4()),
            "title": "API Documentation",
            "goal": "Document all API endpoints",
            "status": "completed",
            "scheduled_duration": 45,
            "created_at": (base_date + datetime.timedelta(days=1)).isoformat(),
            "started_at": (base_date + datetime.timedelta(days=1, minutes=10)).isoformat(),
            "completed_at": (base_date + datetime.timedelta(days=1, hours=1)).isoformat(),
            "actual_duration": 50,
            "interruption_count": 2
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Database Optimization",
            "goal": "Improve query performance",
            "status": "completed",
            "scheduled_duration": 90,
            "created_at": (base_date + datetime.timedelta(days=2)).isoformat(),
            "started_at": (base_date + datetime.timedelta(days=2, minutes=5)).isoformat(),
            "completed_at": (base_date + datetime.timedelta(days=2, hours=1, minutes=30)).isoformat(),
            "actual_duration": 85,
            "interruption_count": 0
        },
        {
            "id": str(uuid.uuid4()),
            "title": "UI Design Review",
            "goal": "Review and improve user interface",
            "status": "completed",
            "scheduled_duration": 60,
            "created_at": (base_date + datetime.timedelta(days=2, hours=3)).isoformat(),
            "started_at": (base_date + datetime.timedelta(days=2, hours=3, minutes=10)).isoformat(),
            "completed_at": (base_date + datetime.timedelta(days=2, hours=4, minutes=5)).isoformat(),
            "actual_duration": 55,
            "interruption_count": 1
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Cryptography test prep",
            "goal": "Finish 2 chapters",
            "status": "completed",
            "scheduled_duration": 40,
            "created_at": (base_date + datetime.timedelta(days=3)).isoformat(),
            "started_at": (base_date + datetime.timedelta(days=3, minutes=5)).isoformat(),
            "completed_at": (base_date + datetime.timedelta(days=3, minutes=42)).isoformat(),
            "actual_duration": 37,
            "interruption_count": 0
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Write project documentation",
            "goal": "Complete API documentation section",
            "status": "completed",
            "scheduled_duration": 45,
            "created_at": (base_date + datetime.timedelta(days=3, hours=2)).isoformat(),
            "started_at": (base_date + datetime.timedelta(days=3, hours=2, minutes=5)).isoformat(),
            "completed_at": (base_date + datetime.timedelta(days=3, hours=2, minutes=50)).isoformat(),
            "actual_duration": 45,
            "interruption_count": 0
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Deep Work Session",
            "goal": "Focus on important tasks",
            "status": "completed",
            "scheduled_duration": 60,
            "created_at": (base_date + datetime.timedelta(days=3, hours=4)).isoformat(),
            "started_at": (base_date + datetime.timedelta(days=3, hours=4, minutes=5)).isoformat(),
            "completed_at": (base_date + datetime.timedelta(days=3, hours=5, minutes=10)).isoformat(),
            "actual_duration": 65,
            "interruption_count": 1
        },
        
        # Scheduled sessions
        {
            "id": str(uuid.uuid4()),
            "title": "Research Machine Learning",
            "goal": "Research new ML techniques",
            "status": "scheduled",
            "scheduled_duration": 90,
            "created_at": datetime.datetime.now().isoformat(),
            "started_at": None,
            "completed_at": None,
            "actual_duration": 0,
            "interruption_count": 0
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Research Machine Learning",
            "goal": "Research new ML techniques",
            "status": "scheduled",
            "scheduled_duration": 90,
            "created_at": datetime.datetime.now().isoformat(),
            "started_at": None,
            "completed_at": None,
            "actual_duration": 0,
            "interruption_count": 0
        },
        {
            "id": str(uuid.uuid4()),
            "title": "SQLite checking",
            "goal": "see if its here or not",
            "status": "scheduled",
            "scheduled_duration": 25,
            "created_at": datetime.datetime.now().isoformat(),
            "started_at": None,
            "completed_at": None,
            "actual_duration": 0,
            "interruption_count": 0
        },
        
        # Active and paused sessions
        {
            "id": str(uuid.uuid4()),
            "title": "Active Coding Session",
            "goal": "Complete the current feature",
            "status": "active",
            "scheduled_duration": 60,
            "created_at": (datetime.datetime.now() - datetime.timedelta(minutes=30)).isoformat(),
            "started_at": (datetime.datetime.now() - datetime.timedelta(minutes=20)).isoformat(),
            "completed_at": None,
            "actual_duration": 20,
            "interruption_count": 0
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Paused Debugging Session",
            "goal": "Fix critical bugs in production",
            "status": "paused",
            "scheduled_duration": 45,
            "created_at": (datetime.datetime.now() - datetime.timedelta(minutes=45)).isoformat(),
            "started_at": (datetime.datetime.now() - datetime.timedelta(minutes=40)).isoformat(),
            "paused_at": (datetime.datetime.now() - datetime.timedelta(minutes=25)).isoformat(),
            "completed_at": None,
            "actual_duration": 15,
            "interruption_count": 1
        }
    ]
    
    # Insert sample sessions
    for session in sessions:
        cursor.execute(
            """
            INSERT INTO sessions 
            (id, title, goal, status, scheduled_duration, created_at, started_at, completed_at, actual_duration, interruption_count) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, 
            (
                session["id"],
                session["title"],
                session["goal"],
                session["status"],
                session["scheduled_duration"],
                session["created_at"],
                session["started_at"],
                session["completed_at"],
                session["actual_duration"],
                session["interruption_count"]
            )
        )
    
    # Create sample interruptions
    interruption_reasons = [
        "Phone call from colleague",
        "Urgent email from client",
        "Meeting reminder",
        "Coffee break",
        "Technical issue with computer"
    ]
    
    # Add interruptions for all sessions that have interruption_count > 0
    for session in sessions:
        if session["interruption_count"] > 0 and session["started_at"] is not None:
            for i in range(session["interruption_count"]):
                interruption_id = str(uuid.uuid4())
                
                # For completed sessions
                if session["status"] == "completed" and session["completed_at"] is not None:
                    start_time = datetime.datetime.fromisoformat(session["started_at"]) + datetime.timedelta(minutes=random.randint(5, 20))
                    end_time = start_time + datetime.timedelta(minutes=random.randint(5, 15))
                    
                    # Make sure interruption ends before session ends
                    session_end = datetime.datetime.fromisoformat(session["completed_at"])
                    if end_time > session_end:
                        end_time = session_end - datetime.timedelta(minutes=2)
                    
                    cursor.execute(
                        """
                        INSERT INTO interruptions 
                        (id, session_id, reason, start_time, end_time) 
                        VALUES (?, ?, ?, ?, ?)
                        """, 
                        (
                            interruption_id,
                            session["id"],
                            random.choice(interruption_reasons),
                            start_time.isoformat(),
                            end_time.isoformat()
                        )
                    )
                
                # For paused sessions
                elif session["status"] == "paused" and "paused_at" in session and session["paused_at"] is not None:
                    start_time = datetime.datetime.fromisoformat(session["paused_at"])
                    
                    cursor.execute(
                        """
                        INSERT INTO interruptions 
                        (id, session_id, reason, start_time, end_time) 
                        VALUES (?, ?, ?, ?, ?)
                        """, 
                        (
                            interruption_id,
                            session["id"],
                            "Urgent meeting with team lead",
                            start_time.isoformat(),
                            None  # No end time since it's still paused
                        )
                    )
    
    conn.commit()
    conn.close()
    
    print(f"Added {len(sessions)} sample sessions and {sum(s['interruption_count'] for s in sessions)} interruptions to the database.")

if __name__ == "__main__":
    add_sample_data()
