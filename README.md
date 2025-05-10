<<<<<<< HEAD
# DeepWork Tracker

A full-stack application to track and manage deep work sessions, helping users maintain focus and productivity.

## Features

- 📝 Create and manage tasks with detailed information
- ⏱️ Track time spent on tasks with a Pomodoro timer
- 📊 Visualize your productivity with elegant charts
- 🔄 State-based task workflow (todo → in_progress → paused → completed)
- 📱 Responsive design for desktop and mobile

## Tech Stack

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLAlchemy ORM**: SQL toolkit and Object-Relational Mapping
- **SQLite**: Lightweight, file-based database
- **Alembic**: Database migration tool
- **Pydantic**: Data validation and settings management

### Frontend
- **React.js**: JavaScript library for building user interfaces
- **Chakra UI**: Component library for styling
- **React Router**: Navigation and routing
- **Axios**: HTTP client for API requests
- **React Icons**: Icon library

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Setup

1. Clone the repository
2. Run the setup script: `setupdev.bat`
   - This will create a Python virtual environment
   - Install backend dependencies
   - Set up the database with Alembic migrations
   - Install frontend dependencies
3. Start the application: `runapplication.bat`
   - This will start both the backend and frontend servers
   - Open the application in your default browser

## Application Structure

### Backend

```
backend/
├── alembic/            # Database migration scripts
├── app/
│   ├── models/         # Database models
│   ├── routers/        # API route definitions
│   ├── crud.py         # Database operations
│   ├── main.py         # Application entry point
│   └── schemas.py      # Pydantic schemas for validation
└── requirements.txt    # Python dependencies
```

### Frontend

```
frontend/
├── public/             # Static files
└── src/
    ├── components/     # Reusable UI components
    ├── pages/          # Application pages
    ├── services/       # API service functions
    └── theme.js        # Chakra UI theme customization
```

## API Endpoints

- `POST /sessions/`: Schedule a new work session
- `PATCH /sessions/{session_id}/start`: Start a session
- `PATCH /sessions/{session_id}/pause`: Pause a session (with interruption reason)
- `PATCH /sessions/{session_id}/resume`: Resume a paused session
- `PATCH /sessions/{session_id}/complete`: Mark a session as completed
- `GET /sessions/history`: Get a summary of past sessions

## Session States

- **Scheduled**: Initial state when a session is created
- **Active**: Session is currently in progress
- **Paused**: Session has been temporarily paused
- **Completed**: Session has been successfully completed
- **Interrupted**: Session has been paused more than 3 times
- **Abandoned**: Session was paused but never resumed
- **Overdue**: Session exceeded its scheduled duration by more than 10%

## Development

### Backend

The backend is built with FastAPI and uses SQLite for data storage. To run the backend separately:

```bash
cd backend
venv\Scripts\activate
cd app
uvicorn main:app --reload --port 8000
```

### Frontend

The frontend is built with React and Chakra UI. To run the frontend separately:

```bash
cd frontend
npm start
```

## API Documentation

Once the backend is running, you can access:
- Interactive API documentation: http://localhost:8000/docs
- Alternative documentation: http://localhost:8000/redoc

## Screenshots

[Screenshots will be added here]

## License

MIT License
=======
# DeepWork-Tracker
>>>>>>> 04d44a675dfe4b59cc02bb1d267f7f9dfc46fbba
