#!/bin/bash

echo "Starting Techno-ETL Development Environment..."
echo

echo "Starting Backend Server..."
npm run server &
BACKEND_PID=$!

echo "Waiting 3 seconds for backend to start..."
sleep 3

echo "Starting Frontend Development Server..."
npm run dev &
FRONTEND_PID=$!

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:82"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
