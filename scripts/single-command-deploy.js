#!/usr/bin/env node

/**
 * Single Command Production Deployment for TECHNO-ETL
 * 
 * Complete deployment with Redis health checks, cache monitoring, and system verification
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class SingleCommandDeployer {
  constructor() {
    this.deploymentId = `deploy-${Date.now()}`;
    this.startTime = Date.now();
    this.steps = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '📝';
    console.log(`${prefix} [${timestamp.split('T')[1].split('.')[0]}] ${message}`);
  }

  async executeStep(stepName, command, options = {}) {
    const stepStart = Date.now();
    this.log(`🔄 ${stepName}...`);
    
    try {
      if (typeof command === 'function') {
        await command();
      } else {
        execSync(command, { 
          stdio: options.silent ? 'pipe' : 'inherit',
          cwd: options.cwd || rootDir,
          timeout: options.timeout || 120000
        });
      }
      
      const duration = Date.now() - stepStart;
      this.steps.push({ step: stepName, duration, status: 'success' });
      this.log(`✅ ${stepName} completed (${duration}ms)`);
      return true;
      
    } catch (error) {
      const duration = Date.now() - stepStart;
      this.steps.push({ step: stepName, duration, status: 'failed', error: error.message });
      this.log(`❌ ${stepName} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async checkRedisHealth() {
    try {
      // Try to ping Redis
      execSync('redis-cli ping', { stdio: 'pipe', timeout: 5000 });
      this.log('✅ Redis is available and responding');
      return true;
    } catch (error) {
      this.log('⚠️ Redis not available - will use in-memory cache fallback', 'warn');
      return false;
    }
  }

  async testServerHealth(port = 5000, maxRetries = 15) {
    return new Promise((resolve) => {
      let retries = 0;
      
      const checkHealth = () => {
        const options = {
          hostname: 'localhost',
          port: port,
          path: '/api/health',
          method: 'GET',
          timeout: 3000
        };

        const req = http.request(options, (res) => {
          if (res.statusCode === 200) {
            this.log('✅ Server health check passed');
            resolve(true);
          } else {
            retryCheck();
          }
        });

        req.on('error', () => retryCheck());
        req.on('timeout', () => {
          req.destroy();
          retryCheck();
        });

        req.end();
      };

      const retryCheck = () => {
        retries++;
        if (retries < maxRetries) {
          setTimeout(checkHealth, 2000);
        } else {
          this.log('❌ Server health check failed after maximum retries', 'error');
          resolve(false);
        }
      };

      // Wait a moment before first check
      setTimeout(checkHealth, 3000);
    });
  }

  async deploy() {
    try {
      this.log('🚀 Starting TECHNO-ETL Single Command Deployment');
      this.log(`📋 Deployment ID: ${this.deploymentId}`);
      this.log(`🕐 Start Time: ${new Date().toISOString()}\n`);

      // Step 1: Environment Setup
      await this.executeStep('Environment Setup', () => {
        if (!process.env.NODE_ENV) {
          process.env.NODE_ENV = 'production';
        }
        this.log(`Environment: ${process.env.NODE_ENV}`);
      });

      // Step 2: Redis Health Check
      await this.executeStep('Redis Health Check', async () => {
        await this.checkRedisHealth();
      });

      // Step 3: Clean Previous Builds
      await this.executeStep('Clean Previous Builds', 'npm run clean');

      // Step 4: Install Dependencies
      await this.executeStep('Install Dependencies', 'npm ci --production=false');

      // Step 5: Backend Dependencies
      await this.executeStep('Backend Dependencies', 'npm ci --production=false', { cwd: path.join(rootDir, 'backend') });

      // Step 6: Build Optimization
      await this.executeStep('Optimized Build', 'npm run build:optimized');

      // Step 7: Stop Existing Processes
      await this.executeStep('Stop Existing Processes', () => {
        try {
          execSync('npm run pm2:stop', { stdio: 'pipe', cwd: rootDir });
        } catch (error) {
          this.log('No existing PM2 processes to stop');
        }
      });

      // Step 8: Start Production Server
      await this.executeStep('Start Production Server', 'npm run server:production');

      // Step 9: Health Verification
      await this.executeStep('Health Verification', async () => {
        const healthy = await this.testServerHealth();
        if (!healthy) {
          throw new Error('Server failed health check after deployment');
        }
      });

      // Step 10: Cache Monitoring Setup
      await this.executeStep('Cache Monitoring Setup', async () => {
        // Test cache endpoints
        try {
          execSync('curl -s http://localhost:5000/api/metrics', { stdio: 'pipe', timeout: 5000 });
          this.log('✅ Cache monitoring endpoints are accessible');
        } catch (error) {
          this.log('⚠️ Cache monitoring endpoints may not be fully ready', 'warn');
        }
      });

      // Step 11: Performance Verification
      await this.executeStep('Performance Verification', async () => {
        // Run a quick load test
        try {
          execSync('node scripts/simple-load-test.js', { stdio: 'pipe', timeout: 30000, cwd: rootDir });
          this.log('✅ Performance verification passed');
        } catch (error) {
          this.log('⚠️ Performance verification had issues - check manually', 'warn');
        }
      });

      // Deployment Success
      const totalTime = Date.now() - this.startTime;
      this.log(`\n🎉 DEPLOYMENT SUCCESSFUL!`);
      this.log(`⏱️  Total Time: ${(totalTime / 1000).toFixed(2)}s`);
      this.log(`📊 Steps Completed: ${this.steps.filter(s => s.status === 'success').length}/${this.steps.length}`);
      
      this.showDeploymentSummary();
      return true;

    } catch (error) {
      const totalTime = Date.now() - this.startTime;
      this.log(`\n❌ DEPLOYMENT FAILED!`, 'error');
      this.log(`⏱️  Time Elapsed: ${(totalTime / 1000).toFixed(2)}s`, 'error');
      this.log(`💥 Error: ${error.message}`, 'error');
      
      this.showTroubleshootingInfo();
      return false;
    }
  }

  showDeploymentSummary() {
    console.log(`
🎯 TECHNO-ETL Production Deployment Complete!

🌐 Application URL: http://localhost:5000
📊 Health Check: http://localhost:5000/api/health  
📈 Metrics: http://localhost:5000/api/metrics
📋 PM2 Status: npm run pm2:status
📝 PM2 Logs: npm run pm2:logs

🚀 Quick Commands:
- Health Check: curl http://localhost:5000/api/health
- Performance Test: npm run test:health
- Stop Server: npm run pm2:stop
- Restart Server: npm run pm2:restart

✅ Your application is now running in production mode!
    `);
  }

  showTroubleshootingInfo() {
    console.log(`
❌ Deployment Failed - Troubleshooting Guide:

🔍 Check Status:
- PM2 Status: npm run pm2:status
- PM2 Logs: npm run pm2:logs
- Health Check: curl http://localhost:5000/api/health

🛠️ Common Fixes:
- Port in use: npm run pm2:stop && npm run server:production
- Dependencies: npm run clean && npm ci
- Build issues: npm run build:optimized

📝 Manual Start:
- Backend only: npm run server
- With PM2: npm run pm2:start

🔧 Debug Mode:
- Start backend: cd backend && npm run dev
- Check logs: tail -f backend/logs/*.log
    `);
  }
}

async function main() {
  const deployer = new SingleCommandDeployer();
  const success = await deployer.deploy();
  process.exit(success ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
