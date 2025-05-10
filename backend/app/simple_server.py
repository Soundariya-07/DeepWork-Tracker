from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Create a simple app with no dependencies on other modules
app = FastAPI(title="DeepWork Simple API")

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "✅ DeepWork Simple API is running!",
        "status": "online",
        "version": "1.0.0"
    }

# Sessions endpoint that returns dummy data
@app.get("/sessions/")
async def get_sessions():
    return [
        {
            "id": 1,
            "title": "Deep Work on Project X",
            "description": "Focus on implementing core features",
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

# Session history endpoint
@app.get("/sessions/history")
async def get_session_history():
    return [
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

# Run the server directly if this file is executed
if __name__ == "__main__":
    uvicorn.run("simple_server:app", host="127.0.0.1", port=8000, reload=True)
