import sqlite3
import json
import requests
import uuid
import os

# SQLite database setup
DB_PATH = 'deepwork.db'

def init_db():
    """Initialize the SQLite database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create sessions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        goal TEXT,
        status TEXT NOT NULL,
        scheduled_duration INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        started_at TEXT,
        paused_at TEXT,
        completed_at TEXT,
        actual_duration INTEGER,
        interruption_count INTEGER DEFAULT 0
    )
    ''')
    
    # Create interruptions table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS interruptions (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
    )
    ''')
    
    conn.commit()
    conn.close()

def fetch_current_sessions():
    """Fetch sessions from the current API"""
    try:
        response = requests.get('http://localhost:8090/sessions/')
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching sessions: {response.status_code}")
            return []
    except Exception as e:
        print(f"Exception fetching sessions: {e}")
        return []

def fetch_interruptions(session_id):
    """Fetch interruptions for a session"""
    try:
        response = requests.get(f'http://localhost:8090/sessions/{session_id}/interruptions')
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching interruptions: {response.status_code}")
            return []
    except Exception as e:
        print(f"Exception fetching interruptions: {e}")
        return []

def migrate_data():
    """Migrate data from API to SQLite"""
    # Initialize the database
    init_db()
    
    # Fetch current sessions
    sessions = fetch_current_sessions()
    
    if not sessions:
        print("No sessions found to migrate")
        return
    
    print(f"Found {len(sessions)} sessions to migrate")
    
    # Connect to SQLite
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Migrate each session
    for session in sessions:
        # Generate a UUID for the session if it's using an integer ID
        if isinstance(session['id'], int):
            new_id = str(uuid.uuid4())
        else:
            new_id = session['id']
        
        # Map fields from API to SQLite
        started_at = session.get('start_time')
        completed_at = session.get('end_time')
        
        # Insert session into SQLite
        cursor.execute(
            """
            INSERT OR REPLACE INTO sessions 
            (id, title, goal, status, scheduled_duration, created_at, started_at, completed_at, interruption_count) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, 
            (
                new_id, 
                session.get('title', 'Untitled Session'),
                session.get('goal', ''),
                session.get('status', 'scheduled'),
                session.get('scheduled_duration', 30),
                session.get('created_at', ''),
                started_at,
                completed_at,
                0  # Will update with actual count
            )
        )
        
        # Fetch and migrate interruptions
        interruptions = fetch_interruptions(session['id'])
        interruption_count = 0
        
        for interruption in interruptions:
            interruption_id = str(uuid.uuid4())
            cursor.execute(
                """
                INSERT INTO interruptions 
                (id, session_id, reason, start_time, end_time) 
                VALUES (?, ?, ?, ?, ?)
                """, 
                (
                    interruption_id,
                    new_id,
                    interruption.get('reason', 'Unknown'),
                    interruption.get('pause_time', ''),
                    None  # End time might not be available
                )
            )
            interruption_count += 1
        
        # Update interruption count
        if interruption_count > 0:
            cursor.execute(
                "UPDATE sessions SET interruption_count = ? WHERE id = ?",
                (interruption_count, new_id)
            )
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print(f"Migration complete. Data stored in {os.path.abspath(DB_PATH)}")
    print("You can now view this data using DB Browser for SQLite.")

if __name__ == "__main__":
    migrate_data()
