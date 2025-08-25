/**
 * Final Build TypeScript Verification
 * 
 * This script performs a production build and verifies there are no TypeScript errors.
 * It can be used in CI/CD pipelines to ensure clean TypeScript builds.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_COMMAND = 'npm run build';
const TYPE_CHECK_COMMAND = 'npx tsc --noEmit --project tsconfig.json';
const OUTPUT_FILE = 'final-build-verification.json';

console.log('🔎 Running Final Build TypeScript Verification');

// Function to run a command and capture its output
const runCommand = (command, errorMessage) => {
  try {
    console.log(`Running: ${command}`);
    const output = execSync(command, { encoding: 'utf8' });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: error.stdout ? error.stdout.toString() : '',
      error: error.stderr ? error.stderr.toString() : error.message,
      errorMessage
    };
  }
};

// Main execution
try {
  // Step 1: Run the TypeScript type check
  console.log('\n📝 Step 1: TypeScript Type Check');
  const typeCheckResult = runCommand(TYPE_CHECK_COMMAND, 'TypeScript type check failed');
  
  if (!typeCheckResult.success) {
    console.error('❌ TypeScript type check failed:');
    console.error(typeCheckResult.error || typeCheckResult.output);
    
    // Write report and exit
    const report = {
      timestamp: new Date().toISOString(),
      success: false,
      steps: [
        {
          name: 'TypeScript Type Check',
          success: false,
          error: typeCheckResult.error || typeCheckResult.output
        }
      ]
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    console.error(`Report written to ${OUTPUT_FILE}`);
    process.exit(1);
  }
  
  console.log('✅ TypeScript type check passed');
  
  // Step 2: Run the build
  console.log('\n📝 Step 2: Production Build');
  const buildResult = runCommand(BUILD_COMMAND, 'Production build failed');
  
  if (!buildResult.success) {
    console.error('❌ Production build failed:');
    console.error(buildResult.error || buildResult.output);
    
    // Write report and exit
    const report = {
      timestamp: new Date().toISOString(),
      success: false,
      steps: [
        {
          name: 'TypeScript Type Check',
          success: true
        },
        {
          name: 'Production Build',
          success: false,
          error: buildResult.error || buildResult.output
        }
      ]
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    console.error(`Report written to ${OUTPUT_FILE}`);
    process.exit(1);
  }
  
  console.log('✅ Production build successful');
  
  // Step 3: Verify build artifacts
  console.log('\n📝 Step 3: Verify Build Artifacts');
  const distDir = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distDir) || !fs.readdirSync(distDir).length) {
    console.error('❌ Build artifacts not found or empty dist directory');
    
    // Write report and exit
    const report = {
      timestamp: new Date().toISOString(),
      success: false,
      steps: [
        {
          name: 'TypeScript Type Check',
          success: true
        },
        {
          name: 'Production Build',
          success: true
        },
        {
          name: 'Verify Build Artifacts',
          success: false,
          error: 'Build artifacts not found or empty dist directory'
        }
      ]
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
    console.error(`Report written to ${OUTPUT_FILE}`);
    process.exit(1);
  }
  
  // Count build artifacts
  const files = [];
  const countFiles = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        countFiles(fullPath);
      } else {
        files.push({
          path: fullPath.replace(process.cwd(), ''),
          size: fs.statSync(fullPath).size
        });
      }
    }
  };
  
  countFiles(distDir);
  
  console.log(`✅ Found ${files.length} build artifacts`);
  
  // Write success report
  const report = {
    timestamp: new Date().toISOString(),
    success: true,
    steps: [
      {
        name: 'TypeScript Type Check',
        success: true
      },
      {
        name: 'Production Build',
        success: true
      },
      {
        name: 'Verify Build Artifacts',
        success: true,
        fileCount: files.length,
        totalSize: files.reduce((total, file) => total + file.size, 0),
        files: files.slice(0, 10) // Just include the first 10 files
      }
    ]
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
  
  console.log('\n✨ Final Build Verification Successful ✨');
  console.log(`Report written to ${OUTPUT_FILE}`);
  
  process.exit(0);
} catch (error) {
  console.error('Error during build verification:', error);
  
  // Write error report
  const report = {
    timestamp: new Date().toISOString(),
    success: false,
    error: error.message,
    stack: error.stack
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
  console.error(`Report written to ${OUTPUT_FILE}`);
  
  process.exit(1);
}