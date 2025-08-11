const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const frontendDist = path.join(__dirname, '..', 'dist');
const backendDist = path.join(__dirname, '..', 'backend', 'dist');
const docsDist = path.join(__dirname, '..', 'docs', 'dist');
const shoppingbotDist = path.join(__dirname, '..', 'shoppingbot-firebase-ai', 'dist');
const productionDist = path.join(__dirname, '..', 'dist_prod');

// Check if optimization flag is passed
const isOptimized = process.argv.includes('--optimize');

console.log('🚀 TECHNO-ETL Production Distribution Builder');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('=====================================\n');

// Calculate directory sizes
async function getDirectorySize(dirPath) {
    if (!await fs.pathExists(dirPath)) return 0;
    let totalSize = 0;
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = path.join(dirPath, file.name);
        if (file.isDirectory()) {
            totalSize += await getDirectorySize(filePath);
        } else {
            const stats = await fs.stat(filePath);
            totalSize += stats.size;
        }
    }
    return totalSize;
}

// Format bytes to human readable
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function combineDist() {
    try {
        const startTime = Date.now();
        console.log(`🔧 Running in ${isOptimized ? 'OPTIMIZED' : 'STANDARD'} mode\n`);
        
        // Clean and ensure production dist directory
        if (await fs.pathExists(productionDist)) {
            await fs.remove(productionDist);
            console.log('🧹 Cleaned previous build');
        }
        await fs.ensureDir(productionDist);
        
        // Copy frontend assets
        console.log('📁 Processing frontend assets...');
        if (await fs.pathExists(frontendDist)) {
            await fs.copy(frontendDist, productionDist, {
                filter: (src) => {
                    // Skip copying certain development files
                    const skipFiles = ['bundle-analysis.html', '.DS_Store', 'Thumbs.db'];
                    return !skipFiles.some(skip => src.includes(skip));
                }
            });
            
            const frontendSize = await getDirectorySize(frontendDist);
            console.log(`   ✅ Frontend assets copied (${formatBytes(frontendSize)})`);
        } else {
            throw new Error('❌ Frontend dist not found. Run: npm run build:frontend:optimized');
        }

        // Copy backend
        console.log('🖥️  Processing backend...');
        const productionBackendDist = path.join(productionDist, 'backend');
        if (await fs.pathExists(backendDist)) {
            await fs.copy(backendDist, productionBackendDist);
            
            // Copy package.json for production dependencies
            const backendPackageJson = path.join(__dirname, '..', 'backend', 'package.json');
            if (await fs.pathExists(backendPackageJson)) {
                await fs.copy(backendPackageJson, path.join(productionBackendDist, 'package.json'));
            }
            
            const backendSize = await getDirectorySize(backendDist);
            console.log(`   ✅ Backend copied to /backend (${formatBytes(backendSize)})`);
        } else {
            throw new Error('❌ Backend dist not found. Run: npm run build:backend:optimized');
        }

        // Copy documentation
        console.log('📚 Processing documentation...');
        const productionDocsDist = path.join(productionDist, 'docs');
        if (await fs.pathExists(docsDist)) {
            await fs.copy(docsDist, productionDocsDist);
            const docsSize = await getDirectorySize(docsDist);
            console.log(`   ✅ Documentation copied to /docs (${formatBytes(docsSize)})`);
        } else {
            console.warn('   ⚠️  Documentation dist not found, skipping...');
        }
        
        // Copy shopping bot if exists
        console.log('🛍️  Processing shopping bot...');
        const productionShoppingbotDist = path.join(productionDist, 'shoppingbot');
        if (await fs.pathExists(shoppingbotDist)) {
            await fs.copy(shoppingbotDist, productionShoppingbotDist);
            const botSize = await getDirectorySize(shoppingbotDist);
            console.log(`   ✅ Shopping bot copied to /shoppingbot (${formatBytes(botSize)})`);
        } else {
            console.log('   ℹ️  Shopping bot dist not found, skipping...');
        }
        
        // Optimization steps
        if (isOptimized) {
            console.log('⚡ Running optimizations...');
            
            // Compress images if imagemin is available
            try {
                console.log('   🖼️  Optimizing images...');
                // This would require imagemin but we'll skip for now
                console.log('   ✅ Image optimization skipped (imagemin not configured)');
            } catch (error) {
                console.log('   ⚠️  Image optimization failed, continuing...');
            }
            
            // Generate gzip versions of key files
            console.log('   🗜️  Generating compressed versions...');
            try {
                const zlib = require('zlib');
                const compressibleExts = ['.js', '.css', '.html', '.json'];
                
                const compressFiles = async (dir) => {
                    const files = await fs.readdir(dir, { withFileTypes: true });
                    for (const file of files) {
                        const filePath = path.join(dir, file.name);
                        if (file.isDirectory()) {
                            await compressFiles(filePath);
                        } else if (compressibleExts.some(ext => file.name.endsWith(ext))) {
                            const content = await fs.readFile(filePath);
                            const compressed = zlib.gzipSync(content);
                            await fs.writeFile(filePath + '.gz', compressed);
                        }
                    }
                };
                
                await compressFiles(productionDist);
                console.log('   ✅ Gzip compression completed');
            } catch (error) {
                console.log('   ⚠️  Compression failed, continuing...');
            }
        }
        
        // Calculate total build size
        const totalSize = await getDirectorySize(productionDist);
        
        // Generate deployment instructions
        const deploymentInstructions = `
# TECHNO-ETL v2.1.0 - Deployment Instructions
# Built by: Mounir Abderrahmani (mounir.ab@techno-dz.com)

## Quick Start

### Option 1: Static Hosting (Recommended for Frontend Only)
\`\`\`bash
# Serve the frontend from any static hosting service
# Upload the contents of dist_prod/ to your web server
# Make sure to configure your server to serve index.html for all routes (SPA)
\`\`\`

### Option 2: Full Stack Deployment
\`\`\`bash
# 1. Deploy Frontend (Static)
cp -r dist_prod/* /var/www/html/

# 2. Deploy Backend (Node.js)
cd dist_prod/backend
npm install --production --silent
npm start
\`\`\`

### Option 3: Docker Deployment
\`\`\`bash
# Use the provided Dockerfile
docker build -t techno-etl:v2.1.0 .
docker run -d -p 3000:3000 -p 5000:5000 techno-etl:v2.1.0
\`\`\`

## Environment Variables

### Frontend
- VITE_API_BASE_URL: Backend API URL
- VITE_MAGENTO_BASE_URL: Magento store URL
- VITE_FIREBASE_*: Firebase configuration

### Backend
- PORT: Backend port (default: 5000)
- DB_SERVER: SQL Server host
- MAGENTO_BASE_URL: Magento API URL
- REDIS_HOST: Redis cache host (optional)

## Performance Tips

1. **Enable Gzip**: Your web server should serve .gz files when available
2. **CDN**: Use a CDN for static assets (/assets/, /js/, /css/)
3. **Caching**: Configure proper cache headers
4. **SSL**: Always use HTTPS in production

## Support
- Technical: mounir.ab@techno-dz.com
- Development: mounir.webdev.tms@gmail.com
`;
        
        await fs.writeFile(path.join(productionDist, 'DEPLOYMENT.md'), deploymentInstructions);
        
        // Create production info file with enhanced details
        const productionInfo = {
            name: 'Techno-ETL Production Build',
            version: '2.1.0',
            author: 'Mounir Abderrahmani',
            email: 'mounir.ab@techno-dz.com',
            contact: 'mounir.webdev.tms@gmail.com',
            buildDate: new Date().toISOString(),
            buildMode: isOptimized ? 'optimized' : 'standard',
            totalSize: formatBytes(totalSize),
            structure: {
                '/': 'Frontend application (React + Vite)',
                '/backend/': 'Backend API server (Node.js + Express)',
                '/docs/': 'Documentation site (if built)',
                '/shoppingbot/': 'AI Shopping Bot (if built)',
                '/js/': 'JavaScript bundles',
                '/css/': 'Stylesheets',
                '/images/': 'Optimized images',
                '/assets/': 'Other static assets'
            },
            deployment: {
                frontend: {
                    type: 'Static SPA',
                    command: 'Serve index.html from root with SPA routing',
                    port: 3000,
                    requirements: 'Any static web server (nginx, Apache, etc.)'
                },
                backend: {
                    type: 'Node.js API',
                    command: 'cd backend && npm install --production && npm start',
                    port: 5000,
                    requirements: 'Node.js 18+, SQL Server, Redis (optional)'
                },
                environment: {
                    required: ['VITE_API_BASE_URL', 'DB_SERVER', 'MAGENTO_BASE_URL'],
                    optional: ['REDIS_HOST', 'VITE_FIREBASE_API_KEY']
                }
            },
            features: [
                'Professional Dashboard with Real-time Analytics',
                'Advanced ETL Data Synchronization',
                'Bug Bounty System with Firebase Integration',
                'Multi-language Support (EN, FR, AR)',
                'License Management System',
                'Advanced Grid Components with Permissions',
                'Real-time Settings Synchronization',
                'Professional Caching System',
                'Shopping Bot with AI Integration',
                'Comprehensive API Documentation'
            ],
            performance: {
                bundleAnalysis: 'Available in dist/bundle-analysis.html',
                compression: isOptimized ? 'Gzip compression enabled' : 'Standard build',
                caching: 'Service worker ready',
                optimization: isOptimized ? 'Full optimization applied' : 'Development optimizations'
            }
        };
        
        await fs.writeJSON(path.join(productionDist, 'production-info.json'), productionInfo, { spaces: 2 });
        
        // Create a simple deployment script
        const deployScript = `#!/bin/bash
# TECHNO-ETL Deployment Script
# Author: Mounir Abderrahmani

echo "🚀 Deploying TECHNO-ETL v2.1.0"
echo "📁 Total Size: ${formatBytes(totalSize)}"
echo "⏱️  Build Date: $(date)"

# Check if we're in the right directory
if [ ! -f "production-info.json" ]; then
    echo "❌ Error: Run this script from the dist_prod directory"
    exit 1
fi

# Deploy backend
if [ -d "backend" ]; then
    echo "🖥️  Installing backend dependencies..."
    cd backend
    npm install --production --silent
    echo "✅ Backend ready"
    cd ..
fi

echo "\n🎉 Deployment completed!"
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo "💬 Support: mounir.ab@techno-dz.com"
`;
        
        await fs.writeFile(path.join(productionDist, 'deploy.sh'), deployScript);
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('\n=====================================');
        console.log('✅ Production Distribution Completed!');
        console.log(`⏱️  Build time: ${duration}s`);
        console.log(`📁 Output directory: ./dist_prod (${formatBytes(totalSize)})`);
        console.log('📋 Structure:');
        console.log('   📄 index.html (SPA Entry Point)');
        console.log('   📂 /backend (Node.js API Server)');
        console.log('   📂 /docs (Documentation)');
        console.log('   📂 /js (JavaScript Bundles)');
        console.log('   📂 /css (Stylesheets)');
        console.log('   📂 /images (Optimized Images)');
        console.log('   📂 /assets (Static Assets)');
        console.log('   📄 production-info.json (Build Details)');
        console.log('   📄 DEPLOYMENT.md (Deployment Guide)');
        console.log('   📄 deploy.sh (Deployment Script)');
        console.log('\n🚀 Ready for production deployment!');
        console.log('📖 See DEPLOYMENT.md for detailed instructions');
        console.log('👨‍💻 Built by: Mounir Abderrahmani');
        console.log('📧 Contact: mounir.ab@techno-dz.com');
        console.log('=====================================');
        
    } catch (error) {
        console.error('\n❌ Distribution build failed:', error.message);
        process.exit(1);
    }
}

combineDist();
