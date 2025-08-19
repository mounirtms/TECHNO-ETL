/**
 * Quick Context Fix - Emergency Solution
 * Forces React contexts into the correct bundle
 */

const fs = require('fs');
const path = require('path');

console.log('🚨 Emergency React Context Fix...');

// 1. Update Vite config to force React bundling
const viteConfigPath = path.join(__dirname, 'vite.config.js');
let viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

// Replace the manual chunks function with a more aggressive one
const newManualChunks = `          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              // FORCE ALL React ecosystem into ONE chunk to prevent context splitting
              if (id.includes('react') || 
                  id.includes('scheduler') || 
                  id.includes('react-is') ||
                  id.includes('prop-types') ||
                  id.includes('@emotion') ||
                  id.includes('stylis')) {
                return 'vendor-react-all';
              }

              // MUI separate but depends on React
              if (id.includes('@mui')) {
                return 'vendor-mui';
              }

              // Firebase separate
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }

              // Utils separate
              if (id.includes('recharts') || id.includes('date-fns') || id.includes('axios')) {
                return 'vendor-utils';
              }

              // Everything else - should NOT contain React contexts
              return 'vendor-misc';
            }`;

// Find and replace the manualChunks function
const manualChunksRegex = /manualChunks:\s*\(id\)\s*=>\s*{[\s\S]*?return 'vendor-misc';\s*}/;
viteConfig = viteConfig.replace(manualChunksRegex, newManualChunks + `
            }`);

// Add dev mode warnings
const devModeWarnings = `
    // Enhanced development mode with better error reporting
    server: {
      host: '0.0.0.0',
      port: parseInt(env.VITE_PORT) || 3000,
      strictPort: false,
      cors: true,
      hmr: {
        overlay: true
      },
      proxy: {`;

viteConfig = viteConfig.replace(
  /server: {\s*host: '0\.0\.0\.0',/,
  devModeWarnings.trim().replace('server: {', '') + `
      host: '0.0.0.0',`
);

try {
  fs.writeFileSync(viteConfigPath, viteConfig);
  console.log('✅ Updated Vite config for better React bundling');
} catch (error) {
  console.error('❌ Failed to update Vite config:', error.message);
}

// 2. Create a React context validator
const validatorPath = path.join(__dirname, 'src', 'context-validator.js');
const validatorContent = `/**
 * React Context Validator
 * Validates React context availability in dev mode
 */

export const validateReactContext = () => {
  if (process.env.NODE_ENV === 'development') {
    if (typeof React === 'undefined') {
      console.error('🚨 React is not available globally');
      return false;
    }
    
    if (!React.createContext) {
      console.error('🚨 React.createContext is not available');
      return false;
    }
    
    console.log('✅ React context system is available');
    return true;
  }
  
  return true;
};

// Auto-validate in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    validateReactContext();
  }, 100);
}
`;

try {
  fs.writeFileSync(validatorPath, validatorContent);
  console.log('✅ Created React context validator');
} catch (error) {
  console.error('❌ Failed to create validator:', error.message);
}

// 3. Update main.jsx to include validator
const mainJsxPath = path.join(__dirname, 'src', 'main.jsx');
let mainJsxContent = fs.readFileSync(mainJsxPath, 'utf8');

if (!mainJsxContent.includes('context-validator')) {
  mainJsxContent = mainJsxContent.replace(
    "import './react-init.js';",
    `import './react-init.js';
import './context-validator.js';`
  );
  
  try {
    fs.writeFileSync(mainJsxPath, mainJsxContent);
    console.log('✅ Added context validator to main.jsx');
  } catch (error) {
    console.error('❌ Failed to update main.jsx:', error.message);
  }
}

console.log('🎉 Emergency fix applied! Now rebuild with: npm run build');
console.log('💡 For dev mode debugging, use: npm run dev');