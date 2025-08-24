/**
 * Production Context Fix Script
 * Ensures React contexts work properly in production builds
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Production Context Issues...');

// 1. Update Vite config with safe chunking
const viteConfigPath = path.join(__dirname, 'vite.config.js');
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Replace problematic manual chunks
const safeChunkingStrategy = `
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // CRITICAL: Keep ALL React ecosystem together
              if (id.includes('react') || 
                  id.includes('scheduler') || 
                  id.includes('react-is') ||
                  id.includes('prop-types') ||
                  id.includes('@emotion') ||
                  id.includes('stylis') ||
                  id.includes('@mui')) {
                return 'vendor-react';
              }
              
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              
              return 'vendor-libs';
            }
            
            // App chunks
            if (id.includes('/contexts/')) return 'app-contexts';
            if (id.includes('/components/')) return 'app-components';
            if (id.includes('/services/')) return 'app-services';
          },`;

viteConfig = viteConfig.replace(
  /manualChunks: \(id\) => \{[\s\S]*?\},/,
  safeChunkingStrategy
);

fs.writeFileSync(viteConfigPath, viteConfig);
console.log('✅ Updated Vite configuration with safe chunking');

// 2. Create production validation script
const validationScript = `
// Production Context Validation
if (typeof window !== 'undefined') {
  window.__TECHNO_PRODUCTION_CHECK__ = () => {
    console.log('🔍 Checking React context system...');
    
    if (!window.React) {
      console.error('❌ React not found on window');
      return false;
    }
    
    if (!window.React.createContext) {
      console.error('❌ React.createContext not available');
      return false;
    }
    
    console.log('✅ React context system operational');
    return true;
  };
  
  // Auto-check after load
  setTimeout(() => {
    window.__TECHNO_PRODUCTION_CHECK__();
  }, 1000);
}
`;

fs.writeFileSync(
  path.join(__dirname, 'src', 'production-check.js'),
  validationScript
);

console.log('✅ Created production validation script');
console.log('🎉 Production context fix complete!');
console.log('💡 Run: npm run build && npm run preview:safe');