#!/usr/bin/env node

/**
 * Techno ETL Backend Server Startup Script using PM2
 * This script programmatically starts the application using the ecosystem file.
 * It ensures a consistent startup process for production environments.
 */

import pm2 from 'pm2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environment = process.argv[2] || 'production';

if (environment !== 'production') {
    console.error(`❌ Invalid environment: ${environment}`);
    console.log('For development, please use: npm run backend');
    process.exit(1);
}

const ecosystemConfig = path.join(__dirname, 'ecosystem.config.js');

console.log(`🚀 Starting Techno ETL Backend in [${environment}] mode using PM2...`);
console.log(`📝 Using configuration: ${ecosystemConfig}`);

pm2.connect((err) => {
    if (err) {
        console.error('❌ PM2 connection failed:', err);
        process.exit(2);
    }

    pm2.start(ecosystemConfig, (err, apps) => {
        if (err) {
            console.error('❌ PM2 failed to start application:', err);
            pm2.disconnect();
            process.exit(2);
        }

        console.log('✅ Application started successfully with PM2.');
        console.log('Use "pm2 list" to see the status of your applications.');
        console.log('Use "pm2 logs" to view logs.');

        // Disconnect from the PM2 daemon. The processes will continue to run.
        pm2.disconnect();
    });
});
