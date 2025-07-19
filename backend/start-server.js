#!/usr/bin/env node

/**
 * Techno ETL Backend Server Startup Script
 * Handles environment setup, port management, and graceful startup
 */

import { spawn } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
    development: {
        port: 5000,
        env: 'development',
        script: 'server.js',
        watch: true
    },
    production: {
        port: 5000,
        env: 'production',
        script: 'index.js',
        watch: false
    }
};

// Get environment from command line args or default to development
const environment = process.argv[2] || 'development';
const serverConfig = config[environment];

if (!serverConfig) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.error(`Available environments: ${Object.keys(config).join(', ')}`);
    process.exit(1);
}

console.log(`🚀 Starting Techno ETL Backend Server...`);
console.log(`📊 Environment: ${serverConfig.env}`);
console.log(`🌐 Port: ${serverConfig.port}`);
console.log(`📁 Script: ${serverConfig.script}`);

// Set environment variables
process.env.NODE_ENV = serverConfig.env;
process.env.PORT = serverConfig.port.toString();

// Start the server
const serverProcess = spawn('node', [serverConfig.script], {
    cwd: __dirname,
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: serverConfig.env,
        PORT: serverConfig.port.toString()
    }
});

// Handle server process events
serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

serverProcess.on('close', (code) => {
    if (code !== 0) {
        console.error(`❌ Server process exited with code ${code}`);
        process.exit(code);
    } else {
        console.log('✅ Server stopped gracefully');
    }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, stopping server...');
    serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, stopping server...');
    serverProcess.kill('SIGINT');
});

console.log(`✅ Server startup script initialized`);
console.log(`🔗 Backend will be available at: http://localhost:${serverConfig.port}`);
console.log(`📡 API endpoints: http://localhost:${serverConfig.port}/api/*`);
console.log(`🏥 Health check: http://localhost:${serverConfig.port}/api/health`);
