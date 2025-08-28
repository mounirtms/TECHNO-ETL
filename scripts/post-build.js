/**
 * Post-build script to copy docs to dist folder
 * Runs after the main build process
 */

const fs = require('fs-extra');
const path = require('path');

async function copyDocsToDist() {
  try {
    // Ensure docs are copied to dist/docs
    await fs.copy(path.join(__dirname, '..', 'docs', 'dist'), path.join(__dirname, '..', 'dist', 'docs'), { overwrite: true });
    console.log('✅ Docs copied to dist/docs');
  } catch (err) {
    console.error('❌ Failed to copy docs:', err);
  }
}

// Run the copy function
copyDocsToDist();