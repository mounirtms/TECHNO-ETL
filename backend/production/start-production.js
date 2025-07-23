#!/usr/bin/env node

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
        console.log(`Server process exited with code ${code}`);
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
