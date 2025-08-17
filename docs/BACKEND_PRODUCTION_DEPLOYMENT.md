# TECHNO-ETL Backend Production Deployment

**Author:** Mounir Abderrahmani  
**Email:** mounir.ab@techno-dz.com  
**Last Updated:** 2025-08-16

---

## 🎯 **DEPLOYMENT SUMMARY**

### **✅ Issues Fixed:**
- **NODE_ENV=development** → **NODE_ENV=production** ✅
- **Redis URL not set warnings** → **Proper Redis configuration** ✅
- **Multiple build systems** → **Single unified build** ✅
- **Manual deployment steps** → **Automated deployment** ✅
- **Missing cron system** → **Professional cron jobs** ✅

### **🚀 Single Command Deployment:**
```bash
# 1. Build production
cd backend && npm run build:production

# 2. Deploy
cd dist && ./deploy.bat
```

---

## 📊 **PRODUCTION FEATURES**

### **🔧 Optimized Build System:**
- **Single Build Location:** `backend/dist/` (no more multiple folders)
- **Production Environment:** Proper NODE_ENV=production
- **Optimized Dependencies:** Production-only packages
- **ES Module Support:** Fixed ES module compatibility
- **PM2 Integration:** Professional process management

### **🕐 Automated Cron Jobs:**
| Job | Schedule | Purpose |
|-----|----------|---------|
| Price Sync | Every 6 hours | MDM → Magento price updates |
| Stock Sync | Every 4 hours | Inventory level synchronization |
| Inventory Sync | Daily 2 AM | Full inventory reconciliation |

### **📈 Performance Optimizations:**
- **Cluster Mode:** Uses all CPU cores
- **Memory Management:** 1GB limit per process
- **Connection Pooling:** Optimized database connections
- **Caching:** Redis support with fallback
- **Logging:** Structured logging with rotation

---

## 🔧 **PRODUCTION COMMANDS**

### **Build & Deploy:**
```bash
npm run build:production    # Build optimized production version
cd dist && ./deploy.bat     # Deploy with all services
```

### **Service Management:**
```bash
npm run start:cluster      # Start API cluster
npm run start:cron         # Start cron jobs
npm run status             # Check all processes
npm run logs               # View all logs
npm run health             # Health check
```

### **Monitoring:**
```bash
npm run monit              # Real-time monitoring
npm run logs:cron          # Cron job logs
pm2 list                   # Process list
```

---

## 🏥 **HEALTH MONITORING**

### **Endpoints:**
- **Health:** http://localhost:5000/api/health
- **Metrics:** http://localhost:5000/api/metrics  
- **API Docs:** http://localhost:5000/api-docs

### **Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-08-16T14:29:27.011Z",
  "environment": "production",
  "uptime": 300,
  "database": "connected",
  "magento": "authenticated"
}
```

---

## ⚙️ **ENVIRONMENT CONFIGURATION**

### **Production .env (Auto-generated):**
```env
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database connections
SQL_CEGID_SERVER_INSTANCE=CVS196CgStandBy
SQL_MDM_SERVER_INSTANCE=C-VS003-SQL

# Redis (optional but recommended)
# REDIS_URL=redis://localhost:6379

# Cron configuration
ENABLE_CRON=true
CRON_TIMEZONE=Europe/Paris
PRICE_SYNC_CRON=0 */6 * * *
STOCK_SYNC_CRON=0 */4 * * *
INVENTORY_SYNC_CRON=0 2 * * *

# Performance tuning
MAX_MEMORY=1024
DB_POOL_MAX=10
RATE_LIMIT_MAX=100
```

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues & Solutions:**

#### **1. "development" mode showing:**
✅ **Fixed:** Build now creates proper production environment

#### **2. "Redis URL not set" warnings:**
✅ **Fixed:** Proper Redis configuration with fallback to in-memory cache

#### **3. PM2 ES module errors:**
✅ **Fixed:** Using `.cjs` extension for PM2 compatibility

#### **4. Multiple build folders confusion:**
✅ **Fixed:** Single unified build in `backend/dist/`

### **Quick Fixes:**
```bash
# Reset everything
pm2 kill
cd backend && npm run build:production
cd dist && ./deploy.bat

# Check status
npm run status
npm run health
```

---

## 📁 **PROJECT STRUCTURE**

### **Development:**
```
backend/
├── server.js              # Main server
├── package.json           # Dev + prod dependencies
├── build-optimized.js     # Production build script
└── src/                   # Source code
```

### **Production (after build):**
```
backend/dist/
├── server.js              # Production server
├── package.json           # Production dependencies only
├── ecosystem.config.cjs   # PM2 configuration
├── .env                   # Production environment
├── deploy.bat             # Deployment script
├── src/                   # Source code
│   └── cron/              # Cron job system
├── logs/                  # Application logs
└── swagger/               # API documentation
```

---

## 🎯 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment:**
- [ ] Node.js >= 18.0.0 installed
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Database servers accessible
- [ ] Port 5000 available

### **Deployment Steps:**
- [ ] `cd backend`
- [ ] `npm run build:production`
- [ ] `cd dist`
- [ ] `./deploy.bat` (Windows) or `./deploy.sh` (Linux)
- [ ] `npm run status` (verify all processes running)
- [ ] `npm run health` (verify API responding)

### **Post-Deployment Verification:**
- [ ] API health: http://localhost:5000/api/health
- [ ] Swagger docs: http://localhost:5000/api-docs
- [ ] Logs show "production" environment
- [ ] Cron jobs scheduled: `pm2 list techno-etl-cron`
- [ ] No Redis warnings (if Redis configured)

---

## 📞 **SUPPORT**

### **Contact:**
- **Developer:** Mounir Abderrahmani
- **Email:** mounir.ab@techno-dz.com
- **Support:** mounir.webdev.tms@gmail.com

### **Documentation:**
- **Full Guide:** [COMPREHENSIVE_DEPLOYMENT_GUIDE.md](./COMPREHENSIVE_DEPLOYMENT_GUIDE.md)
- **API Docs:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/api/health

---

## 🎉 **SUCCESS METRICS**

### **Deployment Successful When:**
- ✅ Server shows `NODE_ENV=production`
- ✅ No Redis warnings (if configured)
- ✅ All PM2 processes running
- ✅ Health check returns `{"status":"ok"}`
- ✅ Cron jobs scheduled and active
- ✅ API documentation accessible

### **Performance Targets:**
- **Response Time:** < 500ms average
- **Memory Usage:** < 80% system memory  
- **Uptime:** > 99.9%
- **Error Rate:** < 1%

---

**🚀 Your TECHNO-ETL Backend is now professionally deployed with automated cron jobs, performance monitoring, and production optimizations!**

**Built with ❤️ by Mounir Abderrahmani**