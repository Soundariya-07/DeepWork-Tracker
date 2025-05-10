import http.server
import socketserver
import json
import urllib.parse
import datetime
import sqlite3
import os
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

# Helper functions
def get_current_time():
    """Get current timestamp in ISO format"""
    return datetime.datetime.now().isoformat()

def dict_factory(cursor, row):
    """Convert SQLite row to dictionary"""
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def get_db_connection():
    """Get database connection with row factory"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = dict_factory
    return conn

def find_session(session_id):
    """Find session by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
    session = cursor.fetchone()
    conn.close()
    return session

def get_interruptions_for_session(session_id):
    """Get interruptions for a session"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interruptions WHERE session_id = ?", (session_id,))
    interruptions = cursor.fetchall()
    conn.close()
    return interruptions

def update_interruption_count(session_id):
    """Update the interruption count for a session"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM interruptions WHERE session_id = ?", (session_id,))
    count = cursor.fetchone()['count']
    cursor.execute("UPDATE sessions SET interruption_count = ? WHERE id = ?", (count, session_id))
    conn.commit()
    conn.close()

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
                session_id = str(uuid.uuid4())
                
                conn = get_db_connection()
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO sessions 
                    (id, title, goal, status, scheduled_duration, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?)
                    """, 
                    (
                        session_id, 
                        data.get("title", "Untitled Session"),
                        data.get("goal", ""),
                        "scheduled",
                        data.get("scheduled_duration", 30),
                        get_current_time()
                    )
                )
                conn.commit()
                
                # Get the newly created session
                cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
                new_session = cursor.fetchone()
                conn.close()
                
                self.send_response(201)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(new_session).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    # Handle PATCH requests
    def do_PATCH(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        # Start session endpoint
        if path.endswith('/start'):
            try:
                session_id = path.split('/')[-2]
                session = find_session(session_id)
                
                if not session:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session not found"}).encode())
                    return
                
                if session['status'] != 'scheduled':
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session can only be started from scheduled state"}).encode())
                    return
                
                # Update session status to active
                conn = get_db_connection()
                cursor = conn.cursor()
                current_time = get_current_time()
                cursor.execute(
                    "UPDATE sessions SET status = ?, started_at = ? WHERE id = ?",
                    ("active", current_time, session_id)
                )
                conn.commit()
                
                # Get updated session
                cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
                updated_session = cursor.fetchone()
                conn.close()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(updated_session).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        
        # Pause session endpoint
        elif path.endswith('/pause'):
            try:
                session_id = path.split('/')[-2]
                session = find_session(session_id)
                
                if not session:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session not found"}).encode())
                    return
                
                if session['status'] != 'active':
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session can only be paused from active state"}).encode())
                    return
                
                # Get reason from request body
                data = self.parse_request_body()
                reason = data.get('reason', 'No reason provided')
                
                # Create interruption record
                interruption_id = str(uuid.uuid4())
                current_time = get_current_time()
                
                conn = get_db_connection()
                cursor = conn.cursor()
                
                # Add interruption
                cursor.execute(
                    """
                    INSERT INTO interruptions 
                    (id, session_id, reason, start_time) 
                    VALUES (?, ?, ?, ?)
                    """, 
                    (interruption_id, session_id, reason, current_time)
                )
                
                # Update session status
                cursor.execute(
                    "UPDATE sessions SET status = ?, paused_at = ? WHERE id = ?",
                    ("paused", current_time, session_id)
                )
                conn.commit()
                
                # Update interruption count
                update_interruption_count(session_id)
                
                # Get updated session
                cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
                updated_session = cursor.fetchone()
                conn.close()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(updated_session).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        
        # Resume session endpoint
        elif path.endswith('/resume'):
            try:
                session_id = path.split('/')[-2]
                session = find_session(session_id)
                
                if not session:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session not found"}).encode())
                    return
                
                if session['status'] != 'paused':
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session can only be resumed from paused state"}).encode())
                    return
                
                # Update the latest interruption with end time
                conn = get_db_connection()
                cursor = conn.cursor()
                current_time = get_current_time()
                
                # Find the latest interruption without an end time
                cursor.execute(
                    """
                    SELECT id FROM interruptions 
                    WHERE session_id = ? AND end_time IS NULL 
                    ORDER BY start_time DESC LIMIT 1
                    """, 
                    (session_id,)
                )
                latest_interruption = cursor.fetchone()
                
                if latest_interruption:
                    # Update the interruption with end time
                    cursor.execute(
                        "UPDATE interruptions SET end_time = ? WHERE id = ?",
                        (current_time, latest_interruption['id'])
                    )
                
                # Update session status
                cursor.execute(
                    "UPDATE sessions SET status = ?, paused_at = NULL WHERE id = ?",
                    ("active", session_id)
                )
                conn.commit()
                
                # Get updated session
                cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
                updated_session = cursor.fetchone()
                conn.close()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(updated_session).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        
        # Complete session endpoint
        elif path.endswith('/complete'):
            try:
                session_id = path.split('/')[-2]
                session = find_session(session_id)
                
                if not session:
                    self.send_response(404)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session not found"}).encode())
                    return
                
                if session['status'] not in ['active', 'paused']:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"error": "Session can only be completed from active or paused state"}).encode())
                    return
                
                # Calculate actual duration
                conn = get_db_connection()
                cursor = conn.cursor()
                current_time = get_current_time()
                
                # If the session was started
                if session['started_at']:
                    start_time = datetime.datetime.fromisoformat(session['started_at'])
                    end_time = datetime.datetime.fromisoformat(current_time)
                    duration_minutes = (end_time - start_time).total_seconds() / 60
                    
                    # Subtract interruption times if any
                    cursor.execute(
                        """
                        SELECT SUM((julianday(IFNULL(end_time, ?)) - julianday(start_time)) * 1440) as total_interruption_minutes
                        FROM interruptions
                        WHERE session_id = ?
                        """,
                        (current_time, session_id)
                    )
                    result = cursor.fetchone()
                    interruption_minutes = result['total_interruption_minutes'] or 0
                    
                    actual_duration = max(0, round(duration_minutes - interruption_minutes))
                else:
                    actual_duration = 0
                
                # Update session
                cursor.execute(
                    """
                    UPDATE sessions 
                    SET status = ?, completed_at = ?, actual_duration = ? 
                    WHERE id = ?
                    """,
                    ("completed", current_time, actual_duration, session_id)
                )
                conn.commit()
                
                # Get updated session
                cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
                updated_session = cursor.fetchone()
                conn.close()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(updated_session).encode())
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
    
    # Handle GET requests
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        
        # Root endpoint
        if path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                "message": "✅ DeepWork API is running!",
                "status": "online",
                "version": "1.0.0"
            }).encode())
        
        # All sessions endpoint
        elif path == '/sessions/' or path == '/sessions':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sessions ORDER BY created_at DESC")
            sessions = cursor.fetchall()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(sessions).encode())
        
        # Single session endpoint
        elif path.startswith('/sessions/') and len(path.split('/')) == 3:
            try:
                session_id = path.split('/')[2]
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
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
        
        # Session history endpoint
        elif path == '/sessions/history':
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM sessions 
                WHERE status IN ('completed', 'interrupted', 'abandoned', 'overdue')
                ORDER BY completed_at DESC
                """
            )
            history = cursor.fetchall()
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(history).encode())
        
        # Session interruptions endpoint
        elif path.startswith('/sessions/') and path.endswith('/interruptions'):
            try:
                parts = path.split('/')
                if len(parts) == 4 and parts[3] == 'interruptions':
                    session_id = parts[2]
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
if __name__ == "__main__":
    print(f"Starting server at http://localhost:{PORT}")
    print(f"Database file: {os.path.abspath(DB_PATH)}")
    httpd = socketserver.TCPServer(("", PORT), APIHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
