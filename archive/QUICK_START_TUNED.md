# TECHNO-ETL Quick Start Guide

**Author:** Mounir Abderrahmani  
**Email:** mounir.ab@techno-dz.com  
**Updated:** 2025-08-18T16:04:09.066Z

## 🚀 Development Environment Setup

### Port Configuration (Applied ✅)
- **Frontend:** Port 80 (Vite dev server)
- **Backend:** Port 5000 (Express API server)
- **Proxy:** All /api/* requests route to backend

### Quick Commands

#### Start Development Environment:
```bash
# Option 1: Both services together
npm run dev

# Option 2: Separate terminals
npm run start        # Frontend on port 80
npm run server       # Backend on port 5000
```

#### Validate Environment:
```bash
node validate-environment.js
```

#### Build & Deploy:
```bash
# Complete optimized build
node build-complete-optimized.js

# Fix any build issues
node fix-build-issues.js

# Apply all tunings
node apply-project-tunings.js
```

## 🔧 Applied Optimizations

### ✅ Port Standardization
- Frontend runs on port 80 for consistency
- Backend runs on port 5000 for API services
- Vite proxy routes all API calls correctly

### ✅ Service Routing
- Dashboard API uses localhost:5000/api base URL
- Magento services route through backend proxy
- Intelligent service routing with fallbacks

### ✅ UI Component Fixes
- TooltipWrapper component handles disabled buttons
- BaseToolbar uses proper Material-UI patterns
- Fixed deprecated prop warnings

### ✅ Build System
- Optimized Vite configuration
- React scheduler error fixes
- Advanced chunk splitting
- Production minification

## 🏥 Health Checks

### URLs to Test:
- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:5000/api/health
- **Proxied API:** http://localhost:80/api/health

### Expected Behavior:
1. Frontend loads without React errors
2. Backend API responds with health status
3. Frontend can communicate with backend through proxy
4. No Material-UI Tooltip warnings in console

## 🔍 Troubleshooting

### Port Conflicts:
```bash
# Check what's using port 80
netstat -ano | findstr :80

# Check what's using port 5000
netstat -ano | findstr :5000
```

### Service Issues:
```bash
# Restart development environment
npm run dev

# Check backend logs
cd backend && npm run logs

# Validate configuration
node validate-environment.js
```

### Build Issues:
```bash
# Clean and rebuild
npm run clean
npm run build

# Fix React errors
node fix-build-issues.js
```

## 📊 Performance Metrics

The applied tunings provide:
- **Faster Development:** Optimized HMR and proxy
- **Better UX:** Fixed UI component errors
- **Reliable Routing:** Consistent API communication
- **Production Ready:** Optimized build process

---

**🎯 All tunings have been successfully applied!**

**Built by:** Mounir Abderrahmani  
**Support:** mounir.ab@techno-dz.com
