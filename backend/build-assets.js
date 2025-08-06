#!/usr/bin/env node

/**
 * TECHNO-ETL Backend Assets Build Script
 * Author: Mounir Abderrahmani
 * Email: mounir.ab@techno-dz.com
 * Contact: mounir.webdev.tms@gmail.com
 *
 * This script copies essential assets after webpack bundling
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 TECHNO-ETL Backend Assets Copy Started');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('=====================================\n');

const startTime = Date.now();

try {
  const distDir = path.join(__dirname, 'dist');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    console.error('❌ Dist directory not found. Run webpack build first.');
    process.exit(1);
  }

  // Copy package.json and update it for production
  console.log('📋 Copying and updating package.json...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const distPackageJsonPath = path.join(distDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove dev dependencies and update scripts for production
    delete packageJson.devDependencies;
    packageJson.scripts = {
      start: 'node server.js',
      'start:prod': 'node server.js',
      'pm2:start': 'pm2 start server.js --name techno-etl-backend',
      'pm2:stop': 'pm2 stop techno-etl-backend',
      'pm2:restart': 'pm2 restart techno-etl-backend',
      'pm2:logs': 'pm2 logs techno-etl-backend',
      health: 'curl http://localhost:5000/api/health',
      test: 'curl http://localhost:5000/api/health'
    };
    
    fs.writeFileSync(distPackageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('   ✅ Updated package.json for production');
  }

  // Copy essential files
  const filesToCopy = [
    '.env.example',
    'ecosystem.config.js'
  ];

  filesToCopy.forEach(file => {
    const srcPath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`   ✅ Copied ${file}`);
    }
  });

  // Copy swagger directory
  console.log('📚 Copying swagger directory...');
  const swaggerDir = path.join(__dirname, 'swagger');
  const distSwaggerDir = path.join(distDir, 'swagger');
  
  if (fs.existsSync(swaggerDir)) {
    copyDirectory(swaggerDir, distSwaggerDir);
    console.log('   ✅ Copied swagger directory');
  }

  // Copy production directory if it exists
  const prodDir = path.join(__dirname, 'production');
  const distProdDir = path.join(distDir, 'production');
  
  if (fs.existsSync(prodDir)) {
    console.log('🏭 Copying production directory...');
    copyDirectory(prodDir, distProdDir);
    console.log('   ✅ Copied production directory');
  }

  // Create logs directory
  const logsDir = path.join(distDir, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('📝 Created logs directory');
  }

  // Create production README
  console.log('📖 Creating production README...');
  const prodReadme = `# TECHNO-ETL Backend - Production Build

Author: Mounir Abderrahmani (mounir.ab@techno-dz.com)
Contact: mounir.webdev.tms@gmail.com
Build Date: ${new Date().toISOString()}

## Quick Start

1. Install dependencies:
   npm install --production

2. Configure environment:
   cp .env.example .env
   # Edit .env with your configuration

3. Start the server:
   npm start

## PM2 Deployment

1. Install PM2 globally:
   npm install -g pm2

2. Start with PM2:
   npm run pm2:start

3. Monitor:
   npm run pm2:logs

## Health Check

Once running, check health at:
http://localhost:5000/api/health

## API Documentation

Access Swagger documentation at:
http://localhost:5000/api-docs

Built with ❤️ by Mounir Abderrahmani - Minified & Optimized for Production
`;

  fs.writeFileSync(path.join(distDir, 'README.md'), prodReadme);
  console.log('   ✅ Created production README');

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n=====================================');
  console.log('✅ Backend Assets Copy Completed!');
  console.log(`⏱️  Copy time: ${duration}s`);
  console.log('📁 Output directory: ./dist');
  console.log('🚀 Ready for production deployment');
  console.log('👨‍💻 Built by: Mounir Abderrahmani');
  console.log('=====================================');

} catch (error) {
  console.error('\n❌ Assets copy failed:', error.message);
  process.exit(1);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
