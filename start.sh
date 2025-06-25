#!/bin/bash

echo "--- Tearing down old containers to ensure a clean start ---"
docker-compose down --remove-orphans

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Cleanup function ---
cleanup() {
    echo ""
    echo "Shutting down services..."
    # Stop the frontend and backend processes if their PIDs are set
    if [ -n "$FRONTEND_PID" ]; then kill $FRONTEND_PID; fi
    if [ -n "$BACKEND_PID" ]; then kill $BACKEND_PID; fi
    # Stop the database container
    docker-compose down
    echo "Cleanup complete."
}

# Trap the EXIT signal to run the cleanup function when the script ends
trap cleanup EXIT

# 1. Start the database
echo "Starting PostgreSQL database..."
docker-compose up -d

# 2. Set up and run the backend
echo "Setting up and starting the backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py &
BACKEND_PID=$!
cd ..

# 3. Set up and run the frontend
echo "Setting up and starting the frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================="
echo "All services are starting up."
echo "Frontend available at http://localhost:3000"
echo "Backend available at http://127.0.0.1:5001"
echo ""
echo "Press Ctrl+C to shut down all services."
echo "======================================="

# Wait for the background processes to finish
wait $FRONTEND_PID
wait $BACKEND_PID 