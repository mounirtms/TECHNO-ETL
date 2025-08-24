#!/bin/bash
echo "========================================"
echo "TECHNO-ETL SIMPLE DEPLOYMENT"
echo "Author: Mounir Abderrahmani"
echo "Email: mounir.ab@techno-dz.com"
echo "========================================"

echo "[1/3] Fixing React errors and building..."
npm run deploy

echo "[2/3] Starting backend..."
cd backend/dist
npm install --production
npm run start:cluster &
cd ../..

echo "[3/3] Starting frontend..."
sleep 3
npm run preview &

echo "========================================"
echo "DEPLOYMENT COMPLETED"
echo "========================================"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000/api/health"
echo "========================================"