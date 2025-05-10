@echo off
echo ===== Starting DeepWork Fixed SQLite Server =====
echo.
echo This server uses SQLite to store all session data
echo Database file: %CD%\deepwork.db
echo.
echo Press Ctrl+C to stop the server

python fixed_sqlite_server.py

pause
