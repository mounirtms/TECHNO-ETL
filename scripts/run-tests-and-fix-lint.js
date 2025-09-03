#!/usr/bin/env node

/**
 * Script to run tests and fix lint issues
 * Part of TECHNO-ETL optimization
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TECHNO-ETL - Running Tests and Fixing Lint Issues');
console.log('===============================================\n');

// Function to execute command and handle errors
function runCommand(command, description) {
  console.log(`\n🔧 ${description}`);
  console.log('------------------------');

  try {
    const output = execSync(command, {
      cwd: process.cwd(),
      stdio: 'inherit',
    });

    console.log(`✅ ${description} completed successfully\n`);

    return { success: true, output };
  } catch (error) {
    console.log(`⚠️  ${description} completed with issues (this may be expected)\n`);

    return { success: false, error };
  }
}

// Run tests
console.log('🧪 1. Running Tests');
const testResult = runCommand('npm run test', 'Running all tests');

// Fix lint issues
console.log('\n🧹 2. Fixing Lint Issues');
const lintFixResult = runCommand('npm run lint:fix', 'Fixing lint issues');

// Check for remaining lint issues
console.log('\n🔎 3. Checking for Remaining Lint Issues');
const lintCheckResult = runCommand('npm run lint:check', 'Checking for remaining lint issues');

// Summary
console.log('\n📊 Summary');
console.log('==========');
console.log(`Tests: ${testResult.success ? '✅ Passed' : '⚠️  Completed (check output above)'}`);
console.log(`Lint Fix: ${lintFixResult.success ? '✅ Completed' : '⚠️  Completed (check output above)'}`);
console.log(`Lint Check: ${lintCheckResult.success ? '✅ No issues' : '⚠️  Issues found (check output above)'}`);

console.log('\n✨ Process completed!');
