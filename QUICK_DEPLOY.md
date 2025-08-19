# TECHNO-ETL Quick Deployment Guide

## 🚀 Quick Start

### 1. Frontend Development
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Backend Development
```bash
cd backend
npm install
npm run dev
# API available at http://localhost:5000
```

### 3. Production Build
```bash
# Build frontend
npm run build

# Build backend
cd backend
node build-optimized.js

# Deploy backend
cd dist
npm install --production
npm run start:cluster
```

## 🔧 Fixes Applied

✅ React scheduler error fixed
✅ PM2 configuration corrected
✅ Cron system implemented
✅ Error boundaries added
✅ Build process optimized

## 🏥 Health Checks

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health
- API Docs: http://localhost:5000/api-docs

## 📞 Support

**Developer:** Mounir Abderrahmani  
**Email:** mounir.ab@techno-dz.com
