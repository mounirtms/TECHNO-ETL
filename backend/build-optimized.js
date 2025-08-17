#!/usr/bin/env node

/**
 * TECHNO-ETL Backend OPTIMIZED Production Build
 * Author: Mounir Abderrahmani
 * Email: mounir.ab@techno-dz.com
 * 
 * Single unified build system - replaces all other build methods
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TECHNO-ETL OPTIMIZED Production Build');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('📧 Email: mounir.ab@techno-dz.com');
console.log('🎯 Single Unified Build System');
console.log('=====================================\n');

const startTime = Date.now();

try {
  // Clean ALL previous builds
  console.log('🧹 Cleaning all previous builds...');
  
  const buildsToClean = [
    path.join(__dirname, 'dist'),
    path.join(__dirname, '..', 'dist_prod', 'backend')
  ];
  
  buildsToClean.forEach(buildDir => {
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true, force: true });
      console.log(`   ✅ Cleaned ${path.basename(buildDir)}`);
    }
  });

  // Create single production directory
  const prodDir = path.join(__dirname, 'dist');
  fs.mkdirSync(prodDir, { recursive: true });
  fs.mkdirSync(path.join(prodDir, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(prodDir, 'uploads'), { recursive: true });
  console.log('📁 Created production directory: backend/dist/');

  // Copy source files
  console.log('📋 Copying source files...');
  
  const filesToCopy = [
    'server.js',
    'production.config.js'
  ];

  filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(prodDir, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`   ✅ Copied ${file}`);
    }
  });

  // Copy directories
  console.log('📂 Copying directories...');
  const dirsToCopy = ['src', 'swagger'];
  
  dirsToCopy.forEach(dir => {
    const srcPath = path.join(__dirname, dir);
    const destPath = path.join(prodDir, dir);
    
    if (fs.existsSync(srcPath)) {
      copyDirectory(srcPath, destPath);
      console.log(`   ✅ Copied ${dir} directory`);
    }
  });

  // Create production environment file
  console.log('⚙️ Creating production environment...');
  const prodEnvContent = `# TECHNO-ETL Backend Production Environment
# Auto-generated on ${new Date().toISOString()}

# ===========================================
# ENVIRONMENT CONFIGURATION
# ===========================================
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# ===========================================
# DATABASE CONFIGURATION - CEGID
# ===========================================
SQL_CEGID_SERVER_INSTANCE=CVS196CgStandBy   
SQL_CEGID_SERVER_DATABASE=DBRETAIL01
SQL_CEGID_SERVER_USER=reporting_RO
SQL_CEGID_SERVER_PASSWORD=RepCeg1d2021

# ===========================================
# DATABASE CONFIGURATION - MDM
# ===========================================
SQL_MDM_SERVER_INSTANCE=C-VS003-SQL
SQL_MDM_SERVER_DATABASE=MDM_REPORT
SQL_MDM_SERVER_USER=Reporting_RO
SQL_MDM_SERVER_PASSWORD=MdM2oiB!

# ===========================================
# REDIS CONFIGURATION (Optional)
# ===========================================
# REDIS_URL=redis://localhost:6379
# REDIS_HOST=localhost
# REDIS_PORT=6379

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
ACCESS_TOKEN_SECRET=6c1f33c68bc05fe0d8f1452d62a46c55790a0df86299cd79adffefddf8d8843d4c3d02089c31865abb48b12eee5b3d009cfc4f036d4ae1a1bc96949a158cfd03
REFRESH_TOKEN_SECRET=b8d871db3e5ea65c97c5f94ed32200ec6ea655b09cd04d17d5df748a9e5445beea1acc26163f59f78c4dc0d2b137c721c792774489eb6e96ecbc5e952126ec5f
SESSION_SECRET=techno-etl-production-session-secret-2025

# ===========================================
# MAGENTO INTEGRATION
# ===========================================
MAGENTO_BASE_URL=https://your-magento-store.com
MAGENTO_ADMIN_TOKEN=your-magento-admin-token

# ===========================================
# CRON CONFIGURATION
# ===========================================
ENABLE_CRON=true
CRON_TIMEZONE=Europe/Paris
PRICE_SYNC_CRON=0 */6 * * *
STOCK_SYNC_CRON=0 */4 * * *
INVENTORY_SYNC_CRON=0 2 * * *

# ===========================================
# PERFORMANCE TUNING
# ===========================================
MAX_MEMORY=1024
DB_POOL_MAX=10
RATE_LIMIT_MAX=100
`;

  fs.writeFileSync(path.join(prodDir, '.env'), prodEnvContent);
  console.log('   ✅ Created production .env');

  // Create optimized package.json
  console.log('📦 Creating optimized package.json...');
  const originalPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  const productionPackageJson = {
    name: originalPackageJson.name,
    version: originalPackageJson.version,
    description: originalPackageJson.description,
    type: "module",
    main: "server.js",
    author: originalPackageJson.author,
    license: originalPackageJson.license,
    engines: {
      "node": ">=18.0.0",
      "npm": ">=8.0.0"
    },
    dependencies: {
      "@keyv/redis": "^5.0.0",
      "axios": "^1.9.0",
      "compression": "^1.8.1",
      "connect-timeout": "^1.9.0",
      "cors": "^2.8.5",
      "dotenv": "^16.3.1",
      "express": "^4.18.2",
      "express-rate-limit": "^8.0.1",
      "fs-extra": "^11.3.0",
      "geoip-lite": "^1.4.10",
      "got": "^14.4.7",
      "helmet": "^7.2.0",
      "ioredis": "^5.4.1",
      "jest-worker": "^29.7.0",
      "joi": "^17.13.3",
      "keyv": "^5.4.0",
      "morgan": "^1.10.0",
      "mssql": "^11.0.1",
      "node-cache": "^5.1.2",
      "p-limit": "^5.0.0",
      "swagger-jsdoc": "^6.2.8",
      "swagger-ui-express": "^5.0.0",
      "useragent": "^2.3.0",
      "winston": "^3.11.0",
      "winston-daily-rotate-file": "^4.7.1",
      "pm2": "^5.3.0"
    },
    scripts: {
      "start": "node --no-warnings --expose-gc server.js",
      "start:cluster": "pm2 start ecosystem.config.js",
      "start:cron": "pm2 start ecosystem.config.js --only techno-etl-cron",
      "stop": "pm2 stop all",
      "restart": "pm2 restart all",
      "reload": "pm2 reload all",
      "logs": "pm2 logs",
      "logs:cron": "pm2 logs techno-etl-cron",
      "monit": "pm2 monit",
      "status": "pm2 status",
      "health": "curl http://localhost:5000/api/health || echo 'Server not responding'",
      "deploy": "npm install --production && npm run start:cluster"
    }
  };

  fs.writeFileSync(
    path.join(prodDir, 'package.json'), 
    JSON.stringify(productionPackageJson, null, 2)
  );
  console.log('   ✅ Created optimized package.json');

  // Create unified PM2 ecosystem config
  console.log('⚙️ Creating unified PM2 configuration...');
  const ecosystemConfig = `/**
 * TECHNO-ETL Unified PM2 Configuration
 * Author: Mounir Abderrahmani
 * Single configuration for API + Cron
 */

module.exports = {
  apps: [
    {
      name: 'techno-etl-api',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
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
      script: './src/cron/cron-runner.js',
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
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        ENABLE_CRON: 'true'
      }
    }
  ]
};`;

  fs.writeFileSync(path.join(prodDir, 'ecosystem.config.js'), ecosystemConfig);
  console.log('   ✅ Created unified PM2 configuration');

  // Create cron runner if it doesn't exist
  console.log('🕐 Setting up cron system...');
  const cronDir = path.join(prodDir, 'src', 'cron');
  fs.mkdirSync(cronDir, { recursive: true });
  
  const cronRunnerContent = `/**
 * TECHNO-ETL Cron Runner
 * Author: Mounir Abderrahmani
 * Handles all scheduled tasks
 */

import cron from 'node-cron';
import { logger } from '../utils/logger.js';

console.log('🕐 TECHNO-ETL Cron Runner Starting...');

// Price Sync - Every 6 hours
cron.schedule(process.env.PRICE_SYNC_CRON || '0 */6 * * *', async () => {
  logger.info('🔄 Starting price sync cron job');
  try {
    // Add your price sync logic here
    logger.info('✅ Price sync completed');
  } catch (error) {
    logger.error('❌ Price sync failed:', error);
  }
}, {
  timezone: process.env.CRON_TIMEZONE || 'Europe/Paris'
});

// Stock Sync - Every 4 hours
cron.schedule(process.env.STOCK_SYNC_CRON || '0 */4 * * *', async () => {
  logger.info('📦 Starting stock sync cron job');
  try {
    // Add your stock sync logic here
    logger.info('✅ Stock sync completed');
  } catch (error) {
    logger.error('❌ Stock sync failed:', error);
  }
}, {
  timezone: process.env.CRON_TIMEZONE || 'Europe/Paris'
});

// Inventory Sync - Daily at 2 AM
cron.schedule(process.env.INVENTORY_SYNC_CRON || '0 2 * * *', async () => {
  logger.info('🏭 Starting inventory sync cron job');
  try {
    // Add your inventory sync logic here
    logger.info('✅ Inventory sync completed');
  } catch (error) {
    logger.error('❌ Inventory sync failed:', error);
  }
}, {
  timezone: process.env.CRON_TIMEZONE || 'Europe/Paris'
});

logger.info('✅ All cron jobs scheduled successfully');
`;

  fs.writeFileSync(path.join(cronDir, 'cron-runner.js'), cronRunnerContent);
  console.log('   ✅ Created cron runner');

  // Create deployment scripts
  console.log('🚀 Creating deployment scripts...');
  
  const deployScript = `@echo off
echo ========================================
echo TECHNO-ETL Optimized Production Deploy
echo Author: Mounir Abderrahmani
echo ========================================

echo [1/3] Installing dependencies...
call npm install --production

echo [2/3] Starting API cluster...
call npm run start:cluster

echo [3/3] Starting cron jobs...
call npm run start:cron

echo ========================================
echo DEPLOYMENT COMPLETED
echo ========================================
echo API: http://localhost:5000/api/health
echo Docs: http://localhost:5000/api-docs
echo Status: npm run status
echo Logs: npm run logs
echo ========================================
pause`;

  fs.writeFileSync(path.join(prodDir, 'deploy.bat'), deployScript);
  
  const linuxDeployScript = `#!/bin/bash
echo "========================================"
echo "TECHNO-ETL Optimized Production Deploy"
echo "Author: Mounir Abderrahmani"
echo "========================================"

echo "[1/3] Installing dependencies..."
npm install --production

echo "[2/3] Starting API cluster..."
npm run start:cluster

echo "[3/3] Starting cron jobs..."
npm run start:cron

echo "========================================"
echo "DEPLOYMENT COMPLETED"
echo "========================================"
echo "API: http://localhost:5000/api/health"
echo "Docs: http://localhost:5000/api-docs"
echo "Status: npm run status"
echo "Logs: npm run logs"
echo "========================================"`;

  fs.writeFileSync(path.join(prodDir, 'deploy.sh'), linuxDeployScript);
  
  console.log('   ✅ Created deployment scripts');

  // Create comprehensive README
  console.log('📖 Creating production documentation...');
  const readmeContent = `# TECHNO-ETL Backend - Optimized Production Build

**Author:** Mounir Abderrahmani  
**Email:** mounir.ab@techno-dz.com  
**Build Date:** ${new Date().toISOString()}

## 🚀 Quick Deploy

### Windows:
\`\`\`cmd
deploy.bat
\`\`\`

### Linux/Mac:
\`\`\`bash
chmod +x deploy.sh && ./deploy.sh
\`\`\`

## 📋 Manual Commands

### Start Services:
\`\`\`bash
npm install --production    # Install dependencies
npm run start:cluster      # Start API cluster
npm run start:cron         # Start cron jobs
\`\`\`

### Monitor Services:
\`\`\`bash
npm run status             # Check all processes
npm run logs               # View all logs
npm run logs:cron          # View cron logs only
npm run monit              # Real-time monitoring
\`\`\`

### Control Services:
\`\`\`bash
npm run stop               # Stop all services
npm run restart            # Restart all services
npm run reload             # Zero-downtime reload
\`\`\`

## 🕐 Cron Jobs

The system includes automated cron jobs:

- **Price Sync:** Every 6 hours (\`0 */6 * * *\`)
- **Stock Sync:** Every 4 hours (\`0 */4 * * *\`)
- **Inventory Sync:** Daily at 2 AM (\`0 2 * * *\`)

Configure in \`.env\`:
\`\`\`env
PRICE_SYNC_CRON=0 */6 * * *
STOCK_SYNC_CRON=0 */4 * * *
INVENTORY_SYNC_CRON=0 2 * * *
CRON_TIMEZONE=Europe/Paris
\`\`\`

## 🏥 Health Monitoring

- **API Health:** http://localhost:5000/api/health
- **API Docs:** http://localhost:5000/api-docs
- **Metrics:** http://localhost:5000/api/metrics

## 🔧 Configuration

Edit \`.env\` file for:
- Database connections
- Redis configuration
- Cron schedules
- Performance tuning
- Security settings

## 📊 Process Management

Two main processes:
1. **techno-etl-api** - API server (cluster mode)
2. **techno-etl-cron** - Scheduled tasks (single instance)

## 🔍 Troubleshooting

### Check Process Status:
\`\`\`bash
npm run status
\`\`\`

### View Logs:
\`\`\`bash
npm run logs              # All logs
npm run logs:cron         # Cron logs only
\`\`\`

### Restart Services:
\`\`\`bash
npm run restart           # Restart all
pm2 restart techno-etl-api    # Restart API only
pm2 restart techno-etl-cron   # Restart cron only
\`\`\`

---

**Built with ❤️ by Mounir Abderrahmani**  
**Support: mounir.ab@techno-dz.com**
`;

  fs.writeFileSync(path.join(prodDir, 'README.md'), readmeContent);
  console.log('   ✅ Created production README');

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n=====================================');
  console.log('✅ OPTIMIZED PRODUCTION BUILD COMPLETED!');
  console.log(`⏱️  Build time: ${duration}s`);
  console.log(`📁 Output: ${prodDir}`);
  console.log('🎯 Single unified build system');
  console.log('\n🚀 Next Steps:');
  console.log('1. cd backend/dist');
  console.log('2. ./deploy.bat (Windows) or ./deploy.sh (Linux)');
  console.log('3. npm run status');
  console.log('\n👨‍💻 Built by: Mounir Abderrahmani');
  console.log('📧 Support: mounir.ab@techno-dz.com');
  console.log('=====================================');

} catch (error) {
  console.error('\n❌ Optimized build failed:', error.message);
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