#!/usr/bin/env node

/**
 * Quick Single Command Deployment for TECHNO-ETL
 * Simple, fast deployment with health checks and monitoring
 */

const { execSync } = require('child_process');
const http = require('http');

class QuickDeployer {
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
          timeout: options.timeout || 60000
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
      execSync('redis-cli ping', { stdio: 'pipe', timeout: 3000 });
      this.log('Redis is available');
      return true;
    } catch (error) {
      this.log('Redis not available - using in-memory cache', 'warn');
      return false;
    }
  }

  async testHealth(retries = 10) {
    return new Promise((resolve) => {
      let attempts = 0;
      
      const check = () => {
        const req = http.request({
          hostname: 'localhost',
          port: 5000,
          path: '/api/health',
          method: 'GET',
          timeout: 3000
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
          setTimeout(check, 2000);
        } else {
          this.log('Health check failed after retries', 'error');
          resolve(false);
        }
      };

      setTimeout(check, 3000); // Initial delay
    });
  }

  async deploy() {
    try {
      console.log('🚀 TECHNO-ETL Quick Deployment Starting...\n');

      // Step 1: Environment
      await this.step('Environment Setup', () => {
        process.env.NODE_ENV = process.env.NODE_ENV || 'production';
        this.log(`Environment: ${process.env.NODE_ENV}`);
      });

      // Step 2: Redis Check
      await this.step('Redis Health Check', () => this.checkRedis(), { optional: true });

      // Step 3: Stop existing
      await this.step('Stop Existing Processes', () => {
        try {
          execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq *PM2*" 2>nul', { stdio: 'pipe' });
        } catch (e) {
          // No processes to kill
        }
      }, { optional: true });

      // Step 4: Dependencies
      await this.step('Install Dependencies', 'npm ci --production=false --silent');

      // Step 5: Backend Dependencies  
      await this.step('Backend Dependencies', 'cd backend && npm ci --production=false --silent');

      // Step 6: Build
      await this.step('Build Application', 'npm run build:optimized');

      // Step 7: Start Server
      await this.step('Start Production Server', 'npm run server:production');

      // Step 8: Health Check
      await this.step('Health Verification', () => this.testHealth());

      // Step 9: Performance Test
      await this.step('Performance Test', 'node scripts/simple-load-test.js', { optional: true });

      // Success!
      const totalTime = Date.now() - this.startTime;
      console.log(`\n🎉 DEPLOYMENT SUCCESSFUL! (${(totalTime / 1000).toFixed(2)}s)`);
      
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
🎯 TECHNO-ETL is now running in production!

🌐 Application: http://localhost:5000
📊 Health Check: http://localhost:5000/api/health
📈 Metrics: http://localhost:5000/api/metrics

🚀 Quick Commands:
- Health: curl http://localhost:5000/api/health
- Metrics: curl http://localhost:5000/api/metrics  
- Status: npm run pm2:status
- Logs: npm run pm2:logs
- Stop: npm run pm2:stop

✅ Production deployment complete!
    `);
  }

  showTroubleshooting() {
    console.log(`
❌ Deployment Failed - Quick Fixes:

🔍 Check what's running:
- npm run pm2:status
- npm run pm2:logs

🛠️ Manual start:
- npm run server (direct start)
- npm run pm2:start (with PM2)

🔧 If port is busy:
- npm run pm2:stop
- taskkill /F /IM node.exe

📝 Debug:
- cd backend && npm run dev
- curl http://localhost:5000/api/health
    `);
  }
}

async function main() {
  const deployer = new QuickDeployer();
  const success = await deployer.deploy();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main();
}
