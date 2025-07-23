#!/usr/bin/env node

/**
 * Enhanced Production Build Script for TECHNO-ETL Backend
 * Creates optimized production build with all components
 */

import fs from 'fs-extra';
import path from 'path';

const sourceDir = process.cwd();
const distDir = path.join(sourceDir, 'production');

console.log('🏗️  Building TECHNO-ETL Backend (Enhanced Production)');
console.log('====================================================');

async function buildProduction() {
    try {
        // Clean and create dist directory
        console.log('🧹 Cleaning production directory...');
        await fs.remove(distDir);
        await fs.ensureDir(distDir);

        // Copy main application files
        console.log('📁 Copying main application files...');
        const mainFiles = [
            'server.js',
            'cron-runner.js',
            'production.config.js',
            'ecosystem.config.js',
            'package.json'
        ];

        for (const file of mainFiles) {
            if (await fs.pathExists(path.join(sourceDir, file))) {
                await fs.copy(path.join(sourceDir, file), path.join(distDir, file));
                console.log(`   ✅ ${file}`);
            }
        }

        // Copy source directory
        console.log('📂 Copying src directory...');
        await fs.copy(path.join(sourceDir, 'src'), path.join(distDir, 'src'));

        // Copy queries directory if it exists
        if (await fs.pathExists(path.join(sourceDir, 'queries'))) {
            console.log('📄 Copying queries directory...');
            await fs.copy(path.join(sourceDir, 'queries'), path.join(distDir, 'queries'));
        }

        // Create logs directory
        console.log('📝 Creating logs directory...');
        await fs.ensureDir(path.join(distDir, 'logs'));

        // Create production environment file
        console.log('🔧 Creating production environment...');
        const prodEnv = `NODE_ENV=production
PORT=5000
HOST=0.0.0.0
LOG_LEVEL=info
# Redis configuration (optional)
# REDIS_URL=redis://localhost:6379
# Database configuration
# DB_HOST=localhost
# DB_PORT=1433
# DB_USER=sa
# DB_PASSWORD=your_password
# DB_NAME=techno_etl
`;
        await fs.writeFile(path.join(distDir, '.env.production'), prodEnv);

        // Create enhanced start script
        console.log('🚀 Creating enhanced start script...');
        const startScript = `#!/usr/bin/env node

/**
 * Production Start Script for TECHNO-ETL Backend
 * Enhanced with health checks and monitoring
 */

import dotenv from 'dotenv';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Load production environment
dotenv.config({ path: '.env.production' });

console.log('🚀 TECHNO-ETL Backend Production Startup');
console.log('========================================');

// Health check function
async function healthCheck() {
    try {
        const response = await fetch('http://localhost:5000/api/health');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Health check passed:', data.status);
            return true;
        }
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    return false;
}

// Start server with monitoring
function startWithMonitoring() {
    console.log('🌐 Starting API server...');
    
    const server = spawn('node', ['server.js'], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
    });

    server.on('close', (code) => {
        console.log(\`Server process exited with code \${code}\`);
        if (code !== 0) {
            console.log('🔄 Restarting server in 5 seconds...');
            setTimeout(startWithMonitoring, 5000);
        }
    });

    // Health check after startup
    setTimeout(async () => {
        const isHealthy = await healthCheck();
        if (isHealthy) {
            console.log('🎉 Server is running and healthy!');
        } else {
            console.log('⚠️ Server may not be responding correctly');
        }
    }, 3000);

    return server;
}

// Start the server
startWithMonitoring();
`;
        await fs.writeFile(path.join(distDir, 'start-production.js'), startScript);

        // Create PM2 deployment script
        console.log('⚙️ Creating PM2 deployment script...');
        const pm2Script = `#!/usr/bin/env node

/**
 * PM2 Deployment Manager for TECHNO-ETL Backend
 */

import { spawn } from 'child_process';

const commands = {
    start: () => {
        console.log('🚀 Starting TECHNO-ETL with PM2...');
        return spawn('pm2', ['start', 'ecosystem.config.js'], { stdio: 'inherit' });
    },
    stop: () => {
        console.log('🛑 Stopping TECHNO-ETL...');
        return spawn('pm2', ['stop', 'all'], { stdio: 'inherit' });
    },
    restart: () => {
        console.log('🔄 Restarting TECHNO-ETL...');
        return spawn('pm2', ['restart', 'all'], { stdio: 'inherit' });
    },
    status: () => {
        return spawn('pm2', ['status'], { stdio: 'inherit' });
    },
    logs: () => {
        return spawn('pm2', ['logs', '--lines', '50'], { stdio: 'inherit' });
    },
    monit: () => {
        return spawn('pm2', ['monit'], { stdio: 'inherit' });
    }
};

const command = process.argv[2] || 'start';

if (commands[command]) {
    commands[command]();
} else {
    console.log('Usage: node pm2-deploy.js [start|stop|restart|status|logs|monit]');
    process.exit(1);
}
`;
        await fs.writeFile(path.join(distDir, 'pm2-deploy.js'), pm2Script);

        // Create README for production deployment
        console.log('📖 Creating production README...');
        const readme = `# TECHNO-ETL Backend - Production Deployment

## Quick Start

### Option 1: Direct Node.js
\`\`\`bash
node start-production.js
\`\`\`

### Option 2: PM2 (Recommended)
\`\`\`bash
# Start all services
node pm2-deploy.js start

# Check status
node pm2-deploy.js status

# View logs
node pm2-deploy.js logs

# Monitor
node pm2-deploy.js monit

# Restart
node pm2-deploy.js restart

# Stop
node pm2-deploy.js stop
\`\`\`

## Features

✅ **API Server** - Main REST API on port 5000
✅ **Cron Jobs** - Scheduled tasks every 5 minutes
✅ **File Logging** - Structured logs in ./logs/
✅ **Caching** - Redis with in-memory fallback
✅ **Workers** - Image processing with fallback
✅ **Monitoring** - Performance metrics and health checks
✅ **Security** - Rate limiting, CORS, Helmet
✅ **Error Handling** - Comprehensive error tracking

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api/metrics\` - Performance metrics
- \`GET /api/cache/stats\` - Cache statistics

## Environment Variables

Copy \`.env.production\` and configure:
- \`NODE_ENV=production\`
- \`PORT=5000\`
- \`HOST=0.0.0.0\`
- \`LOG_LEVEL=info\`
- \`REDIS_URL=redis://localhost:6379\` (optional)

## Logs

Logs are written to \`./logs/\` directory:
- \`combined-YYYY-MM-DD.log\` - All logs
- \`error-YYYY-MM-DD.log\` - Error logs only
- \`warn-YYYY-MM-DD.log\` - Warning logs only

## Monitoring

- PM2 Dashboard: \`pm2 monit\`
- Health Check: \`curl http://localhost:5000/api/health\`
- Metrics: \`curl http://localhost:5000/api/metrics\`
`;
        await fs.writeFile(path.join(distDir, 'README.md'), readme);

        // Create cache stats endpoint
        console.log('📊 Adding cache stats endpoint...');
        const cacheStatsRoute = `import express from 'express';
import { getCacheStats } from '../services/cacheService.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const stats = await getCacheStats();
        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
`;
        await fs.ensureDir(path.join(distDir, 'src', 'routes'));
        await fs.writeFile(path.join(distDir, 'src', 'routes', 'cacheRoutes.js'), cacheStatsRoute);

        console.log('✅ Enhanced production build completed successfully!');
        console.log('');
        console.log('📁 Built files are in:', distDir);
        console.log('🚀 To start: cd production && node start-production.js');
        console.log('⚙️ With PM2: cd production && node pm2-deploy.js start');
        console.log('📖 See README.md for full documentation');

    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

buildProduction();
