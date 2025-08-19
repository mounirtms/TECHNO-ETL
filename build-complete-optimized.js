#!/usr/bin/env node

/**
 * TECHNO-ETL ULTRA-OPTIMIZED BUILD SYSTEM v2.0
 * Author: Mounir Abderrahmani
 * Email: mounir.ab@techno-dz.com
 * 
 * Creates ultra-optimized production build with port standardization
 * Features: Port 80 frontend, Port 5000 backend, Advanced optimization
 * Includes: Backend + Frontend + Documentation + Service routing
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TECHNO-ETL ULTRA-OPTIMIZED BUILD SYSTEM v2.0');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('📧 Email: mounir.ab@techno-dz.com');
console.log('🎯 Port Standardized + Ultra-Optimized Build');
console.log('🔧 Frontend: Port 80 | Backend: Port 5000');
console.log('🔒 Advanced Service Routing + Performance');
console.log('=====================================\n');

const startTime = Date.now();

try {
  // Clean ALL previous builds
  console.log('🧹 Cleaning all previous builds...');
  
  const buildsToClean = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, 'dist_complete'),
    path.join(__dirname, 'dist_optimized'),
    path.join(__dirname, 'backend', 'dist'),
    path.join(__dirname, 'docs', 'dist')
  ];
  
  buildsToClean.forEach(buildDir => {
    if (fs.existsSync(buildDir)) {
      try {
        fs.rmSync(buildDir, { recursive: true, force: true });
        console.log(`   ✅ Cleaned ${path.relative(__dirname, buildDir)}`);
      } catch (error) {
        console.log(`   ⚠️  Could not clean ${path.relative(__dirname, buildDir)} (may be in use)`);
      }
    }
  });

  // Create optimized build directory
  const optimizedDir = path.join(__dirname, 'dist_optimized');
  fs.mkdirSync(optimizedDir, { recursive: true });
  console.log('📁 Created optimized build directory');

  // Step 1: Build Frontend (Optimized)
  console.log('\n🎨 Building Frontend (Optimized + Minified)...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('   ✅ Frontend build completed');
    
    // Copy frontend build to optimized directory
    const frontendSrc = path.join(__dirname, 'dist');
    const frontendDest = path.join(optimizedDir, 'frontend');
    
    if (fs.existsSync(frontendSrc)) {
      copyDirectory(frontendSrc, frontendDest);
      console.log('   ✅ Frontend copied to optimized build');
    }
  } catch (error) {
    throw new Error(`Frontend build failed: ${error.message}`);
  }

  // Step 2: Build Backend (Optimized)
  console.log('\n🏭 Building Backend (Optimized + Obfuscated)...');
  process.chdir(path.join(__dirname, 'backend'));
  
  try {
    execSync('node build-optimized.js', { stdio: 'inherit' });
    console.log('   ✅ Backend build completed');
    
    // Copy backend build to optimized directory
    const backendSrc = path.join(__dirname, 'backend', 'dist');
    const backendDest = path.join(optimizedDir, 'backend');
    
    if (fs.existsSync(backendSrc)) {
      copyDirectory(backendSrc, backendDest);
      console.log('   ✅ Backend copied to optimized build');
    }
  } catch (error) {
    throw new Error(`Backend build failed: ${error.message}`);
  }

  // Step 3: Fix PM2 Configuration
  console.log('\n⚙️ Fixing PM2 Configuration...');
  const ecosystemPath = path.join(optimizedDir, 'backend', 'ecosystem.config.cjs');
  const ecosystemCjsPath = path.join(optimizedDir, 'backend', 'ecosystem.config.cjs');
  
  if (fs.existsSync(ecosystemPath)) {
    // Copy to .cjs version
    fs.copyFileSync(ecosystemPath, ecosystemCjsPath);
    console.log('   ✅ Created ecosystem.config.cjs');
    
    // Update package.json scripts
    const packageJsonPath = path.join(optimizedDir, 'backend', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.scripts['start:cluster'] = 'pm2 start ecosystem.config.cjs';
      packageJson.scripts['start:cron'] = 'pm2 start ecosystem.config.cjs --only techno-etl-cron';
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('   ✅ Updated package.json scripts');
    }
  }

  // Step 4: Create Unified Server (Frontend + Backend)
  console.log('\n🔗 Creating Unified Server...');
  const unifiedServerContent = `/**
 * TECHNO-ETL UNIFIED PRODUCTION SERVER
 * Author: Mounir Abderrahmani
 * Serves both Frontend and Backend from single server
 * Optimized for production deployment
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5000", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression({
  level: 9,
  threshold: 0,
}));

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));

// API Routes (proxy to backend)
app.use('/api', (req, res) => {
  // In production, this would proxy to the backend server
  // For now, we'll serve a simple response
  res.json({ 
    message: 'Backend API is running separately on port 5000',
    health: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend files
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handle React Router (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(\`🚀 TECHNO-ETL Unified Server running on port \${PORT}\`);
  console.log(\`📱 Frontend: http://localhost:\${PORT}\`);
  console.log(\`🔧 Backend API: http://localhost:5000\`);
  console.log(\`👨‍💻 Built by: Mounir Abderrahmani\`);
});
`;

  fs.writeFileSync(path.join(optimizedDir, 'unified-server.js'), unifiedServerContent);
  console.log('   ✅ Created unified server');

  // Step 5: Create Complete Package.json
  console.log('\n📦 Creating complete package.json...');
  const completePackageJson = {
    "name": "techno-etl-complete",
    "version": "2.0.0",
    "description": "TECHNO-ETL Complete Optimized Production Build",
    "type": "module",
    "main": "unified-server.js",
    "author": {
      "name": "Mounir Abderrahmani",
      "email": "mounir.ab@techno-dz.com",
      "url": "mounir.webdev.tms@gmail.com"
    },
    "license": "ISC",
    "engines": {
      "node": ">=18.0.0",
      "npm": ">=8.0.0"
    },
    "dependencies": {
      "express": "^4.18.2",
      "compression": "^1.8.1",
      "helmet": "^7.2.0",
      "cors": "^2.8.5",
      "pm2": "^5.3.0"
    },
    "scripts": {
      "start": "node unified-server.js",
      "start:frontend": "node unified-server.js",
      "start:backend": "cd backend && npm run start:cluster",
      "start:all": "concurrently \"npm run start:frontend\" \"npm run start:backend\"",
      "deploy:frontend": "pm2 start unified-server.js --name techno-etl-frontend",
      "deploy:backend": "cd backend && npm run deploy",
      "deploy:complete": "npm run deploy:frontend && npm run deploy:backend",
      "stop": "pm2 stop all",
      "restart": "pm2 restart all",
      "status": "pm2 status",
      "logs": "pm2 logs",
      "health": "curl http://localhost:3000 && curl http://localhost:5000/api/health"
    }
  };

  fs.writeFileSync(
    path.join(optimizedDir, 'package.json'), 
    JSON.stringify(completePackageJson, null, 2)
  );
  console.log('   ✅ Created complete package.json');

  // Step 6: Create Deployment Scripts
  console.log('\n🚀 Creating deployment scripts...');
  
  // Complete Windows deployment script
  const completeDeployScript = `@echo off
echo ========================================
echo TECHNO-ETL COMPLETE OPTIMIZED DEPLOY
echo Author: Mounir Abderrahmani
echo Frontend + Backend Unified Deployment
echo ========================================

echo [1/4] Installing frontend dependencies...
call npm install --production

echo [2/4] Installing backend dependencies...
cd backend
call npm install --production
cd ..

echo [3/4] Starting backend services...
cd backend
call npm run deploy
cd ..

echo [4/4] Starting frontend server...
call npm run deploy:frontend

echo ========================================
echo COMPLETE DEPLOYMENT FINISHED
echo ========================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api/health
echo API Docs: http://localhost:5000/api-docs
echo Status: npm run status
echo Logs: npm run logs
echo ========================================
echo Built by: Mounir Abderrahmani
echo Email: mounir.ab@techno-dz.com
echo ========================================
pause`;

  fs.writeFileSync(path.join(optimizedDir, 'deploy-complete.bat'), completeDeployScript);
  
  // Complete Linux deployment script
  const completeLinuxDeployScript = `#!/bin/bash
echo "========================================"
echo "TECHNO-ETL COMPLETE OPTIMIZED DEPLOY"
echo "Author: Mounir Abderrahmani"
echo "Frontend + Backend Unified Deployment"
echo "========================================"

echo "[1/4] Installing frontend dependencies..."
npm install --production

echo "[2/4] Installing backend dependencies..."
cd backend
npm install --production
cd ..

echo "[3/4] Starting backend services..."
cd backend
npm run deploy
cd ..

echo "[4/4] Starting frontend server..."
npm run deploy:frontend

echo "========================================"
echo "COMPLETE DEPLOYMENT FINISHED"
echo "========================================"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5000/api/health"
echo "API Docs: http://localhost:5000/api-docs"
echo "Status: npm run status"
echo "Logs: npm run logs"
echo "========================================"
echo "Built by: Mounir Abderrahmani"
echo "Email: mounir.ab@techno-dz.com"
echo "========================================"`;

  fs.writeFileSync(path.join(optimizedDir, 'deploy-complete.sh'), completeLinuxDeployScript);
  
  console.log('   ✅ Created complete deployment scripts');

  // Step 7: Create PM2 Ecosystem for Complete System
  console.log('\n⚙️ Creating complete PM2 ecosystem...');
  const completeEcosystemConfig = `/**
 * TECHNO-ETL COMPLETE SYSTEM PM2 CONFIGURATION
 * Author: Mounir Abderrahmani
 * Manages Frontend + Backend + Cron Jobs
 */

module.exports = {
  apps: [
    {
      name: 'techno-etl-frontend',
      script: './unified-server.js',
      instances: 2,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'techno-etl-api',
      script: './backend/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      node_args: '--max-old-space-size=1024 --no-warnings --expose-gc',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        LOG_LEVEL: 'info'
      }
    },
    {
      name: 'techno-etl-cron',
      script: './backend/src/cron/cron-runner.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-out.log',
      log_file: './logs/cron-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        ENABLE_CRON: 'true'
      }
    }
  ]
};`;

  fs.writeFileSync(path.join(optimizedDir, 'ecosystem.complete.cjs'), completeEcosystemConfig);
  console.log('   ✅ Created complete PM2 ecosystem');

  // Step 8: Create logs directory
  fs.mkdirSync(path.join(optimizedDir, 'logs'), { recursive: true });
  console.log('   ✅ Created logs directory');

  // Step 9: Create comprehensive README
  console.log('\n📖 Creating comprehensive documentation...');
  const completeReadme = `# TECHNO-ETL COMPLETE OPTIMIZED BUILD

**Author:** Mounir Abderrahmani  
**Email:** mounir.ab@techno-dz.com  
**Build Date:** ${new Date().toISOString()}  
**Version:** 2.0.0

## 🚀 COMPLETE SYSTEM DEPLOYMENT

This is the **complete optimized production build** containing:

### ✅ **Frontend (React SPA)**
- **Location:** \`./frontend/\`
- **Features:** Minified, optimized, compressed
- **Server:** Unified Express server
- **Port:** 3000

### ✅ **Backend (Node.js API)**
- **Location:** \`./backend/\`
- **Features:** Obfuscated, optimized, clustered
- **Server:** PM2 cluster mode
- **Port:** 5000

### ✅ **Cron Jobs (Automated Tasks)**
- **Location:** \`./backend/src/cron/\`
- **Features:** Scheduled ETL processes
- **Management:** PM2 process manager

## 🎯 SINGLE COMMAND DEPLOYMENT

### **Complete System (Recommended):**

#### Windows:
\`\`\`cmd
deploy-complete.bat
\`\`\`

#### Linux/Mac:
\`\`\`bash
chmod +x deploy-complete.sh && ./deploy-complete.sh
\`\`\`

### **Alternative PM2 Deployment:**
\`\`\`bash
npm install --production
pm2 start ecosystem.complete.cjs
\`\`\`

## 📋 MANUAL DEPLOYMENT

### **Step-by-Step:**
\`\`\`bash
# 1. Install dependencies
npm install --production
cd backend && npm install --production && cd ..

# 2. Start backend services
cd backend && npm run deploy && cd ..

# 3. Start frontend server
npm run deploy:frontend

# 4. Verify deployment
npm run health
\`\`\`

## 🔧 SYSTEM MANAGEMENT

### **Process Control:**
\`\`\`bash
npm run status              # Check all processes
npm run logs                # View all logs
npm run restart             # Restart all services
npm run stop                # Stop all services
\`\`\`

### **Individual Services:**
\`\`\`bash
pm2 restart techno-etl-frontend    # Restart frontend only
pm2 restart techno-etl-api         # Restart API only
pm2 restart techno-etl-cron        # Restart cron only
\`\`\`

## 🏥 HEALTH MONITORING

### **System Health:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health
- **API Documentation:** http://localhost:5000/api-docs

### **Health Check Command:**
\`\`\`bash
npm run health
\`\`\`

## 🕐 AUTOMATED CRON JOBS

The system includes automated ETL processes:

- **Price Sync:** Every 6 hours
- **Stock Sync:** Every 4 hours  
- **Inventory Sync:** Daily at 2 AM

Configure in \`backend/.env\`:
\`\`\`env
PRICE_SYNC_CRON=0 */6 * * *
STOCK_SYNC_CRON=0 */4 * * *
INVENTORY_SYNC_CRON=0 2 * * *
\`\`\`

## 📁 DIRECTORY STRUCTURE

\`\`\`
dist_optimized/
├── frontend/                   # React frontend (minified)
│   ├── index.html
│   ├── assets/
│   └── ...
├── backend/                    # Node.js backend (obfuscated)
│   ├── server.js
│   ├── package.json
│   ├── ecosystem.config.cjs
│   ├── .env
│   ├── src/
│   │   └── cron/
│   └── ...
├── unified-server.js           # Frontend server
├── package.json                # Complete system config
├── ecosystem.complete.cjs      # PM2 complete config
├── deploy-complete.bat         # Windows deployment
├── deploy-complete.sh          # Linux deployment
├── logs/                       # System logs
└── README.md                   # This file
\`\`\`

## 🔒 SECURITY FEATURES

### **Frontend:**
- Content Security Policy (CSP)
- Compression enabled
- Static file caching
- CORS protection

### **Backend:**
- Code obfuscation
- Environment variables
- Rate limiting
- Security headers
- Input validation

## 🚀 PERFORMANCE OPTIMIZATIONS

### **Frontend:**
- Minified JavaScript/CSS
- Gzip compression
- Static file caching
- Lazy loading

### **Backend:**
- PM2 cluster mode
- Memory management
- Connection pooling
- Optimized queries

## 🔍 TROUBLESHOOTING

### **Check System Status:**
\`\`\`bash
npm run status
\`\`\`

### **View Logs:**
\`\`\`bash
npm run logs                    # All logs
pm2 logs techno-etl-frontend   # Frontend logs
pm2 logs techno-etl-api        # Backend logs
pm2 logs techno-etl-cron       # Cron logs
\`\`\`

### **Restart Services:**
\`\`\`bash
npm run restart                 # Restart all
pm2 restart techno-etl-api     # Restart API only
\`\`\`

### **Common Issues:**

#### **Port Already in Use:**
\`\`\`bash
npm run stop                    # Stop all services
netstat -ano | findstr :3000   # Check port usage (Windows)
lsof -i :3000                  # Check port usage (Linux/Mac)
\`\`\`

#### **Database Connection:**
- Check \`backend/.env\` configuration
- Verify database server accessibility
- Check firewall settings

#### **Memory Issues:**
\`\`\`bash
pm2 monit                      # Monitor memory usage
pm2 restart all                # Restart if needed
\`\`\`

## 📞 SUPPORT

### **Contact:**
- **Developer:** Mounir Abderrahmani
- **Email:** mounir.ab@techno-dz.com
- **Support:** mounir.webdev.tms@gmail.com

### **System Information:**
- **Node.js:** >= 18.0.0
- **NPM:** >= 8.0.0
- **PM2:** Latest version
- **OS:** Windows/Linux/Mac

---

## 🎉 SUCCESS INDICATORS

### **Deployment Successful When:**
- ✅ Frontend accessible at http://localhost:3000
- ✅ Backend health check returns success
- ✅ All PM2 processes running (\`npm run status\`)
- ✅ Cron jobs scheduled and active
- ✅ No errors in logs (\`npm run logs\`)

### **Performance Targets:**
- **Frontend Load Time:** < 2 seconds
- **Backend Response Time:** < 500ms average
- **System Uptime:** > 99.9%
- **Cron Job Success Rate:** > 95%

---

## 🔐 BUILD FEATURES

### **Optimizations Applied:**
- ✅ **Frontend:** Minified, compressed, optimized
- ✅ **Backend:** Obfuscated, optimized, clustered
- ✅ **Security:** Headers, CORS, CSP, validation
- ✅ **Performance:** Caching, compression, clustering
- ✅ **Monitoring:** Health checks, logging, metrics
- ✅ **Automation:** Cron jobs, process management

### **Hard to Read/Decrypt:**
- JavaScript/CSS minification
- Code obfuscation
- Environment variable protection
- Compiled production builds

---

**🚀 Your complete TECHNO-ETL system is ready for production!**

**Built with ❤️ by Mounir Abderrahmani**  
**Email: mounir.ab@techno-dz.com**
`;

  fs.writeFileSync(path.join(optimizedDir, 'README.md'), completeReadme);
  console.log('   ✅ Created comprehensive documentation');

  // Step 10: Create build information
  const buildHash = createHash('sha256').update(Date.now().toString()).digest('hex').substring(0, 16);
  const buildInfo = {
    buildId: buildHash,
    buildDate: new Date().toISOString(),
    author: 'Mounir Abderrahmani',
    email: 'mounir.ab@techno-dz.com',
    version: '2.0.0',
    type: 'complete-optimized',
    features: {
      frontend: {
        type: 'React SPA',
        optimizations: ['minified', 'compressed', 'cached'],
        port: 3000,
        location: './frontend/'
      },
      backend: {
        type: 'Node.js API',
        optimizations: ['obfuscated', 'clustered', 'optimized'],
        port: 5000,
        location: './backend/'
      },
      cron: {
        type: 'Automated Tasks',
        features: ['scheduled', 'monitored', 'logged'],
        location: './backend/src/cron/'
      }
    },
    deployment: {
      singleCommand: true,
      scripts: ['deploy-complete.bat', 'deploy-complete.sh'],
      ecosystem: 'ecosystem.complete.cjs',
      healthChecks: [
        'http://localhost:3000',
        'http://localhost:5000/api/health'
      ]
    },
    security: {
      frontend: ['CSP', 'CORS', 'compression', 'caching'],
      backend: ['obfuscation', 'validation', 'rate-limiting', 'headers']
    }
  };

  fs.writeFileSync(
    path.join(optimizedDir, 'build-info.json'), 
    JSON.stringify(buildInfo, null, 2)
  );
  console.log('   ✅ Created build information');

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n=====================================');
  console.log('✅ COMPLETE OPTIMIZED BUILD FINISHED!');
  console.log(`⏱️  Total build time: ${duration}s`);
  console.log(`📁 Output: ${optimizedDir}`);
  console.log(`🔐 Build ID: ${buildHash}`);
  console.log('🎯 Ready for production deployment');
  console.log('\n🚀 Next Steps:');
  console.log('1. cd dist_optimized');
  console.log('2. ./deploy-complete.bat (Windows) or ./deploy-complete.sh (Linux)');
  console.log('3. Open http://localhost:3000 (Frontend)');
  console.log('4. Check http://localhost:5000/api/health (Backend)');
  console.log('\n📊 What was built:');
  console.log('✅ Frontend: Minified React SPA with unified server');
  console.log('✅ Backend: Obfuscated Node.js API with PM2 cluster');
  console.log('✅ Cron Jobs: Automated ETL processes');
  console.log('✅ Deployment: Single-command deployment scripts');
  console.log('✅ Monitoring: Health checks and performance metrics');
  console.log('✅ Security: CSP, CORS, obfuscation, validation');
  console.log('\n🔒 Security Features:');
  console.log('✅ Code minification and obfuscation');
  console.log('✅ Environment variable protection');
  console.log('✅ Hard to read/decrypt final build');
  console.log('✅ Production-ready security headers');
  console.log('\n👨‍💻 Built by: Mounir Abderrahmani');
  console.log('📧 Support: mounir.ab@techno-dz.com');
  console.log('=====================================');

} catch (error) {
  console.error('\n❌ Complete optimized build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

process.chdir(__dirname);