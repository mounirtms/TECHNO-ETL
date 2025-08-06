const fs = require('fs-extra');
const path = require('path');

const frontendDist = path.join(__dirname, '..', 'dist');
const backendDist = path.join(__dirname, '..', 'backend', 'dist');
const docsDist = path.join(__dirname, '..', 'docs', 'dist');
const productionDist = path.join(__dirname, '..', 'dist');

console.log('🚀 TECHNO-ETL Production Distribution Builder');
console.log('👨‍💻 Author: Mounir Abderrahmani');
console.log('=====================================\n');

async function combineDist() {
    try {
        const startTime = Date.now();
        
        // Ensure production dist directory exists
        await fs.ensureDir(productionDist);
        
        console.log('📁 Copying frontend assets...');
        // Copy frontend first (this contains index.html and main assets)
        if (await fs.pathExists(frontendDist)) {
            // Frontend assets are already in the dist folder from vite build
            console.log('   ✅ Frontend assets ready');
        } else {
            throw new Error('Frontend dist not found');
        }

        console.log('🖥️  Copying backend to backend folder...');
        // Copy backend to a backend subfolder
        const productionBackendDist = path.join(productionDist, 'backend');
        if (await fs.pathExists(backendDist)) {
            await fs.copy(backendDist, productionBackendDist);
            console.log('   ✅ Backend copied to /backend');
        } else {
            throw new Error('Backend dist not found');
        }

        console.log('📚 Copying documentation to docs folder...');
        // Copy documentation to a docs subfolder
        const productionDocsDist = path.join(productionDist, 'docs');
        if (await fs.pathExists(docsDist)) {
            await fs.copy(docsDist, productionDocsDist);
            console.log('   ✅ Documentation copied to /docs');
        } else {
            console.warn('   ⚠️  Documentation dist not found, skipping...');
        }
        
        // Create production info file
        const productionInfo = {
            name: 'Techno-ETL Production Build',
            version: '2.1.0',
            author: 'Mounir Abderrahmani',
            email: 'mounir.ab@techno-dz.com',
            contact: 'mounir.webdev.tms@gmail.com',
            buildDate: new Date().toISOString(),
            structure: {
                '/': 'Frontend application (React + Vite)',
                '/backend': 'Backend API server (Node.js + Express) - Minified',
                '/docs': 'Documentation site',
                '/assets': 'Frontend static assets'
            },
            deployment: {
                frontend: 'Serve index.html from root',
                backend: 'cd backend && npm install --production && npm start',
                docs: 'Accessible via /docs route'
            }
        };
        
        await fs.writeJSON(path.join(productionDist, 'production-info.json'), productionInfo, { spaces: 2 });
        
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        
        console.log('\n=====================================');
        console.log('✅ Production Distribution Completed!');
        console.log(`⏱️  Build time: ${duration}s`);
        console.log('📁 Output directory: ./dist');
        console.log('📋 Structure:');
        console.log('   📄 index.html (Frontend)');
        console.log('   📂 /backend (Minified API)');
        console.log('   📂 /docs (Documentation)');
        console.log('   📂 /assets (Frontend assets)');
        console.log('🚀 Ready for production deployment!');
        console.log('👨‍💻 Built by: Mounir Abderrahmani');
        console.log('=====================================');
        
    } catch (error) {
        console.error('\n❌ Distribution build failed:', error.message);
        process.exit(1);
    }
}

combineDist();
