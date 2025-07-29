#!/usr/bin/env node

/**
 * TECHNO-ETL Backend Build Script
 * Author: Mounir Abderrahmani
 * Email: mounir.ab@techno-dz.com
 * Contact: mounir.webdev.tms@gmail.com
 *
 * This script builds the backend for production deployment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 TECHNO-ETL Backend Build Process Started');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('=====================================\n');

const startTime = Date.now();

try {
  // Create dist directory if it doesn't exist
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 Created dist directory');
  }

  // Copy essential files
  console.log('📋 Copying essential files...');
  
  const filesToCopy = [
    'server.js',
    'package.json',
    '.env.example'
  ];

  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(distDir, file));
      console.log(`   ✅ Copied ${file}`);
    }
  });

  // Copy src directory
  console.log('📂 Copying src directory...');
  const srcDir = path.join(__dirname, 'src');
  const distSrcDir = path.join(distDir, 'src');
  
  if (fs.existsSync(srcDir)) {
    copyDirectory(srcDir, distSrcDir);
    console.log('   ✅ Copied src directory');
  }

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

  // Update package.json for production
  console.log('📦 Updating package.json for production...');
  const packageJsonPath = path.join(distDir, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Remove dev dependencies from production package.json
  delete packageJson.devDependencies;
  packageJson.scripts = {
    start: 'node server.js',
    'pm2:start': 'pm2 start server.js --name techno-etl-backend',
    'pm2:stop': 'pm2 stop techno-etl-backend',
    'pm2:restart': 'pm2 restart techno-etl-backend',
    'pm2:logs': 'pm2 logs techno-etl-backend'
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('   ✅ Updated package.json');

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

Built with ❤️ by Mounir Abderrahmani
`;

  fs.writeFileSync(path.join(distDir, 'README.md'), prodReadme);
  console.log('   ✅ Created production README');

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n=====================================');
  console.log('✅ TECHNO-ETL Backend Build Completed!');
  console.log(`⏱️  Build time: ${duration}s`);
  console.log('📁 Output directory: ./dist');
  console.log('🚀 Ready for production deployment');
  console.log('👨‍💻 Built by: Mounir Abderrahmani');
  console.log('=====================================');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
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
