@echo off
echo ===== Fixing and Running DeepWork App =====
echo.

echo Fixing ActiveSession.js file...
copy /Y "frontend\src\pages\ActiveSession.fixed.js" "frontend\src\pages\ActiveSession.js"

echo.
echo ===== Starting Backend Server =====
echo.
start cmd /k "cd backend && venv\Scripts\activate.bat && cd app && python -m uvicorn main:app --reload --port 8000"

echo.
echo ===== Starting Frontend Server =====
echo.
start cmd /k "cd frontend && set DISABLE_ESLINT_PLUGIN=true && npm start"

echo.
echo ===== DeepWork App Started =====
echo.
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Check the opened command windows for any errors.
