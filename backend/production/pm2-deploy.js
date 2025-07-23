#!/usr/bin/env node

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
