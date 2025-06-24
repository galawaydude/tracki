@echo off
ECHO --- Tracki Application Starter for Windows ---

REM Stop any running containers from a previous session
ECHO --- Stopping existing containers... ---
docker-compose down --remove-orphans

REM Section 1: Start the database
ECHO --- Starting PostgreSQL database in the background... ---
docker-compose up -d

REM Section 2: Start the backend in a new terminal window
ECHO --- Starting backend server in a new window... ---
START "Backend" cmd /k "cd backend && echo setting up backend... && python -m venv venv && .\\venv\\Scripts\\activate && echo installing backend dependencies... && pip install -r requirements.txt && echo starting flask server... && flask run --port=5001"

REM Section 3: Start the frontend in a new terminal window
ECHO --- Starting frontend server in a new window... ---
START "Frontend" cmd /k "cd frontend && echo installing frontend dependencies... && npm install && echo starting next.js dev server... && npm run dev"

ECHO.
ECHO =======================================
ECHO All services are starting up in separate windows.
ECHO Frontend will be available at http://localhost:3000
ECHO Backend will be available at http://127.0.0.1:5001
ECHO =======================================
ECHO.
ECHO You can close this window. To stop all services, close the Backend and Frontend windows and run 'docker-compose down'.

pause 