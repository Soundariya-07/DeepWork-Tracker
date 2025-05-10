"""
Check the contents of the SQLite database
"""

import sqlite3
import json

# SQLite database setup
DB_PATH = 'deepwork.db'

def dict_factory(cursor, row):
    """Convert SQLite row to dictionary"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def check_database():
    """Check the contents of the database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    cursor = conn.cursor()
    
    print("=== SESSIONS TABLE ===")
    cursor.execute("SELECT * FROM sessions")
    sessions = cursor.fetchall()
    
    for session in sessions:
        print(json.dumps(session, indent=2))
        print("-" * 50)
    
    print("\n=== ACTIVE SESSIONS ===")
    cursor.execute("SELECT * FROM sessions WHERE status = 'active'")
    active_sessions = cursor.fetchall()
    
    for session in active_sessions:
        print(json.dumps(session, indent=2))
        print("-" * 50)
    
    print("\n=== INTERRUPTIONS TABLE ===")
    cursor.execute("SELECT * FROM interruptions")
    interruptions = cursor.fetchall()
    
    for interruption in interruptions:
        print(json.dumps(interruption, indent=2))
        print("-" * 50)
    
    conn.close()

if __name__ == "__main__":
    check_database()
