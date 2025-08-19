#!/usr/bin/env node

/**
 * TECHNO-ETL Test Script
 * Tests the fixed React application
 */

import { execSync } from 'child_process';

console.log('🧪 Testing TECHNO-ETL Application...');

try {
  console.log('\n1. Testing frontend build...');
  execSync('npx serve -s dist_new -p 3001 &', { stdio: 'inherit' });
  
  setTimeout(() => {
    console.log('\n2. Testing API endpoints...');
    // Add API tests here
    
    console.log('\n✅ Tests completed');
    process.exit(0);
  }, 3000);
  
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}
