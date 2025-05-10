@echo off
echo ===== Resetting DeepWork Database and Starting Servers =====
echo.

echo Stopping any running servers on port 8090...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8090') do (
    echo Found process: %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo Waiting for processes to terminate...
timeout /t 2 /nobreak > nul

echo Deleting existing database...
if exist deepwork.db del /f deepwork.db

echo.
echo Creating new database with sample data...
python add_sample_data.py

echo.
echo Starting backend server...
start cmd /k python fixed_sqlite_server.py

echo.
echo Starting frontend server...
cd frontend
start cmd /k npm start

echo.
echo ===== DeepWork App is Running =====
echo Backend: http://localhost:8090
echo Frontend: http://localhost:3000
echo.
echo Press Enter to close this window

pause
