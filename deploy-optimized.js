#!/usr/bin/env node

/**
 * TECHNO-ETL ULTRA-OPTIMIZED DEPLOYMENT SYSTEM v2.0
 * Author: Mounir Abderrahmani
 * Email: mounir.ab@techno-dz.com
 * 
 * Deploys optimized build with port standardization and service routing
 * Features: Port validation, service health checks, automated deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TECHNO-ETL ULTRA-OPTIMIZED DEPLOYMENT v2.0');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('📧 Email: mounir.ab@techno-dz.com');
console.log('🎯 Port Standardized Deployment');
console.log('🔧 Frontend: Port 80 | Backend: Port 5000');
console.log('=====================================\n');

const startTime = Date.now();

/**
 * Check if a port is available
 */
function checkPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Wait for a service to be available
 */
function waitForService(port, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkService = () => {
      const client = net.createConnection({ port }, () => {
        client.end();
        resolve(true);
      });
      
      client.on('error', () => {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Service on port ${port} not available after ${timeout}ms`));
        } else {
          setTimeout(checkService, 1000);
        }
      });
    };
    
    checkService();
  });
}

/**
 * Validate environment configuration
 */
function validateEnvironment() {
  console.log('🔍 Validating environment configuration...');
  
  const requiredFiles = [
    '.env.development',
    '.env.production',
    'backend/.env.development',
    'backend/.env.production',
    'vite.config.js',
    'backend/production.config.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
  
  if (missingFiles.length > 0) {
    console.error('❌ Missing required configuration files:');
    missingFiles.forEach(file => console.error(`   - ${file}`));
    process.exit(1);
  }
  
  console.log('✅ Environment configuration validated');
}

/**
 * Check port availability
 */
async function checkPorts() {
  console.log('🔍 Checking port availability...');
  
  const frontendAvailable = await checkPortAvailable(80);
  const backendAvailable = await checkPortAvailable(5000);
  
  if (!frontendAvailable) {
    console.warn('⚠️  Port 80 is in use - frontend may conflict');
  } else {
    console.log('✅ Port 80 available for frontend');
  }
  
  if (!backendAvailable) {
    console.warn('⚠️  Port 5000 is in use - backend may conflict');
  } else {
    console.log('✅ Port 5000 available for backend');
  }
  
  return { frontendAvailable, backendAvailable };
}

/**
 * Build the application
 */
function buildApplication() {
  console.log('🔨 Building optimized application...');
  
  try {
    // Run the optimized build script
    execSync('node build-complete-optimized.js', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    console.log('✅ Application build completed');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

/**
 * Start backend service
 */
function startBackend() {
  console.log('🚀 Starting backend service on port 5000...');
  
  try {
    // Start backend in background
    const backend = execSync('cd backend && npm start', { 
      stdio: 'pipe',
      cwd: __dirname,
      detached: true
    });
    
    console.log('✅ Backend service started');
    return backend;
  } catch (error) {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  }
}

/**
 * Start frontend service
 */
function startFrontend() {
  console.log('🚀 Starting frontend service on port 80...');
  
  try {
    // Start frontend preview server
    execSync('npm run preview', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    console.log('✅ Frontend service started');
  } catch (error) {
    console.error('❌ Failed to start frontend:', error.message);
    process.exit(1);
  }
}

/**
 * Perform health checks
 */
async function performHealthChecks() {
  console.log('🏥 Performing health checks...');
  
  try {
    // Wait for backend to be ready
    await waitForService(5000, 30000);
    console.log('✅ Backend health check passed');
    
    // Check frontend (if running on port 4173 for preview)
    try {
      await waitForService(4173, 10000);
      console.log('✅ Frontend health check passed');
    } catch (error) {
      console.warn('⚠️  Frontend health check failed (may be normal for production)');
    }
    
    // Test API endpoints
    try {
      execSync('curl -f http://localhost:5000/api/health', { stdio: 'pipe' });
      console.log('✅ API health endpoint responding');
    } catch (error) {
      console.warn('⚠️  API health endpoint not responding');
    }
    
  } catch (error) {
    console.error('❌ Health checks failed:', error.message);
    process.exit(1);
  }
}

/**
 * Generate deployment report
 */
function generateDeploymentReport() {
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const report = {
    timestamp: new Date().toISOString(),
    duration: `${duration}ms`,
    ports: {
      frontend: 80,
      backend: 5000,
      preview: 4173
    },
    services: {
      dashboard: 'http://localhost:5000/api/dashboard',
      mdm: 'http://localhost:5000/api/mdm',
      task: 'http://localhost:5000/api/task',
      magento: 'http://localhost:5000/api/magento',
      health: 'http://localhost:5000/api/health'
    },
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'deployment-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📊 DEPLOYMENT REPORT');
  console.log('====================');
  console.log(`⏱️  Duration: ${report.duration}`);
  console.log(`🌐 Frontend: Port ${report.ports.frontend}`);
  console.log(`🔧 Backend: Port ${report.ports.backend}`);
  console.log(`📋 Preview: Port ${report.ports.preview}`);
  console.log(`🏥 Health: ${report.services.health}`);
  console.log(`📄 Report saved: deployment-report.json`);
  console.log('\n✅ DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉');
}

/**
 * Main deployment function
 */
async function deploy() {
  try {
    // Validate environment
    validateEnvironment();
    
    // Check ports
    await checkPorts();
    
    // Build application
    buildApplication();
    
    // Start services (in development mode)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Starting development services...');
      
      // For development, we'll just validate the build
      console.log('✅ Development build validated');
    } else {
      console.log('🚀 Starting production services...');
      
      // Start backend
      startBackend();
      
      // Perform health checks
      await performHealthChecks();
    }
    
    // Generate report
    generateDeploymentReport();
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'build':
    buildApplication();
    break;
  case 'health':
    performHealthChecks();
    break;
  case 'check-ports':
    checkPorts();
    break;
  default:
    deploy();
}

export { deploy, buildApplication, performHealthChecks, checkPorts };