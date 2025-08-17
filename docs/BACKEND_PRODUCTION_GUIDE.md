# TECHNO-ETL Backend Production Guide

**Author:** Mounir Abderrahmani  
**Email:** mounir.ab@techno-dz.com  
**Contact:** mounir.webdev.tms@gmail.com

## 🚀 **FIXED ISSUES**

### **✅ ES Module Error Fixed**
- **Problem:** `Error [ERR_REQUIRE_ESM]: require() of ES Module`
- **Solution:** Proper `"type": "module"` configuration in production package.json
- **Result:** Server starts without ES module errors

### **✅ PM2 Configuration Fixed**
- **Problem:** PM2 ecosystem config using ES modules
- **Solution:** CommonJS format for PM2 compatibility
- **Result:** PM2 cluster mode works perfectly

### **✅ Production Build Optimized**
- **Problem:** Manual dependency installation required
- **Solution:** Single-command production build with all dependencies
- **Result:** One command deployment

## 🎯 **SINGLE COMMAND DEPLOYMENT**

### **Build Production Version:**
```bash
cd backend
npm run build:production
```

### **Deploy and Start:**
```bash
cd dist_prod/backend
start-windows.bat
```

**That's it! Single command deployment working!** 🎉

## 📊 **Production Features**

### **✅ Optimized Package.json**
- Only production dependencies included
- PM2 included for cluster management
- Proper ES module configuration
- Node.js version requirements specified

### **✅ Professional PM2 Configuration**
- Cluster mode with all CPU cores
- Memory management (1GB limit)
- Log rotation and management
- Graceful shutdown handling
- Production environment variables

### **✅ Startup Scripts**
- **Windows:** `start-windows.bat`
- **Linux:** `start-linux.sh`
- Automatic dependency installation
- PM2 cluster startup
- Health check verification

### **✅ Comprehensive Documentation**
- Production README with all commands
- Deployment checklist
- Troubleshooting guide
- Performance monitoring instructions

## 🔧 **Available Commands**

### **Development (in backend/ folder):**
```bash
npm run build:production    # Build production version
npm start                  # Single instance
npm run dev               # Development mode
```

### **Production (in dist_prod/backend/ folder):**
```bash
npm start                 # Single instance
npm run start:cluster     # PM2 cluster mode (recommended)
npm run status           # Check PM2 status
npm run logs             # View logs
npm run monit            # Monitor performance
npm run health           # Health check
npm run stop             # Stop all processes
npm run restart          # Restart all processes
npm run reload           # Zero-downtime reload
```

## 🏥 **Health Monitoring**

### **Endpoints:**
- **Health:** http://localhost:5000/api/health
- **Metrics:** http://localhost:5000/api/metrics
- **API Docs:** http://localhost:5000/api-docs

### **PM2 Monitoring:**
```bash
npm run monit    # Real-time monitoring
npm run logs     # View logs
npm run status   # Process status
```

## 🔍 **Troubleshooting**

### **Server Won't Start:**
1. Check Node.js version: `node --version` (requires >=18.0.0)
2. Check port availability: `netstat -an | findstr :5000`
3. Kill existing processes: `taskkill /F /IM node.exe`
4. Check environment variables in .env file

### **PM2 Issues:**
1. Stop all processes: `npm run stop`
2. Check PM2 status: `npm run status`
3. Restart PM2: `npm run restart`
4. View PM2 logs: `npm run logs`

### **Memory Issues:**
1. Monitor with: `npm run monit`
2. Check memory limits in ecosystem.config.js
3. Restart if memory usage high: `npm run reload`

## 📁 **Production Structure**

```
dist_prod/backend/
├── server.js              # Main server (ES modules)
├── package.json           # Production dependencies only
├── ecosystem.config.js    # PM2 configuration (CommonJS)
├── .env                   # Environment variables
├── start-windows.bat      # Windows startup script
├── start-linux.sh         # Linux startup script
├── README.md              # Production documentation
├── DEPLOYMENT.md          # Deployment checklist
├── src/                   # Source code
├── swagger/               # API documentation
├── logs/                  # Application logs
└── uploads/               # File uploads
```

## ⚡ **Performance Optimizations**

### **✅ Cluster Mode**
- Uses all available CPU cores
- Load balancing across processes
- Automatic process restart on failure

### **✅ Memory Management**
- 1GB memory limit per process
- Garbage collection optimization
- Memory leak detection and warnings

### **✅ Logging**
- Structured logging with Winston
- Log rotation and archival
- Separate error and access logs

### **✅ Caching**
- In-memory caching with fallback
- Redis support when available
- Cache invalidation strategies

## 🔒 **Security Features**

### **✅ Production Hardening**
- Helmet.js security headers
- CORS configuration
- Rate limiting
- Input validation with Joi
- Environment variable protection

### **✅ Process Management**
- PM2 process isolation
- Graceful shutdown handling
- Automatic restart on crashes
- Resource monitoring and alerts

## 📈 **Monitoring & Metrics**

### **✅ Built-in Metrics**
- Request/response tracking
- Database query performance
- Memory and CPU usage
- Error rate monitoring

### **✅ Health Checks**
- Database connectivity
- External service status
- Memory usage warnings
- Performance thresholds

## 🎉 **Success Verification**

### **1. Build Success:**
```bash
cd backend
npm run build:production
# Should show: ✅ PRODUCTION BUILD COMPLETED!
```

### **2. Deployment Success:**
```bash
cd dist_prod/backend
start-windows.bat
# Should show: Server started! Check status with: npm run status
```

### **3. Health Check:**
```bash
npm run health
# Should return: {"status":"ok","timestamp":"..."}
```

### **4. API Documentation:**
Visit: http://localhost:5000/api-docs
Should show Swagger documentation

## 🚀 **Quick Start Summary**

```bash
# 1. Build production version
cd backend
npm run build:production

# 2. Deploy and start
cd ../dist_prod/backend
start-windows.bat

# 3. Verify
npm run health
```

## 📞 **Support**

### **Issues or Questions:**
- **Email:** mounir.ab@techno-dz.com
- **Contact:** mounir.webdev.tms@gmail.com

### **Common Solutions:**
1. **Port in use:** Kill Node processes: `taskkill /F /IM node.exe`
2. **PM2 issues:** Reset PM2: `pm2 kill && pm2 start ecosystem.config.js`
3. **Memory issues:** Restart cluster: `npm run reload`
4. **Database issues:** Check .env configuration

---

## 🎯 **Bottom Line**

**The backend production build is now FULLY OPTIMIZED and WORKING:**

✅ **Single command build:** `npm run build:production`  
✅ **Single command deploy:** `start-windows.bat`  
✅ **No manual npm install needed**  
✅ **ES module errors fixed**  
✅ **PM2 cluster mode working**  
✅ **Professional monitoring and logging**  
✅ **Production-ready with all optimizations**

**Built with ❤️ by Mounir Abderrahmani**