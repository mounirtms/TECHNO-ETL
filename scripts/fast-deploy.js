#!/usr/bin/env node

/**
 * Fast Single Command Deployment for TECHNO-ETL
 * Assumes dependencies are already installed
 */

const { execSync } = require('child_process');
const http = require('http');

class FastDeployer {
  constructor() {
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
    console.log(`${prefix} [${time}] ${message}`);
  }

  async step(name, command, options = {}) {
    const start = Date.now();
    this.log(`🔄 ${name}...`);
    
    try {
      if (typeof command === 'function') {
        await command();
      } else {
        execSync(command, { 
          stdio: options.silent ? 'pipe' : 'inherit',
          timeout: options.timeout || 30000
        });
      }
      
      const duration = Date.now() - start;
      this.log(`${name} completed (${duration}ms)`);
      return true;
    } catch (error) {
      this.log(`${name} failed: ${error.message}`, 'error');
      if (!options.optional) throw error;
      return false;
    }
  }

  async checkRedis() {
    try {
      execSync('redis-cli ping', { stdio: 'pipe', timeout: 2000 });
      this.log('Redis is available');
      return true;
    } catch (error) {
      this.log('Redis not available - using in-memory cache', 'warn');
      return false;
    }
  }

  async testHealth(retries = 8) {
    return new Promise((resolve) => {
      let attempts = 0;
      
      const check = () => {
        const req = http.request({
          hostname: 'localhost',
          port: 5000,
          path: '/api/health',
          method: 'GET',
          timeout: 2000
        }, (res) => {
          if (res.statusCode === 200) {
            this.log('Server health check passed');
            resolve(true);
          } else {
            retry();
          }
        });

        req.on('error', retry);
        req.on('timeout', () => {
          req.destroy();
          retry();
        });
        req.end();
      };

      const retry = () => {
        attempts++;
        if (attempts < retries) {
          setTimeout(check, 1500);
        } else {
          this.log('Health check failed after retries', 'error');
          resolve(false);
        }
      };

      setTimeout(check, 2000); // Initial delay
    });
  }

  async deploy() {
    try {
      console.log('🚀 TECHNO-ETL Fast Deployment Starting...\n');

      // Step 1: Environment
      await this.step('Environment Setup', () => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'production';
        this.log(`Environment: ${process.env.NODE_ENV}`);
      });

      // Step 2: Redis Check
      await this.step('Redis Health Check', () => this.checkRedis(), { optional: true });

      // Step 3: Stop existing processes
      await this.step('Stop Existing Processes', () => {
        try {
          execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq *PM2*" 2>nul', { stdio: 'pipe' });
          execSync('taskkill /F /IM node.exe /FI "COMMANDLINE eq *server.js*" 2>nul', { stdio: 'pipe' });
        } catch (e) {
          // No processes to kill
        }
      }, { optional: true });

      // Step 4: Build frontend
      await this.step('Build Frontend', 'npm run build:frontend');

      // Step 5: Build backend
      await this.step('Build Backend', 'cd backend && npm run build', { optional: true });

      // Step 6: Start server directly (faster than PM2 for testing)
      console.log('\n🚀 Starting server...');
      
      // Start server in background
      const { spawn } = require('child_process');
      const serverProcess = spawn('node', ['backend/server.js'], {
        detached: true,
        stdio: 'ignore',
        env: { ...process.env, NODE_ENV: 'production', PORT: '5000' }
      });
      
      serverProcess.unref();
      this.log('Server started in background');

      // Step 7: Health Check
      await this.step('Health Verification', () => this.testHealth());

      // Step 8: Quick performance test
      await this.step('Performance Test', 'node scripts/simple-load-test.js', { 
        optional: true, 
        timeout: 15000 
      });

      // Success!
      const totalTime = Date.now() - this.startTime;
      console.log(`\n🎉 FAST DEPLOYMENT SUCCESSFUL! (${(totalTime / 1000).toFixed(2)}s)`);
      
      this.showSummary();
      return true;

    } catch (error) {
      const totalTime = Date.now() - this.startTime;
      console.log(`\n❌ DEPLOYMENT FAILED! (${(totalTime / 1000).toFixed(2)}s)`);
      console.log(`💥 Error: ${error.message}`);
      
      this.showTroubleshooting();
      return false;
    }
  }

  showSummary() {
    console.log(`
🎯 TECHNO-ETL is now running!

🌐 Application: http://localhost:5000
📊 Health Check: http://localhost:5000/api/health
📈 Metrics: http://localhost:5000/api/metrics

🚀 Quick Tests:
curl http://localhost:5000/api/health
curl http://localhost:5000/api/metrics

🔧 Management:
- Check processes: tasklist | findstr node
- Stop server: taskkill /F /IM node.exe
- Restart: npm run deploy:fast

✅ Fast deployment complete!
    `);
  }

  showTroubleshooting() {
    console.log(`
❌ Deployment Failed - Quick Fixes:

🔍 Check what's running:
tasklist | findstr node

🛠️ Manual start:
cd backend && node server.js

🔧 If port is busy:
taskkill /F /IM node.exe
netstat -ano | findstr :5000

📝 Debug:
cd backend && npm run dev
curl http://localhost:5000/api/health
    `);
  }
}

async function main() {
  const deployer = new FastDeployer();
  const success = await deployer.deploy();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}
