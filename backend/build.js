#!/usr/bin/env node

/**
 * Simple build script for TECHNO-ETL Backend
 * Copies source files to dist directory for production deployment
 */

import fs from 'fs-extra';
import path from 'path';

const sourceDir = process.cwd();
const distDir = path.join(sourceDir, 'dist');

console.log('🏗️  Building TECHNO-ETL Backend...');

async function build() {
    try {
        // Clean dist directory
        console.log('🧹 Cleaning dist directory...');
        await fs.remove(distDir);
        await fs.ensureDir(distDir);

        // Copy main files
        console.log('📁 Copying main files...');
        await fs.copy(path.join(sourceDir, 'server.js'), path.join(distDir, 'server.js'));
        await fs.copy(path.join(sourceDir, 'cron-runner.js'), path.join(distDir, 'cron-runner.js'));
        await fs.copy(path.join(sourceDir, 'production.config.js'), path.join(distDir, 'production.config.js'));
        await fs.copy(path.join(sourceDir, 'ecosystem.config.js'), path.join(distDir, 'ecosystem.config.js'));

        // Copy src directory
        console.log('📂 Copying src directory...');
        await fs.copy(path.join(sourceDir, 'src'), path.join(distDir, 'src'));

        // Copy queries directory
        console.log('📄 Copying queries directory...');
        await fs.copy(path.join(sourceDir, 'queries'), path.join(distDir, 'queries'));

        // Copy package.json
        console.log('📦 Copying package.json...');
        await fs.copy(path.join(sourceDir, 'package.json'), path.join(distDir, 'package.json'));

        // Create production environment file
        console.log('🔧 Creating production environment...');
        const prodEnv = `NODE_ENV=production
PORT=5000
HOST=0.0.0.0
LOG_LEVEL=info
`;
        await fs.writeFile(path.join(distDir, '.env'), prodEnv);

        // Create start script
        console.log('🚀 Creating start script...');
        const startScript = `#!/usr/bin/env node
// Production start script
import './server.js';
`;
        await fs.writeFile(path.join(distDir, 'start.js'), startScript);

        // Create logs directory
        console.log('📝 Creating logs directory...');
        await fs.ensureDir(path.join(distDir, 'logs'));

        console.log('✅ Build completed successfully!');
        console.log(`📁 Built files are in: ${distDir}`);
        console.log('🚀 To start production server: cd dist && node server.js');

    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

build();
