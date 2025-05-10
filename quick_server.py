import http.server
import json
import socketserver
from urllib.parse import urlparse, parse_qs

# Define port
PORT = 8000

# Sample data
SESSIONS = [
    {
        "id": 1,
        "title": "Deep Work Session",
        "description": "Focus on important tasks",
        "status": "scheduled",
        "scheduled_duration": 60,
        "start_time": None,
        "end_time": None
    },
    {
        "id": 2,
        "title": "Research Session",
        "description": "Research new technologies",
        "status": "completed",
        "scheduled_duration": 45,
        "start_time": "2025-05-09T10:00:00",
        "end_time": "2025-05-09T10:45:00"
    }
]

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        # Parse URL
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # Set content type to JSON
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        # Root endpoint
        if path == '/':
            response = {
                "message": "✅ DeepWork API is running!",
                "status": "online"
            }
        
        # Sessions endpoint
        elif path == '/sessions/' or path == '/sessions':
            response = SESSIONS
        
        # Session history endpoint
        elif path == '/sessions/history':
            response = [
                {
                    "id": 2,
                    "title": "Research Session",
                    "status": "completed",
                    "scheduled_duration": 45,
                    "actual_duration": 45,
                    "interruption_count": 0,
                    "completion_date": "2025-05-09T10:45:00"
                }
            ]
        
        # Single session endpoint
        elif path.startswith('/sessions/') and len(path.split('/')) > 2:
            session_id = int(path.split('/')[2])
            session = next((s for s in SESSIONS if s["id"] == session_id), None)
            if session:
                response = session
            else:
                response = {"error": "Session not found"}
        
        # Session interruptions endpoint
        elif path.startswith('/sessions/') and path.endswith('/interruptions'):
            response = []
        
        # Default response
        else:
            response = {"error": "Endpoint not found"}
        
        # Send JSON response
        self.wfile.write(json.dumps(response).encode())
        return

print(f"Starting server at http://localhost:{PORT}")
print("Press Ctrl+C to stop")

# Create and start the server
with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
