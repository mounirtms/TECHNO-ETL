#!/usr/bin/env node

/**
 * TECHNO-ETL OPTIMIZED DEVELOPMENT STARTUP v2.0
 * Author: Mounir Abderrahmani
 * Email: mounir.ab@techno-dz.com
 * 
 * Starts development environment with port validation and service monitoring
 * Features: Port 80 frontend, Port 5000 backend, Health monitoring
 */

import { spawn } from 'child_process';
import net from 'net';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TECHNO-ETL OPTIMIZED DEVELOPMENT STARTUP v2.0');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('📧 Email: mounir.ab@techno-dz.com');
console.log('🔧 Frontend: Port 80 | Backend: Port 5000');
console.log('=====================================\n');

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
 * Kill process on port
 */
function killProcessOnPort(port) {
  try {
    if (process.platform === 'win32') {
      // Windows
      const { execSync } = require('child_process');
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.split('\n').filter(line => line.includes('LISTENING'));
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`🔪 Killed process ${pid} on port ${port}`);
          } catch (error) {
            // Ignore errors
          }
        }
      });
    } else {
      // Unix-like systems
      const { execSync } = require('child_process');
      try {
        const pid = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
        if (pid) {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`🔪 Killed process ${pid} on port ${port}`);
        }
      } catch (error) {
        // Port not in use or no permission
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Wait for service to be ready
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
          reject(new Error(`Service on port ${port} not ready after ${timeout}ms`));
        } else {
          setTimeout(checkService, 1000);
        }
      });
    };
    
    checkService();
  });
}

/**
 * Start backend service
 */
function startBackend() {
  console.log('🔧 Starting backend service...');
  
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });
  
  backend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running') || output.includes('listening')) {
      console.log('✅ Backend service ready on port 5000');
    }
    process.stdout.write(`[BACKEND] ${output}`);
  });
  
  backend.stderr.on('data', (data) => {
    process.stderr.write(`[BACKEND ERROR] ${data}`);
  });
  
  backend.on('close', (code) => {
    console.log(`🔧 Backend process exited with code ${code}`);
  });
  
  return backend;
}

/**
 * Start frontend service
 */
function startFrontend() {
  console.log('🌐 Starting frontend service...');
  
  const frontend = spawn('npm', ['start'], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });
  
  frontend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('ready')) {
      console.log('✅ Frontend service ready on port 80');
    }
    process.stdout.write(`[FRONTEND] ${output}`);
  });
  
  frontend.stderr.on('data', (data) => {
    process.stderr.write(`[FRONTEND ERROR] ${data}`);
  });
  
  frontend.on('close', (code) => {
    console.log(`🌐 Frontend process exited with code ${code}`);
  });
  
  return frontend;
}

/**
 * Monitor services health
 */
async function monitorServices() {
  console.log('🏥 Starting service health monitoring...');
  
  setInterval(async () => {
    try {
      // Check backend health
      const backendHealthy = await checkPortAvailable(5000).then(available => !available);
      
      // Check frontend health  
      const frontendHealthy = await checkPortAvailable(80).then(available => !available);
      
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] 🏥 Health: Backend ${backendHealthy ? '✅' : '❌'} | Frontend ${frontendHealthy ? '✅' : '❌'}`);
      
    } catch (error) {
      console.error('🏥 Health check error:', error.message);
    }
  }, 30000); // Check every 30 seconds
}

/**
 * Setup graceful shutdown
 */
function setupGracefulShutdown(processes) {
  const shutdown = () => {
    console.log('\n🛑 Shutting down services...');
    
    processes.forEach(proc => {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM');
      }
    });
    
    setTimeout(() => {
      processes.forEach(proc => {
        if (proc && !proc.killed) {
          proc.kill('SIGKILL');
        }
      });
      process.exit(0);
    }, 5000);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', shutdown);
}

/**
 * Main startup function
 */
async function startDevelopment() {
  try {
    console.log('🔍 Checking port availability...');
    
    // Check if ports are available, kill processes if needed
    const frontendAvailable = await checkPortAvailable(80);
    const backendAvailable = await checkPortAvailable(5000);
    
    if (!frontendAvailable) {
      console.log('⚠️  Port 80 in use, attempting to free it...');
      killProcessOnPort(80);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (!backendAvailable) {
      console.log('⚠️  Port 5000 in use, attempting to free it...');
      killProcessOnPort(5000);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Start services
    const backend = startBackend();
    
    // Wait for backend to be ready
    console.log('⏳ Waiting for backend to be ready...');
    await waitForService(5000, 30000);
    
    const frontend = startFrontend();
    
    // Setup monitoring and graceful shutdown
    const processes = [backend, frontend];
    setupGracefulShutdown(processes);
    
    // Start health monitoring
    setTimeout(() => monitorServices(), 10000);
    
    console.log('\n🎉 DEVELOPMENT ENVIRONMENT READY!');
    console.log('🌐 Frontend: http://localhost:80');
    console.log('🔧 Backend: http://localhost:5000');
    console.log('🏥 Health: http://localhost:5000/api/health');
    console.log('\n💡 Press Ctrl+C to stop all services');
    
  } catch (error) {
    console.error('❌ Failed to start development environment:', error.message);
    process.exit(1);
  }
}

// Start development environment
startDevelopment();