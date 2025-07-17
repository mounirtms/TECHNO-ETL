#!/usr/bin/env node

/**
 * Production Deployment Script for Techno ETL
 * Handles building and deploying the application to production environment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Starting Techno ETL Production Deployment...\n');

// Step 1: Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
    if (fs.existsSync(path.join(rootDir, 'dist'))) {
        execSync('rm -rf dist', { cwd: rootDir, stdio: 'inherit' });
    }
    console.log('✅ Clean completed\n');
} catch (error) {
    console.error('❌ Clean failed:', error.message);
    process.exit(1);
}

// Step 2: Install dependencies
console.log('📦 Installing dependencies...');
try {
    execSync('npm ci', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Dependencies installed\n');
} catch (error) {
    console.error('❌ Dependency installation failed:', error.message);
    process.exit(1);
}

// Step 3: Run linting
console.log('🔍 Running linting...');
try {
    execSync('npm run lint', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Linting passed\n');
} catch (error) {
    console.warn('⚠️ Linting warnings detected, continuing...\n');
}

// Step 4: Build frontend for production
console.log('🏗️ Building frontend for production...');
try {
    execSync('npm run build:prod', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Frontend build completed\n');
} catch (error) {
    console.error('❌ Frontend build failed:', error.message);
    process.exit(1);
}

// Step 5: Build backend
console.log('🔧 Building backend...');
try {
    execSync('npm run build:backend', { cwd: rootDir, stdio: 'inherit' });
    console.log('✅ Backend build completed\n');
} catch (error) {
    console.error('❌ Backend build failed:', error.message);
    process.exit(1);
}

// Step 6: Verify build output
console.log('✅ Verifying build output...');
const distDir = path.join(rootDir, 'dist');
const requiredFiles = ['index.html', 'assets'];
const requiredDirs = ['backend'];

for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(distDir, file))) {
        console.error(`❌ Missing required file/directory: ${file}`);
        process.exit(1);
    }
}

for (const dir of requiredDirs) {
    if (!fs.existsSync(path.join(distDir, dir))) {
        console.error(`❌ Missing required directory: ${dir}`);
        process.exit(1);
    }
}

console.log('✅ Build verification passed\n');

// Step 7: Create production info file
console.log('📝 Creating production info...');
const productionInfo = {
    buildTime: new Date().toISOString(),
    version: JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')).version,
    environment: 'production',
    domain: 'etl.techno-dz.com',
    apiUrl: 'https://api.techno-dz.com',
    features: {
        cors: true,
        userAgent: 'Techno-ETL/1.0.0 (etl.techno-dz.com)',
        compression: true,
        minification: true
    }
};

fs.writeFileSync(
    path.join(distDir, 'production-info.json'),
    JSON.stringify(productionInfo, null, 2)
);

console.log('✅ Production info created\n');

// Step 8: Display deployment summary
console.log('🎉 Production Build Completed Successfully!\n');
console.log('📊 Build Summary:');
console.log(`   • Build Time: ${productionInfo.buildTime}`);
console.log(`   • Version: ${productionInfo.version}`);
console.log(`   • Environment: ${productionInfo.environment}`);
console.log(`   • Domain: ${productionInfo.domain}`);
console.log(`   • API URL: ${productionInfo.apiUrl}`);
console.log('\n📁 Output Directory: ./dist');
console.log('\n🚀 Ready for deployment to production server!');
console.log('\n📋 Next Steps:');
console.log('   1. Upload ./dist contents to production server');
console.log('   2. Configure web server (nginx/apache) to serve static files');
console.log('   3. Start backend server with production environment');
console.log('   4. Verify CORS configuration for etl.techno-dz.com');
console.log('   5. Test all API endpoints and Magento integration');
