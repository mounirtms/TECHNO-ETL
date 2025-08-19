@echo off
echo ========================================
echo TECHNO-ETL SIMPLE DEPLOYMENT
echo Author: Mounir Abderrahmani
echo Email: mounir.ab@techno-dz.com
echo ========================================

echo [1/3] Fixing React errors and building...
call npm run deploy

echo [2/3] Starting backend...
start "Backend" cmd /k "cd backend\dist && npm install --production && npm run start:cluster"

echo [3/3] Starting frontend...
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "npm run preview"

echo ========================================
echo DEPLOYMENT COMPLETED
echo ========================================
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000/api/health
echo ========================================
echo Press any key to exit...
pause >nul