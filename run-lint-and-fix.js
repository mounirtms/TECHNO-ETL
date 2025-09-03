#!/usr/bin/env node

/**
 * Script to run lint, find issues and auto fix them
 * Part of TECHNO-ETL optimization
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TECHNO-ETL - Running Lint, Finding Issues and Auto-fixing');
console.log('=====================================================\n');

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

// Check current lint issues
console.log('🔎 1. Checking Current Lint Issues');
const lintCheckResult = runCommand('npm run lint', 'Checking for lint issues');

// Attempt to auto-fix lint issues
console.log('\n🔧 2. Auto-fixing Lint Issues');
const lintFixResult = runCommand('npm run lint:fix', 'Auto-fixing lint issues');

// Check remaining lint issues after auto-fix
console.log('\n🔎 3. Checking Remaining Lint Issues After Auto-fix');
const finalLintCheckResult = runCommand('npm run lint:check', 'Checking for remaining lint issues');

// Summary
console.log('\n📊 Summary');
console.log('==========');
console.log(`Initial Lint Check: ${lintCheckResult.success ? '✅ Passed' : '⚠️  Issues found (see above)'}`);
console.log(`Lint Auto-fix: ${lintFixResult.success ? '✅ Completed' : '⚠️  Completed (check output above)'}`);
console.log(`Final Lint Check: ${finalLintCheckResult.success ? '✅ No remaining issues' : '⚠️  Issues remain (see above)'}`);

console.log('\n✨ Lint process completed!');
console.log('\n📝 Note: If issues remain, you may need to manually fix them.');
