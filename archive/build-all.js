#!/usr/bin/env node

/**
 * TECHNO-ETL Complete Project Build Script
 * Author: Mounir Abderrahmani
 * Email: mounir.ab@techno-dz.com
 * 
 * Builds the entire TECHNO-ETL project including:
 * - Backend production build
 * - Frontend documentation build
 * - Creates unified deployment package
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TECHNO-ETL Complete Project Build');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('📧 Email: mounir.ab@techno-dz.com');
console.log('🎯 Building Backend + Frontend + Documentation');
console.log('=====================================\n');

const startTime = Date.now();

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  const buildsToClean = [
    path.join(__dirname, 'backend', 'dist'),
    path.join(__dirname, 'docs', 'dist'),
    path.join(__dirname, 'dist_complete')
  ];
  
  buildsToClean.forEach(buildDir => {
    if (fs.existsSync(buildDir)) {
      fs.rmSync(buildDir, { recursive: true, force: true });
      console.log(`   ✅ Cleaned ${path.relative(__dirname, buildDir)}`);
    }
  });

  // Create complete build directory
  const completeDistDir = path.join(__dirname, 'dist_complete');
  fs.mkdirSync(completeDistDir, { recursive: true });
  console.log('📁 Created complete build directory');

  // Build Backend
  console.log('\n🏭 Building Backend Production...');
  process.chdir(path.join(__dirname, 'backend'));
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('   ✅ Backend build completed');
  } catch (error) {
    throw new Error(`Backend build failed: ${error.message}`);
  }

  // Build Documentation
  console.log('\n📚 Building Documentation...');
  process.chdir(path.join(__dirname, 'docs'));
  
  try {
    // Install dependencies if needed
    if (!fs.existsSync('node_modules')) {
      console.log('   📦 Installing documentation dependencies...');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    execSync('npm run build', { stdio: 'inherit' });
    console.log('   ✅ Documentation build completed');
  } catch (error) {
    throw new Error(`Documentation build failed: ${error.message}`);
  }

  // Copy builds to complete directory
  console.log('\n📋 Assembling complete build...');
  process.chdir(__dirname);

  // Copy backend build
  const backendSrc = path.join(__dirname, 'backend', 'dist');
  const backendDest = path.join(completeDistDir, 'backend');
  
  if (fs.existsSync(backendSrc)) {
    copyDirectory(backendSrc, backendDest);
    console.log('   ✅ Copied backend build');
  }

  // Copy documentation build
  const docsSrc = path.join(__dirname, 'docs', 'dist');
  const docsDest = path.join(completeDistDir, 'docs');
  
  if (fs.existsSync(docsSrc)) {
    copyDirectory(docsSrc, docsDest);
    console.log('   ✅ Copied documentation build');
  }

  // Create deployment scripts
  console.log('\n🚀 Creating deployment scripts...');
  
  // Windows deployment script
  const windowsDeployScript = `@echo off
echo ========================================
echo TECHNO-ETL Complete Project Deployment
echo Author: Mounir Abderrahmani
echo ========================================

echo [1/3] Deploying Backend...
cd backend
call deploy.bat
cd ..

echo [2/3] Deploying Documentation...
echo Documentation is static - copy to web server

echo [3/3] Verifying Deployment...
echo Backend Health: http://localhost:5000/api/health
echo Documentation: http://localhost/docs (or your web server)

echo ========================================
echo DEPLOYMENT COMPLETED
echo ========================================
echo Backend API: http://localhost:5000
echo API Docs: http://localhost:5000/api-docs
echo Documentation: http://localhost/docs
echo ========================================
pause`;

  fs.writeFileSync(path.join(completeDistDir, 'deploy-complete.bat'), windowsDeployScript);

  // Linux deployment script
  const linuxDeployScript = `#!/bin/bash
echo "========================================"
echo "TECHNO-ETL Complete Project Deployment"
echo "Author: Mounir Abderrahmani"
echo "========================================"

echo "[1/3] Deploying Backend..."
cd backend
chmod +x deploy.sh
./deploy.sh
cd ..

echo "[2/3] Deploying Documentation..."
echo "Documentation is static - copy to web server"

echo "[3/3] Verifying Deployment..."
echo "Backend Health: http://localhost:5000/api/health"
echo "Documentation: http://localhost/docs (or your web server)"

echo "========================================"
echo "DEPLOYMENT COMPLETED"
echo "========================================"
echo "Backend API: http://localhost:5000"
echo "API Docs: http://localhost:5000/api-docs"
echo "Documentation: http://localhost/docs"
echo "========================================"`;

  fs.writeFileSync(path.join(completeDistDir, 'deploy-complete.sh'), linuxDeployScript);
  
  // Make Linux script executable
  try {
    execSync(`chmod +x "${path.join(completeDistDir, 'deploy-complete.sh')}"`);
  } catch (error) {
    console.log('   ⚠️  Could not make Linux script executable (Windows environment)');
  }

  console.log('   ✅ Created deployment scripts');

  // Create comprehensive README
  console.log('📖 Creating complete project documentation...');
  const completeReadme = `# TECHNO-ETL Complete Project Build

**Author:** Mounir Abderrahmani  
**Email:** mounir.ab@techno-dz.com  
**Contact:** mounir.webdev.tms@gmail.com  
**Build Date:** ${new Date().toISOString()}

## 🚀 Complete Deployment

This build contains the complete TECHNO-ETL project:

### **Backend (Production Ready)**
- **Location:** \`./backend/\`
- **Type:** Node.js API server with PM2 cluster
- **Features:** Optimized production build, automated cron jobs, monitoring
- **Deployment:** Single command deployment

### **Documentation (Static Site)**
- **Location:** \`./docs/\`
- **Type:** React-based documentation site
- **Features:** Interactive documentation, search, responsive design
- **Deployment:** Static files for web server

## 📋 Quick Deployment

### **Complete Deployment (Both Backend + Docs):**

#### Windows:
\`\`\`cmd
deploy-complete.bat
\`\`\`

#### Linux/Mac:
\`\`\`bash
./deploy-complete.sh
\`\`\`

### **Individual Deployments:**

#### Backend Only:
\`\`\`bash
cd backend
./deploy.bat    # Windows
./deploy.sh     # Linux
\`\`\`

#### Documentation Only:
\`\`\`bash
# Copy docs/ folder to your web server
cp -r docs/* /var/www/html/techno-etl-docs/
\`\`\`

## 🔧 Backend Features

### **✅ Optimized Production System:**
- **Environment:** NODE_ENV=production
- **Build System:** Single unified build
- **Process Management:** PM2 cluster mode
- **Cron Jobs:** Automated ETL processes
- **Monitoring:** Health checks and metrics
- **Performance:** Memory management, connection pooling

### **🕐 Automated Cron Jobs:**
- **Price Sync:** Every 6 hours (\`0 */6 * * *\`)
- **Stock Sync:** Every 4 hours (\`0 */4 * * *\`)
- **Inventory Sync:** Daily at 2 AM (\`0 2 * * *\`)

### **📊 Monitoring Endpoints:**
- **Health:** http://localhost:5000/api/health
- **Metrics:** http://localhost:5000/api/metrics
- **API Docs:** http://localhost:5000/api-docs

## 📚 Documentation Features

### **✅ Interactive Documentation:**
- **React-based:** Modern, responsive interface
- **Search:** Global search with keyboard shortcuts
- **Navigation:** Organized sections and categories
- **Code Examples:** Syntax-highlighted code blocks

### **📖 Documentation Sections:**
- **System Overview:** Complete system architecture
- **Getting Started:** Quick start guide
- **Deployment Guides:** Multiple deployment options
- **API Documentation:** Complete API reference
- **Troubleshooting:** Common issues and solutions

## 🏥 Health Verification

### **Backend Health Check:**
\`\`\`bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","environment":"production"}
\`\`\`

### **Documentation Access:**
- **Local:** Open \`docs/index.html\` in browser
- **Web Server:** Access via your configured domain

## 📁 Directory Structure

\`\`\`
dist_complete/
├── backend/                    # Backend production build
│   ├── server.js              # Main server
│   ├── package.json           # Production dependencies
│   ├── ecosystem.config.cjs   # PM2 configuration
│   ├── .env                   # Production environment
│   ├── deploy.bat             # Backend deployment (Windows)
│   ├── deploy.sh              # Backend deployment (Linux)
│   ├── src/                   # Source code
��   │   └── cron/              # Cron job system
│   ├── logs/                  # Application logs
│   └── swagger/               # API documentation
├── docs/                      # Documentation static site
│   ├── index.html             # Main documentation page
│   ├── assets/                # Static assets
│   └── ...                    # Other documentation files
├── deploy-complete.bat        # Complete deployment (Windows)
├── deploy-complete.sh         # Complete deployment (Linux)
└── README.md                  # This file
\`\`\`

## 🔍 Troubleshooting

### **Backend Issues:**
\`\`\`bash
cd backend
npm run status    # Check processes
npm run logs      # View logs
npm run health    # Health check
\`\`\`

### **Documentation Issues:**
- Ensure web server is configured for SPA routing
- Check file permissions for static files
- Verify all assets are accessible

## 📞 Support

### **Contact:**
- **Developer:** Mounir Abderrahmani
- **Email:** mounir.ab@techno-dz.com
- **Support:** mounir.webdev.tms@gmail.com

### **Resources:**
- **Backend Health:** http://localhost:5000/api/health
- **API Documentation:** http://localhost:5000/api-docs
- **Project Documentation:** Access via web server

---

## 🎉 Success Indicators

### **Deployment Successful When:**
- ✅ Backend health check returns success
- ✅ All PM2 processes running
- ✅ Documentation accessible via web browser
- ✅ Cron jobs scheduled and active
- ✅ No errors in logs

### **Performance Targets:**
- **Backend Response Time:** < 500ms average
- **Documentation Load Time:** < 2s
- **System Uptime:** > 99.9%
- **Cron Job Success Rate:** > 95%

---

**🚀 Your complete TECHNO-ETL system is ready for production deployment!**

**Built with ❤️ by Mounir Abderrahmani**
`;

  fs.writeFileSync(path.join(completeDistDir, 'README.md'), completeReadme);
  console.log('   ✅ Created complete project documentation');

  // Create build info file
  const buildInfo = {
    buildDate: new Date().toISOString(),
    author: 'Mounir Abderrahmani',
    email: 'mounir.ab@techno-dz.com',
    version: '2.0.0',
    components: {
      backend: {
        type: 'Node.js API Server',
        features: ['Production optimized', 'PM2 cluster', 'Automated cron jobs', 'Monitoring'],
        location: './backend/'
      },
      documentation: {
        type: 'React Documentation Site',
        features: ['Interactive docs', 'Global search', 'Responsive design'],
        location: './docs/'
      }
    },
    deployment: {
      single_command: true,
      scripts: ['deploy-complete.bat', 'deploy-complete.sh'],
      health_checks: ['http://localhost:5000/api/health']
    }
  };

  fs.writeFileSync(
    path.join(completeDistDir, 'build-info.json'), 
    JSON.stringify(buildInfo, null, 2)
  );
  console.log('   ✅ Created build information file');

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n=====================================');
  console.log('✅ COMPLETE PROJECT BUILD FINISHED!');
  console.log(`⏱️  Total build time: ${duration}s`);
  console.log(`📁 Output: ${completeDistDir}`);
  console.log('🎯 Ready for complete deployment');
  console.log('\n🚀 Next Steps:');
  console.log('1. cd dist_complete');
  console.log('2. ./deploy-complete.bat (Windows) or ./deploy-complete.sh (Linux)');
  console.log('3. Verify: http://localhost:5000/api/health');
  console.log('\n📊 What was built:');
  console.log('✅ Backend: Optimized production server with cron jobs');
  console.log('✅ Documentation: Interactive React-based docs');
  console.log('✅ Deployment: Single-command deployment scripts');
  console.log('✅ Monitoring: Health checks and performance metrics');
  console.log('\n👨‍💻 Built by: Mounir Abderrahmani');
  console.log('📧 Support: mounir.ab@techno-dz.com');
  console.log('=====================================');

} catch (error) {
  console.error('\n❌ Complete build failed:', error.message);
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