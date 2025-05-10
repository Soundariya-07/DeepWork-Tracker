from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Fix imports to work when running from within the app directory
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Now import with relative imports
from models.database import engine
from models.models import Base
from routers import sessions

# Create FastAPI app
app = FastAPI(
    title="DeepWork Session Tracker",
    description="Track and manage your deep work sessions to improve productivity",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(sessions.router)

@app.get("/")
async def root():
    return {
        "message": "✅ DeepWork Session Tracker API is running successfully!",
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
