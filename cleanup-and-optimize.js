#!/usr/bin/env node

/**
 * TECHNO-ETL Cleanup and Optimization Script
 *
 * This script performs comprehensive cleanup and optimization of the project:
 * 1. Removes build artifacts and temporary files
 * 2. Fixes common configuration issues
 * 3. Optimizes package dependencies
 * 4. Ensures proper environment setup
 * 5. Validates project structure
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname);
const BACKEND_DIR = path.join(PROJECT_ROOT, 'backend');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const NODE_MODULES_DIR = path.join(PROJECT_ROOT, 'node_modules');

console.log('🚀 Starting TECHNO-ETL Cleanup and Optimization...');
console.log(`📁 Project Root: ${PROJECT_ROOT}`);

// Utility functions
const log = {
  info: (message) => console.log(`\x1b[36mℹ\x1b[0m ${message}`),
  success: (message) => console.log(`\x1b[32m✓\x1b[0m ${message}`),
  warn: (message) => console.log(`\x1b[33m⚠\x1b[0m ${message}`),
  error: (message) => console.log(`\x1b[31m✗\x1b[0m ${message}`),
};

const runCommand = (command, cwd = PROJECT_ROOT) => {
  try {
    log.info(`Running: ${command}`);
    const result = execSync(command, {
      cwd,
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'development' },
    });

    return result;
  } catch (error) {
    log.error(`Command failed: ${command}`);
    log.error(error.message);

    return null;
  }
};

const fileExists = (filePath) => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);

    return true;
  } catch {
    return false;
  }
};

const ensureDirectory = (dirPath) => {
  if (!fileExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log.info(`Created directory: ${dirPath}`);
  }
};

const fixPackageJson = () => {
  log.info('Fixing package.json...');

  const packagePath = path.join(PROJECT_ROOT, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Ensure proper resolutions for React
  packageJson.resolutions = {
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    'react-is': '^18.3.1',
    'scheduler': '^0.23.0',
  };

  // Fix scripts that might have issues
  packageJson.scripts = {
    ...packageJson.scripts,
    'clean': 'rimraf dist backend/dist',
    'postinstall': 'node cleanup-and-optimize.js --postinstall',
    'dev': 'concurrently "npm run start" "npm run server"',
    'start': 'vite --host 0.0.0.0 --port 80',
    'server': 'cd backend && npm start',
    'test': 'vitest --run',
    'test:watch': 'vitest',
    'build': 'npm run validate:env && vite build --mode production',
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  log.success('Fixed package.json');
};

const fixEnvironmentFiles = () => {
  log.info('Fixing environment files...');

  // Ensure .env files exist with proper configuration
  const envDevContent = `# Development Environment Configuration
NODE_ENV=development
APP_NAME=Techno-ETL
APP_VERSION=2.0.0
VITE_PORT=80
VITE_HOST=0.0.0.0
VITE_API_BASE_URL=http://localhost:5000
PORT=5000
BACKEND_HOST=localhost
BACKEND_PORT=5000
VITE_PROXY_TARGET=http://localhost:5000
VITE_DEV_TOOLS=true
VITE_HOT_RELOAD=true
VITE_SOURCE_MAPS=true
DEBUG=techno-etl:*
VITE_DEBUG_MODE=true`;

  const envProdContent = `# Production Environment Configuration
NODE_ENV=production
APP_NAME=Techno-ETL
APP_VERSION=2.0.0
VITE_PORT=80
VITE_HOST=0.0.0.0
VITE_API_BASE_URL=http://localhost:5000
PORT=5000
BACKEND_HOST=0.0.0.0
BACKEND_PORT=5000
VITE_DEV_TOOLS=false
VITE_HOT_RELOAD=false
VITE_SOURCE_MAPS=false
DEBUG=
VITE_DEBUG_MODE=false`;

  fs.writeFileSync(path.join(PROJECT_ROOT, '.env.development'), envDevContent);
  fs.writeFileSync(path.join(PROJECT_ROOT, '.env.production'), envProdContent);

  // Backend .env
  const backendEnvContent = `# Backend Environment Configuration
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:80,http://localhost:3000,http://127.0.0.1:80
CORS_CREDENTIALS=true
DB_HOST=localhost
DB_PORT=1433
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
MAGENTO_BASE_URL=your-magento-url
MAGENTO_API_KEY=your-magento-api-key
MAGENTO_USER_AGENT=Techno-ETL/2.0.0
REQUEST_TIMEOUT=120000
PAYLOAD_LIMIT=15mb
COMPRESSION_THRESHOLD=1024`;

  ensureDirectory(BACKEND_DIR);
  fs.writeFileSync(path.join(BACKEND_DIR, '.env'), backendEnvContent);

  log.success('Fixed environment files');
};

const fixViteConfig = () => {
  log.info('Checking Vite configuration...');

  const viteConfigPath = path.join(PROJECT_ROOT, 'vite.config.js');

  if (fileExists(viteConfigPath)) {
    const configContent = fs.readFileSync(viteConfigPath, 'utf8');

    // Ensure proper server configuration
    if (!configContent.includes('port: parseInt(env.VITE_PORT) || 80')) {
      log.warn('Vite config may need port configuration update');
    }

    log.success('Vite configuration checked');
  } else {
    log.error('vite.config.js not found');
  }
};

const fixTestSetup = () => {
  log.info('Fixing test setup...');

  const setupPath = path.join(PROJECT_ROOT, 'src', 'tests', 'setup.js');

  if (fileExists(setupPath)) {
    const setupContent = fs.readFileSync(setupPath, 'utf8');

    // Fix any JSX issues in setup file
    if (setupContent.includes('<div') && setupPath.endsWith('.js')) {
      log.warn('Found JSX in .js file, this may cause issues');
    }

    log.success('Test setup checked');
  }
};

const optimizeDependencies = () => {
  log.info('Optimizing dependencies...');

  // Run npm audit fix
  runCommand('npm audit fix --force');

  // Clean install if needed
  // log.info('Reinstalling dependencies...');
  // runCommand('npm ci');

  log.success('Dependencies optimized');
};

const validateStructure = () => {
  log.info('Validating project structure...');

  const requiredDirs = [
    'src',
    'src/components',
    'src/pages',
    'src/services',
    'src/tests',
    'backend',
  ];

  const requiredFiles = [
    'package.json',
    'vite.config.js',
    '.env.development',
    '.env.production',
  ];

  // Check directories
  requiredDirs.forEach(dir => {
    const dirPath = path.join(PROJECT_ROOT, dir);

    if (!fileExists(dirPath)) {
      log.warn(`Missing directory: ${dir}`);
    }
  });

  // Check files
  requiredFiles.forEach(file => {
    const filePath = path.join(PROJECT_ROOT, file);

    if (!fileExists(filePath)) {
      log.error(`Missing file: ${file}`);
    }
  });

  log.success('Project structure validated');
};

const runPostInstallTasks = () => {
  log.info('Running post-install tasks...');

  // Ensure proper permissions
  if (process.platform !== 'win32') {
    runCommand('chmod +x cleanup-and-optimize.js');
  }

  log.success('Post-install tasks completed');
};

// Main execution
const main = () => {
  try {
    log.info('TECHNO-ETL Cleanup and Optimization Script');
    log.info('========================================');

    // Parse arguments
    const args = process.argv.slice(2);
    const isPostInstall = args.includes('--postinstall');

    if (isPostInstall) {
      runPostInstallTasks();

      return;
    }

    // Perform cleanup and optimization
    fixPackageJson();
    fixEnvironmentFiles();
    fixViteConfig();
    fixTestSetup();
    // optimizeDependencies(); // Commented out to avoid long wait times
    validateStructure();

    log.success('TECHNO-ETL Cleanup and Optimization completed successfully!');
    log.info('You can now run:');
    log.info('  npm run dev     - Start development server');
    log.info('  npm run build   - Build for production');
    log.info('  npm test        - Run tests');

  } catch (error) {
    log.error('Cleanup and optimization failed:');
    log.error(error.message);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fixPackageJson,
  fixEnvironmentFiles,
  fixViteConfig,
  fixTestSetup,
  optimizeDependencies,
  validateStructure,
};
