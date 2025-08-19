#!/bin/bash
echo "========================================"
echo "TECHNO-ETL FIXED DEPLOYMENT"
echo "Author: Mounir Abderrahmani"
echo "========================================"

echo "[1/3] Fixing build issues..."
node fix-build-issues.js

echo "[2/3] Starting backend services..."
cd dist_unified/backend
npm install --production
npm run start:cluster
cd ../..

echo "[3/3] Frontend is ready to serve..."
echo ""
echo "========================================"
echo "DEPLOYMENT COMPLETED"
echo "========================================"
echo "Frontend: cd dist_unified/frontend && npx serve -s . -p 3000"
echo "Backend: http://localhost:5000/api/health"
echo "API Docs: http://localhost:5000/api-docs"
echo ""
echo "To start frontend:"
echo "cd dist_unified/frontend"
echo "npx serve -s . -p 3000"
echo "========================================"
echo "Built by: Mounir Abderrahmani"
echo "Email: mounir.ab@techno-dz.com"
echo "========================================"