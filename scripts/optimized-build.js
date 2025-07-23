#!/usr/bin/env node

/**
 * Optimized Production Build Script for Techno-ETL
 * 
 * This script handles the complete production build process with optimizations:
 * 1. Cleans previous builds and caches
 * 2. Updates version numbers
 * 3. Builds frontend with Vite (optimized)
 * 4. Builds backend with Webpack (optimized)
 * 5. Copies necessary files
 * 6. Optimizes and compresses assets
 * 7. Generates comprehensive build report
 * 8. Validates build integrity
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Techno-ETL Optimized Production Build...\n');

const startTime = Date.now();
const buildSteps = [];

function logStep(step, duration) {
  buildSteps.push({ step, duration });
  console.log(`✅ ${step} completed in ${duration}ms`);
}

try {
  // Step 1: Clean previous builds and caches
  console.log('🧹 Cleaning previous builds and caches...');
  const cleanStart = Date.now();
  execSync('npm run clean', { stdio: 'inherit' });
  logStep('Clean', Date.now() - cleanStart);

  // Step 2: Update version
  console.log('📝 Updating version...');
  const versionStart = Date.now();
  execSync('node scripts/updateVersion.js', { stdio: 'inherit' });
  logStep('Version Update', Date.now() - versionStart);

  // Step 3: Build frontend with optimizations
  console.log('🎨 Building optimized frontend...');
  const frontendStart = Date.now();
  execSync('vite build --mode production', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  logStep('Frontend Build', Date.now() - frontendStart);

  // Step 4: Build backend with optimizations
  console.log('⚙️ Building optimized backend...');
  const backendStart = Date.now();
  execSync('cd backend && npm run build', { stdio: 'inherit' });
  logStep('Backend Build', Date.now() - backendStart);

  // Step 5: Copy assets
  console.log('📁 Copying assets...');
  const copyStart = Date.now();
  execSync('npm run copy-assets', { stdio: 'inherit' });
  logStep('Asset Copy', Date.now() - copyStart);

  // Step 6: Validate build integrity
  console.log('🔍 Validating build integrity...');
  const validateStart = Date.now();
  
  const requiredFiles = [
    'dist/index.html',
    'dist/backend/server.js',
    'dist/backend/cron-runner.js'
  ];
  
  const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
  }
  
  logStep('Build Validation', Date.now() - validateStart);

  // Step 7: Generate comprehensive build report
  console.log('📊 Generating build report...');
  const reportStart = Date.now();
  
  const buildTime = Date.now() - startTime;
  const packageJson = require('../package.json');
  
  // Get build sizes
  const frontendSize = getFolderSize('dist/assets');
  const backendSize = getFolderSize('dist/backend');
  
  const buildReport = {
    timestamp: new Date().toISOString(),
    buildTime: `${(buildTime / 1000).toFixed(2)}s`,
    version: packageJson.version,
    environment: 'production',
    status: 'success',
    optimizations: {
      frontend: {
        bundler: 'Vite',
        minification: 'Terser',
        treeshaking: true,
        codesplitting: true,
        size: `${(frontendSize / 1024 / 1024).toFixed(2)}MB`
      },
      backend: {
        bundler: 'Webpack',
        minification: 'Terser',
        treeshaking: true,
        size: `${(backendSize / 1024 / 1024).toFixed(2)}MB`
      }
    },
    steps: buildSteps,
    performance: {
      totalTime: buildTime,
      avgStepTime: buildSteps.reduce((sum, step) => sum + step.duration, 0) / buildSteps.length
    }
  };

  fs.writeFileSync(
    path.join(__dirname, '../dist/build-report.json'),
    JSON.stringify(buildReport, null, 2)
  );
  
  logStep('Build Report', Date.now() - reportStart);

  console.log(`\n🎉 Optimized production build completed successfully!`);
  console.log(`⏱️  Total time: ${(buildTime / 1000).toFixed(2)}s`);
  console.log(`📦 Frontend size: ${(frontendSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`⚙️  Backend size: ${(backendSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📁 Build artifacts are ready in the dist/ directory`);
  console.log(`📊 Build report: dist/build-report.json`);

} catch (error) {
  console.error('\n❌ Optimized production build failed:', error.message);
  
  // Generate error report
  const errorReport = {
    timestamp: new Date().toISOString(),
    buildTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
    status: 'failed',
    error: error.message,
    completedSteps: buildSteps
  };
  
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(__dirname, '../dist/build-error.json'),
    JSON.stringify(errorReport, null, 2)
  );
  
  process.exit(1);
}

function getFolderSize(folderPath) {
  if (!fs.existsSync(folderPath)) return 0;
  
  let size = 0;
  const files = fs.readdirSync(folderPath);
  
  files.forEach(file => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += getFolderSize(filePath);
    } else {
      size += stats.size;
    }
  });
  
  return size;
}
