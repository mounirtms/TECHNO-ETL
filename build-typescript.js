/**
 * Optimized TypeScript Build Script
 * 
 * This script enhances the build process with:
 * 1. Type checking with detailed error reporting
 * 2. Performance optimizations for TypeScript compilation
 * 3. Better error handling and formatting
 */

const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk') || { red: (t) => t, yellow: (t) => t, green: (t) => t, blue: (t) => t };

// Configuration
const PROJECT_ROOT = path.resolve(__dirname);
const TSCONFIG_PATH = path.join(PROJECT_ROOT, 'tsconfig.json');
const VITE_CONFIG_PATH = path.join(PROJECT_ROOT, 'vite.config.ts');
const BUILD_MODE = process.argv[2] || 'production';
const SKIP_TYPE_CHECK = process.argv.includes('--skip-type-check');
const SKIP_LINT = process.argv.includes('--skip-lint');
const ANALYZE_BUNDLE = process.argv.includes('--analyze');

console.log(chalk.blue(`
╔════════════════════════════════════════════════╗
║         TECHNO-ETL OPTIMIZED TS BUILD          ║
╚════════════════════════════════════════════════╝
`));

console.log(chalk.blue(`Build mode: ${chalk.yellow(BUILD_MODE)}`));
console.log(chalk.blue(`Skip type check: ${chalk.yellow(SKIP_TYPE_CHECK ? 'Yes' : 'No')}`));
console.log(chalk.blue(`Skip lint: ${chalk.yellow(SKIP_LINT ? 'Yes' : 'No')}`));
console.log(chalk.blue(`Analyze bundle: ${chalk.yellow(ANALYZE_BUNDLE ? 'Yes' : 'No')}`));
console.log();

// Verify TypeScript configuration
try {
  const tsConfig = require(TSCONFIG_PATH);
  console.log(chalk.blue(`TypeScript configuration loaded successfully`));
  
  // Check for critical settings
  if (tsConfig.compilerOptions.noEmit !== true) {
    console.warn(chalk.yellow(`Warning: 'noEmit' should be set to true for Vite projects`));
  }
  
  if (!tsConfig.compilerOptions.jsx) {
    console.warn(chalk.yellow(`Warning: 'jsx' compiler option is not specified`));
  }
  
  if (!tsConfig.include || !tsConfig.include.includes('src/**/*.ts')) {
    console.warn(chalk.yellow(`Warning: TypeScript config may not include all source files`));
  }
} catch (error) {
  console.error(chalk.red(`Error loading tsconfig.json: ${error.message}`));
  process.exit(1);
}

// Helper function to run a command and return a promise
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(chalk.blue(`Running: ${command} ${args.join(' ')}`));
    
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
    
    proc.on('error', err => {
      reject(err);
    });
  });
}

// Main build process
async function build() {
  try {
    console.log(chalk.blue('\n📝 Starting build process...\n'));
    
    // Step 1: Type checking (if not skipped)
    if (!SKIP_TYPE_CHECK) {
      console.log(chalk.blue('\n🔍 Running type check...\n'));
      
      try {
        await runCommand('npx', ['tsc', '--noEmit', '--pretty']);
        console.log(chalk.green('\n✅ Type check passed\n'));
      } catch (error) {
        console.error(chalk.red('\n❌ Type check failed\n'));
        
        if (process.env.CI) {
          // In CI environment, fail the build
          process.exit(1);
        } else {
          // In development, prompt to continue
          console.log(chalk.yellow(`
⚠️  Type errors detected. You can:
  1. Fix the errors and try again
  2. Run with --skip-type-check to bypass (not recommended)
`));
          
          // Give users a moment to read the error
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
          });
          
          const answer = await new Promise(resolve => {
            readline.question(chalk.yellow('Continue with build despite errors? (y/N): '), resolve);
          });
          
          readline.close();
          
          if (answer.toLowerCase() !== 'y') {
            console.log(chalk.blue('Build cancelled'));
            process.exit(1);
          }
          
          console.log(chalk.yellow('\n⚠️ Continuing build despite type errors\n'));
        }
      }
    } else {
      console.log(chalk.yellow('\n⚠️ Type checking skipped\n'));
    }
    
    // Step 2: Linting (if not skipped)
    if (!SKIP_LINT) {
      console.log(chalk.blue('\n🧹 Running linter...\n'));
      
      try {
        await runCommand('npx', ['eslint', 'src', '--ext', '.ts,.tsx']);
        console.log(chalk.green('\n✅ Linting passed\n'));
      } catch (error) {
        console.warn(chalk.yellow('\n⚠️ Linting found issues but continuing build\n'));
      }
    } else {
      console.log(chalk.yellow('\n⚠️ Linting skipped\n'));
    }
    
    // Step 3: Run Vite build
    console.log(chalk.blue('\n🏗️ Building project...\n'));
    
    const buildArgs = ['vite', 'build', `--mode=${BUILD_MODE}`];
    if (ANALYZE_BUNDLE) {
      buildArgs.push('--analyze');
    }
    
    try {
      await runCommand('npx', buildArgs);
      console.log(chalk.green('\n✅ Build completed successfully\n'));
    } catch (error) {
      console.error(chalk.red(`\n❌ Build failed: ${error.message}\n`));
      process.exit(1);
    }
    
    // Step 4: Output build information
    try {
      const distPath = path.join(PROJECT_ROOT, 'dist');
      const stats = fs.statSync(distPath);
      
      let totalSize = 0;
      let fileCount = 0;
      
      function getDirectorySize(dirPath) {
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          const fileStat = fs.statSync(filePath);
          
          if (fileStat.isDirectory()) {
            getDirectorySize(filePath);
          } else {
            fileCount++;
            totalSize += fileStat.size;
          }
        });
      }
      
      getDirectorySize(distPath);
      
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      console.log(chalk.blue(`
📊 Build Statistics:
  - Total size: ${chalk.green(sizeMB + ' MB')}
  - File count: ${chalk.green(fileCount)}
  - Build mode: ${chalk.green(BUILD_MODE)}
  - Output directory: ${chalk.green('dist/')}
`));
    } catch (error) {
      console.error(chalk.yellow(`\n⚠️ Could not gather build statistics: ${error.message}\n`));
    }
    
    console.log(chalk.green(`
╔════════════════════════════════════════════════╗
║         BUILD COMPLETED SUCCESSFULLY!          ║
╚════════════════════════════════════════════════╝
`));
  } catch (error) {
    console.error(chalk.red(`
❌ Build process failed:
${error.stack || error.message}
`));
    process.exit(1);
  }
}

// Run the build
build();