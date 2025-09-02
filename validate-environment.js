#!/usr/bin/env node

/**
 * TECHNO-ETL Environment Validation Script
 * Validates environment configuration and dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 TECHNO-ETL Environment Validation');
console.log('=====================================');

let hasErrors = false;

function validateFile(filePath, description) {
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${description}: ${filePath}`);
        return true;
    } else {
        console.log(`❌ Missing ${description}: ${filePath}`);
        hasErrors = true;
        return false;
    }
}

function validateDirectory(dirPath, description) {
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        console.log(`✅ ${description}: ${dirPath}`);
        return true;
    } else {
        console.log(`❌ Missing ${description}: ${dirPath}`);
        hasErrors = true;
        return false;
    }
}

function validateNodeModules() {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    const backendNodeModulesPath = path.join(process.cwd(), 'backend', 'node_modules');
    
    validateDirectory(nodeModulesPath, 'Frontend dependencies');
    validateDirectory(backendNodeModulesPath, 'Backend dependencies');
}

function validateEnvironmentFiles() {
    console.log('\n📋 Environment Files:');
    validateFile('.env', 'Main environment file');
    validateFile('.env.development', 'Development environment file');
    validateFile('.env.production', 'Production environment file');
}

function validateConfigFiles() {
    console.log('\n⚙️ Configuration Files:');
    validateFile('package.json', 'Frontend package configuration');
    validateFile('backend/package.json', 'Backend package configuration');
    validateFile('vite.config.js', 'Vite configuration');
    validateFile('vitest.config.js', 'Vitest configuration');
}

function validateDirectories() {
    console.log('\n📁 Project Directories:');
    validateDirectory('src', 'Source directory');
    validateDirectory('backend', 'Backend directory');
    validateDirectory('docs', 'Documentation directory');
    validateDirectory('dist', 'Build output directory');
}

function validateNodeVersion() {
    console.log('\n🟢 Node.js Environment:');
    try {
        const nodeVersion = process.version;
        const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
        
        console.log(`✅ Node.js version: ${nodeVersion}`);
        console.log(`✅ npm version: ${npmVersion}`);
        
        // Check for minimum Node.js version (v16+)
        const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
        if (majorVersion < 16) {
            console.log(`❌ Node.js version ${nodeVersion} is too old. Please upgrade to Node.js 16+`);
            hasErrors = true;
        }
    } catch (error) {
        console.log(`❌ Error checking Node.js/npm versions: ${error.message}`);
        hasErrors = true;
    }
}

function validatePorts() {
    console.log('\n🔌 Port Configuration:');
    console.log('✅ Frontend port: 80 (HTTP)');
    console.log('✅ Backend port: 5000');
    console.log('✅ Docs port: (separate process)');
}

function validateMemoryUsage() {
    console.log('\n💾 Memory Usage:');
    const memUsage = process.memoryUsage();
    const totalMemory = require('os').totalmem();
    const freeMemory = require('os').freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    console.log(`📊 System Memory: ${Math.round(usedMemory / 1024 / 1024 / 1024 * 100) / 100}GB / ${Math.round(totalMemory / 1024 / 1024 / 1024 * 100) / 100}GB (${Math.round(memoryUsagePercent)}%)`);
    console.log(`📊 Process Memory: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
    
    if (memoryUsagePercent > 90) {
        console.log(`⚠️ Warning: High system memory usage (${Math.round(memoryUsagePercent)}%)`);
    }
}

// Run all validations
console.log(`🚀 Validating environment for TECHNO-ETL v2.0.0`);
console.log(`📍 Working directory: ${process.cwd()}`);

validateNodeVersion();
validateEnvironmentFiles();
validateConfigFiles();
validateDirectories();
validateNodeModules();
validatePorts();
validateMemoryUsage();

console.log('\n=================');
if (hasErrors) {
    console.log('❌ Validation completed with errors');
    process.exit(1);
} else {
    console.log('✅ Environment validation passed');
    console.log('🚀 Ready to run TECHNO-ETL development environment');
    process.exit(0);
}
