#!/usr/bin/env node

/**
 * TECHNO-ETL Safe Build Script
 * Author: Mounir Abderrahmani
 * Email: mounir.ab@techno-dz.com
 * 
 * Safe build that works around file permission issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔨 TECHNO-ETL Safe Build');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('=====================================\n');

try {
  // Build without cleaning first
  console.log('🎨 Building frontend (safe mode)...');
  execSync('npx vite build --mode production', { stdio: 'inherit' });
  console.log('   ✅ Frontend build completed');

  // Build backend
  console.log('\n🏭 Building backend...');
  execSync('cd backend && node build-optimized.js', { stdio: 'inherit' });
  console.log('   ✅ Backend build completed');

  console.log('\n=====================================');
  console.log('✅ SAFE BUILD COMPLETED!');
  console.log('\n🚀 Next Steps:');
  console.log('1. Frontend: cd dist && npx serve -s . -p 3000');
  console.log('2. Backend: cd backend/dist && npm run deploy');
  console.log('\n🏥 Health Checks:');
  console.log('- Frontend: http://localhost:3000');
  console.log('- Backend: http://localhost:5000/api/health');
  console.log('=====================================');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}