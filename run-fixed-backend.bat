@echo off
echo ===== Running DeepWork Backend with Fixed Imports =====
echo.

cd backend
call venv\Scripts\activate.bat

cd app
python -m uvicorn main:app --reload --port 8000
