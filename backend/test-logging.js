#!/usr/bin/env node

/**
 * Logging Test Script
 * Tests file logging functionality
 */

import { logger } from './src/utils/logger.js';
import fs from 'fs';
import path from 'path';

console.log('📝 Testing TECHNO-ETL Logging System');
console.log('====================================');

async function testLogging() {
    try {
        // Test different log levels
        logger.info('🚀 Starting logging tests', { 
            testId: 'LOG_TEST_001',
            timestamp: new Date().toISOString()
        });

        logger.debug('🔍 Debug message test', { 
            debugData: { key: 'value', number: 42 }
        });

        logger.warn('⚠️ Warning message test', { 
            warningType: 'test_warning',
            severity: 'medium'
        });

        logger.error('❌ Error message test', { 
            errorCode: 'TEST_ERROR',
            errorDetails: 'This is a test error for logging verification'
        });

        // Test API request logging
        logger.request(
            { method: 'GET', url: '/api/test', get: () => 'Test-Agent', ip: '127.0.0.1' },
            { statusCode: 200 },
            25
        );

        // Test database logging
        logger.database('SELECT', 'users', { 
            query: 'SELECT * FROM users WHERE active = 1',
            duration: '15ms'
        });

        // Test sync logging
        logger.sync('price_sync', 'magento', 'success', { 
            recordsProcessed: 150,
            duration: '2.5s'
        });

        // Test server startup logging
        logger.startup('Server initialized successfully', {
            port: 5000,
            environment: 'test',
            features: ['caching', 'logging', 'monitoring']
        });

        console.log('\n✅ All logging tests completed');

        // Check if log files were created
        const logsDir = path.join(process.cwd(), 'logs');
        const today = new Date().toISOString().split('T')[0];
        
        const logFiles = [
            `combined-${today}.log`,
            `error-${today}.log`,
            `warn-${today}.log`
        ];

        console.log('\n📁 Checking log files:');
        for (const logFile of logFiles) {
            const filePath = path.join(logsDir, logFile);
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                console.log(`✅ ${logFile} - Size: ${stats.size} bytes`);
                
                // Show last few lines of the file
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.trim().split('\n');
                console.log(`   Last entry: ${lines[lines.length - 1]}`);
            } else {
                console.log(`❌ ${logFile} - Not found`);
            }
        }

        console.log('\n📊 Log directory contents:');
        const files = fs.readdirSync(logsDir);
        files.forEach(file => {
            const filePath = path.join(logsDir, file);
            const stats = fs.statSync(filePath);
            console.log(`   ${file} - ${stats.size} bytes - ${stats.mtime.toISOString()}`);
        });

    } catch (error) {
        console.error('❌ Logging test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run tests
testLogging().then(() => {
    console.log('\n✅ Logging testing completed');
    process.exit(0);
}).catch((error) => {
    console.error('❌ Logging testing failed:', error);
    process.exit(1);
});
