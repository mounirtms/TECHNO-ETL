# TECHNO-ETL Backend - Comprehensive Deployment Guide

**Author:** Mounir Abderrahmani  
**Email:** mounir.ab@techno-dz.com  
**Contact:** mounir.webdev.tms@gmail.com  
**Version:** 2.0.0 - Optimized Production System

---

## 🎯 **SINGLE UNIFIED BUILD SYSTEM**

We have **consolidated all build methods** into ONE optimized system:

### **✅ What's Fixed:**
- ❌ **Removed:** Multiple build systems (webpack, dist_prod, etc.)
- ✅ **Unified:** Single `backend/dist/` production build
- ✅ **Fixed:** NODE_ENV=production (no more development mode)
- ✅ **Fixed:** Redis warnings with proper configuration
- ✅ **Added:** Comprehensive cron job system
- ✅ **Added:** Professional PM2 configuration

---

## 🚀 **QUICK DEPLOYMENT (2 Commands)**

### **Step 1: Build Production**
```bash
cd backend
npm run build:production
```

### **Step 2: Deploy**
```bash
cd dist
./deploy.bat    # Windows
# or
./deploy.sh     # Linux/Mac
```

**That's it! Your production server is running!** 🎉

---

## 📋 **DETAILED DEPLOYMENT PROCESS**

### **1. Prerequisites**
- **Node.js:** >= 18.0.0
- **NPM:** >= 8.0.0
- **PM2:** `npm install -g pm2` (for cluster mode)
- **Database:** SQL Server accessible
- **Redis:** Optional but recommended

### **2. Environment Setup**

The build automatically creates a production `.env` file with:

```env
# ENVIRONMENT
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# DATABASE CONNECTIONS
SQL_CEGID_SERVER_INSTANCE=CVS196CgStandBy
SQL_CEGID_SERVER_DATABASE=DBRETAIL01
SQL_MDM_SERVER_INSTANCE=C-VS003-SQL
SQL_MDM_SERVER_DATABASE=MDM_REPORT

# REDIS (Optional)
# REDIS_URL=redis://localhost:6379

# CRON CONFIGURATION
ENABLE_CRON=true
CRON_TIMEZONE=Europe/Paris
PRICE_SYNC_CRON=0 */6 * * *
STOCK_SYNC_CRON=0 */4 * * *
INVENTORY_SYNC_CRON=0 2 * * *

# PERFORMANCE TUNING
MAX_MEMORY=1024
DB_POOL_MAX=10
RATE_LIMIT_MAX=100
```

### **3. Build Process Details**

The optimized build (`npm run build:production`) does:

1. **Cleans** all previous builds
2. **Creates** unified `backend/dist/` directory
3. **Copies** source files and directories
4. **Generates** production environment configuration
5. **Creates** optimized package.json with production dependencies only
6. **Sets up** PM2 configuration for API + Cron
7. **Installs** cron job system
8. **Creates** deployment scripts

### **4. Production Directory Structure**

```
backend/dist/
├── server.js                 # Main server (ES modules)
├── package.json              # Production dependencies only
├── ecosystem.config.cjs      # PM2 configuration (CommonJS)
├── .env                      # Production environment
├── deploy.bat               # Windows deployment
├── deploy.sh                # Linux deployment
├── README.md                # Production documentation
├── src/                     # Source code
│   ├── cron/               # Cron job system
│   │   └── cron-runner.js  # Automated tasks
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── swagger/                 # API documentation
├── logs/                    # Application logs
└── uploads/                 # File uploads
```

---

## 🕐 **CRON JOB SYSTEM**

### **Automated Tasks:**

| Task | Schedule | Description |
|------|----------|-------------|
| **Price Sync** | Every 6 hours (`0 */6 * * *`) | Synchronize prices from MDM to Magento |
| **Stock Sync** | Every 4 hours (`0 */4 * * *`) | Update stock levels |
| **Inventory Sync** | Daily at 2 AM (`0 2 * * *`) | Full inventory synchronization |

### **Cron Management:**

```bash
# Start cron jobs
npm run start:cron

# View cron logs
npm run logs:cron

# Check cron status
pm2 list techno-etl-cron

# Restart cron jobs
pm2 restart techno-etl-cron
```

### **Custom Cron Configuration:**

Edit `.env` file:
```env
PRICE_SYNC_CRON=0 */6 * * *     # Every 6 hours
STOCK_SYNC_CRON=0 */4 * * *     # Every 4 hours
INVENTORY_SYNC_CRON=0 2 * * *   # Daily at 2 AM
CRON_TIMEZONE=Europe/Paris      # Timezone
```

---

## 🔧 **PRODUCTION COMMANDS**

### **Service Management:**
```bash
# Start all services
npm run deploy                 # Full deployment

# Individual services
npm run start:cluster         # API cluster
npm run start:cron           # Cron jobs only
npm start                    # Single instance

# Control services
npm run stop                 # Stop all
npm run restart              # Restart all
npm run reload               # Zero-downtime reload
```

### **Monitoring:**
```bash
# Check status
npm run status               # All processes
pm2 list                    # PM2 processes

# View logs
npm run logs                # All logs
npm run logs:cron           # Cron logs only
pm2 logs techno-etl-api     # API logs only

# Real-time monitoring
npm run monit               # PM2 monitor
```

### **Health Checks:**
```bash
# API health
npm run health
curl http://localhost:5000/api/health

# Endpoints
http://localhost:5000/api/health      # Health check
http://localhost:5000/api/metrics     # Performance metrics
http://localhost:5000/api-docs        # Swagger documentation
```

---

## 📊 **PERFORMANCE TUNING**

### **PM2 Configuration:**

```javascript
// ecosystem.config.cjs
{
  name: 'techno-etl-api',
  instances: 'max',              // Use all CPU cores
  exec_mode: 'cluster',          // Cluster mode
  max_memory_restart: '1G',      // Restart if > 1GB
  node_args: '--max-old-space-size=1024 --expose-gc'
}
```

### **Environment Tuning:**

```env
# Memory limits
MAX_MEMORY=1024
HEAP_SIZE=512

# Database pooling
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_TIMEOUT=30000

# Rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### **Redis Configuration (Recommended):**

```env
# Enable Redis for better performance
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues:**

#### **1. Server Won't Start**
```bash
# Check Node.js version
node --version    # Should be >= 18.0.0

# Check port availability
netstat -an | findstr :5000

# Kill existing processes
taskkill /F /IM node.exe    # Windows
pkill -f node              # Linux
```

#### **2. PM2 Issues**
```bash
# Reset PM2
pm2 kill
pm2 start ecosystem.config.cjs

# Check PM2 status
pm2 status
pm2 logs
```

#### **3. Database Connection Issues**
```bash
# Check environment variables
cat .env | grep SQL_

# Test database connectivity
npm run health
```

#### **4. Cron Jobs Not Running**
```bash
# Check cron process
pm2 list techno-etl-cron

# View cron logs
npm run logs:cron

# Restart cron
pm2 restart techno-etl-cron
```

### **Log Analysis:**

```bash
# API logs
tail -f logs/api-combined.log

# Cron logs
tail -f logs/cron-combined.log

# Error logs only
tail -f logs/api-error.log
tail -f logs/cron-error.log
```

---

## 🔒 **SECURITY CONFIGURATION**

### **Production Security:**

```env
# Strong secrets
ACCESS_TOKEN_SECRET=your-strong-secret-here
REFRESH_TOKEN_SECRET=your-strong-refresh-secret
SESSION_SECRET=your-session-secret

# CORS configuration
CORS_ORIGIN=https://your-frontend-domain.com
CORS_CREDENTIALS=true

# Rate limiting
RATE_LIMIT_WINDOW=900000    # 15 minutes
RATE_LIMIT_MAX=100          # 100 requests per window
```

### **SSL/TLS (Optional):**

```env
# SSL configuration
SSL_CERT_PATH=/path/to/certificate.crt
SSL_KEY_PATH=/path/to/private.key
FORCE_HTTPS=true
```

---

## 📈 **MONITORING & METRICS**

### **Built-in Monitoring:**

The system includes comprehensive monitoring:

- **Resource Usage:** CPU, Memory, Network
- **API Performance:** Response times, error rates
- **Database Metrics:** Query performance, connection health
- **Cron Job Status:** Success/failure tracking

### **Metrics Endpoints:**

```bash
# System health
GET /api/health

# Performance metrics
GET /api/metrics

# Database status
GET /api/health/database
```

### **PM2 Monitoring:**

```bash
# Real-time monitoring
pm2 monit

# Web dashboard
pm2 web    # Access at http://localhost:9615
```

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment:**
- [ ] Node.js >= 18.0.0 installed
- [ ] PM2 installed globally
- [ ] Database servers accessible
- [ ] Environment variables configured
- [ ] Firewall configured for port 5000

### **Deployment:**
- [ ] Run `npm run build:production`
- [ ] Navigate to `backend/dist/`
- [ ] Run `./deploy.bat` or `./deploy.sh`
- [ ] Verify with `npm run status`
- [ ] Test with `npm run health`

### **Post-Deployment:**
- [ ] API health check: http://localhost:5000/api/health
- [ ] Swagger docs: http://localhost:5000/api-docs
- [ ] Monitor logs: `npm run logs`
- [ ] Check cron jobs: `pm2 list techno-etl-cron`
- [ ] Performance monitoring: `npm run monit`

---

## 🎯 **PRODUCTION BEST PRACTICES**

### **1. Regular Maintenance:**
```bash
# Weekly log cleanup
find logs/ -name "*.log" -mtime +7 -delete

# Monthly dependency updates
npm audit
npm update

# Database maintenance
# Run your database maintenance scripts
```

### **2. Backup Strategy:**
- **Configuration:** Backup `.env` and `ecosystem.config.cjs`
- **Logs:** Archive logs older than 30 days
- **Database:** Regular database backups
- **Code:** Git repository with tags for releases

### **3. Monitoring Alerts:**
- Set up alerts for high memory usage (>80%)
- Monitor API response times (>2s)
- Track cron job failures
- Database connection monitoring

---

## 📞 **SUPPORT & CONTACT**

### **Technical Support:**
- **Email:** mounir.ab@techno-dz.com
- **Contact:** mounir.webdev.tms@gmail.com

### **Documentation:**
- **API Docs:** http://localhost:5000/api-docs
- **Health Check:** http://localhost:5000/api/health
- **Metrics:** http://localhost:5000/api/metrics

### **Emergency Procedures:**
1. **Server Down:** Check `npm run status` and `npm run logs`
2. **High Memory:** Run `npm run reload` for zero-downtime restart
3. **Database Issues:** Check `.env` configuration and connectivity
4. **Cron Failures:** Check `npm run logs:cron` and restart if needed

---

## 🎉 **SUCCESS INDICATORS**

### **Deployment Successful When:**
- ✅ `npm run status` shows all processes running
- ��� `npm run health` returns `{"status":"ok"}`
- ✅ API docs accessible at http://localhost:5000/api-docs
- ✅ Logs show `NODE_ENV=production`
- ✅ No Redis warnings (if Redis configured)
- ✅ Cron jobs scheduled and running

### **Performance Targets:**
- **API Response Time:** < 500ms average
- **Memory Usage:** < 80% system memory
- **CPU Usage:** < 70% average
- **Uptime:** > 99.9%
- **Error Rate:** < 1%

---

**🚀 Your TECHNO-ETL Backend is now production-ready with professional deployment, monitoring, and cron job automation!**

**Built with ❤️ by Mounir Abderrahmani**