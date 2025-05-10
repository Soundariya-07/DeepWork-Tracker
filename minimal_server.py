import http.server
import json
import urllib.parse
import datetime
import sqlite3
import os
from typing import Dict, List, Optional, Any
import uuid

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
    
# Initialize the database
init_db()

# Simple server on port 8090
PORT = 8090

        "created_at": "2025-05-10T08:00:00"
    },
    {
        "id": 2,
        "title": "Research Session",
        "goal": "Research new technologies",
        "status": "completed",
        "scheduled_duration": 45,
        "start_time": "2025-05-09T10:00:00",
        "end_time": "2025-05-09T10:45:00",
        "created_at": "2025-05-09T09:00:00"
    }
]

INTERRUPTIONS = [
    {
        "id": 1,
        "session_id": 2,
        "reason": "Phone call",
        "pause_time": "2025-05-09T10:15:00"
    }
]

# Get current timestamp in ISO format
def get_current_time():
    return datetime.datetime.now().isoformat()

# Find session by ID
def find_session(session_id):
    for session in SESSIONS:
        if session["id"] == session_id:
            return session
    return None

# Get interruptions for a session
def get_interruptions_for_session(session_id):
    return [i for i in INTERRUPTIONS if i["session_id"] == session_id]

# Handler class
class APIHandler(http.server.SimpleHTTPRequestHandler):
    # Add CORS headers
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    # Parse request body
    def parse_request_body(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        return json.loads(post_data.decode('utf-8'))
    
    # Handle OPTIONS requests (for CORS preflight)
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    # Handle POST requests
    def do_POST(self):
        if self.path == '/sessions/' or self.path == '/sessions':
            # Create a new session
            try:
                data = self.parse_request_body()
                new_session = {
                    "id": len(SESSIONS) + 1,
                    "title": data.get("title", "Untitled Session"),
                    "goal": data.get("goal", ""),
                    "status": "scheduled",
                    "scheduled_duration": data.get("scheduled_duration", 30),
                    "start_time": None,
                    "end_time": None,
                    "created_at": get_current_time()
                }
                SESSIONS.append(new_session)
                
                self.send_response(201)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(new_session).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())
    
    # Handle PATCH requests
    def do_PATCH(self):
        path_parts = self.path.split('/')
        
        # Check if this is a session-related PATCH
        if len(path_parts) >= 4 and path_parts[1] == 'sessions' and path_parts[3] in ['start', 'pause', 'resume', 'complete']:
            try:
                session_id = int(path_parts[2])
                action = path_parts[3]
                session = find_session(session_id)
                
                if not session:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session not found"}).encode())
                    return
                
                # Handle different actions
                if action == 'start' and session['status'] == 'scheduled':
                    session['status'] = 'active'
                    session['start_time'] = get_current_time()
                elif action == 'pause' and session['status'] == 'active':
                    # For pause, we need to get the reason from query params or body
                    reason = ""
                    if '?' in self.path:
                        query = urllib.parse.urlparse(self.path).query
                        params = parse_qs(query)
                        reason = params.get('reason', ['Unknown'])[0]
                    else:
                        # Try to get reason from body
                        try:
                            data = self.parse_request_body()
                            reason = data.get('reason', 'Unknown')
                        except:
                            reason = 'Unknown'
                    
                    # Add interruption
                    interruption = {
                        "id": len(INTERRUPTIONS) + 1,
                        "session_id": session_id,
                        "reason": reason,
                        "pause_time": get_current_time()
                    }
                    INTERRUPTIONS.append(interruption)
                    
                    # Check if this is the 4th interruption
                    session_interruptions = get_interruptions_for_session(session_id)
                    if len(session_interruptions) >= 4:
                        session['status'] = 'interrupted'
                    else:
                        session['status'] = 'paused'
                elif action == 'resume' and session['status'] == 'paused':
                    session['status'] = 'active'
                elif action == 'complete' and session['status'] in ['active', 'paused']:
                    session['status'] = 'completed'
                    session['end_time'] = get_current_time()
                    
                    # Check if session is overdue
                    if session['start_time']:
                        start_time = datetime.datetime.fromisoformat(session['start_time'])
                        end_time = datetime.datetime.fromisoformat(session['end_time'])
                        duration_minutes = (end_time - start_time).total_seconds() / 60
                        
                        if duration_minutes > session['scheduled_duration'] * 1.1:
                            session['status'] = 'overdue'
                else:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": f"Cannot {action} session with status {session['status']}"}).encode())
                    return
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(session).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())
    
    # Handle GET requests
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        # Root endpoint
        if path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "message": "✅ DeepWork API is running!",
                "status": "online",
                "version": "1.0.0",
                "documentation": {
                    "swagger": "/docs",
                    "redoc": "/redoc"
                },
                "endpoints": {
                    "sessions": "/sessions",
                    "history": "/sessions/history"
                }
            }
            self.wfile.write(json.dumps(response).encode())
        
        # OpenAPI schema for SDK generation
        elif path == '/openapi.json':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Simple OpenAPI schema
            schema = {
                "openapi": "3.0.0",
                "info": {
                    "title": "DeepWork API",
                    "version": "1.0.0",
                    "description": "API for tracking deep work sessions"
                },
                "paths": {
                    "/sessions/": {
                        "post": {
                            "summary": "Create a new session",
                            "operationId": "create_session"
                        },
                        "get": {
                            "summary": "Get all sessions",
                            "operationId": "get_sessions"
                        }
                    },
                    "/sessions/{session_id}": {
                        "get": {
                            "summary": "Get a session by ID",
                            "operationId": "get_session"
                        }
                    },
                    "/sessions/{session_id}/start": {
                        "patch": {
                            "summary": "Start a session",
                            "operationId": "start_session"
                        }
                    },
                    "/sessions/{session_id}/pause": {
                        "patch": {
                            "summary": "Pause a session",
                            "operationId": "pause_session"
                        }
                    },
                    "/sessions/{session_id}/resume": {
                        "patch": {
                            "summary": "Resume a session",
                            "operationId": "resume_session"
                        }
                    },
                    "/sessions/{session_id}/complete": {
                        "patch": {
                            "summary": "Complete a session",
                            "operationId": "complete_session"
                        }
                    },
                    "/sessions/history": {
                        "get": {
                            "summary": "Get session history",
                            "operationId": "get_session_history"
                        }
                    },
                    "/sessions/{session_id}/interruptions": {
                        "get": {
                            "summary": "Get session interruptions",
                            "operationId": "get_session_interruptions"
                        }
                    }
                }
            }
            self.wfile.write(json.dumps(schema).encode())
        
        # Sessions endpoint
        elif path == '/sessions/' or path == '/sessions':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(SESSIONS).encode())
        
        # Single session endpoint
        elif path.startswith('/sessions/') and len(path.split('/')) == 3:
            try:
                session_id = int(path.split('/')[2])
                session = find_session(session_id)
                
                if session:
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(session).encode())
                else:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session not found"}).encode())
            except:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid session ID"}).encode())
        
        # Session history endpoint
        elif path == '/sessions/history':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Create history with more details
            history = []
            for session in SESSIONS:
                if session['status'] in ['completed', 'interrupted', 'abandoned', 'overdue']:
                    interruptions = get_interruptions_for_session(session['id'])
                    history_item = {
                        "id": session['id'],
                        "title": session['title'],
                        "status": session['status'],
                        "scheduled_duration": session['scheduled_duration'],
                        "actual_duration": 0,  # Calculate this based on start/end times
                        "interruption_count": len(interruptions),
                        "completion_date": session['end_time']
                    }
                    
                    # Calculate actual duration if available
                    if session['start_time'] and session['end_time']:
                        start_time = datetime.datetime.fromisoformat(session['start_time'])
                        end_time = datetime.datetime.fromisoformat(session['end_time'])
                        duration_minutes = (end_time - start_time).total_seconds() / 60
                        history_item['actual_duration'] = round(duration_minutes)
                    
                    history.append(history_item)
            
            self.wfile.write(json.dumps(history).encode())
        
        # Session interruptions endpoint
        elif path.startswith('/sessions/') and path.endswith('/interruptions'):
            try:
                parts = path.split('/')
                if len(parts) == 4 and parts[3] == 'interruptions':
                    session_id = int(parts[2])
                    interruptions = get_interruptions_for_session(session_id)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(interruptions).encode())
                else:
                    raise ValueError("Invalid path")
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        
        # Default response for unknown endpoints
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode())

# Start server
print(f"Starting server at http://localhost:{PORT}")
httpd = socketserver.TCPServer(("", PORT), APIHandler)
httpd.serve_forever()
