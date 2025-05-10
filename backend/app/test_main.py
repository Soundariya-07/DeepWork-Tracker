from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create a simple test app
app = FastAPI(title="DeepWork Test API")

# Configure CORS - this is critical for allowing frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint to test if API is working"""
    return {
        "message": "✅ DeepWork Test API is running!",
        "status": "online"
    }

@app.get("/test-data")
async def test_data():
    """Endpoint that returns test data for the frontend"""
    return {
        "sessions": [
            {
                "id": 1,
                "title": "Sample Deep Work Session",
                "description": "This is a test session",
                "status": "scheduled",
                "scheduled_duration": 60,
                "start_time": None,
                "end_time": None
            }
        ]
    }
