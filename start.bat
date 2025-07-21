@echo off
echo Starting Techno-ETL Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "npm run server"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server...
start "Frontend Dev" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:80
echo.
echo Press any key to exit...
pause >nul
