const fs = require('fs');
const path = require('path');

/**
 * Migration Script: JavaScript to TypeScript
 * Renames .js files to .ts and .jsx files to .tsx
 */

const excludedFiles = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'vite.config.js', // Already handled
  'tailwind.config.js',
  'postcss.config.js',
  'validate-environment.js', // Keep as JS for now
  'build-optimized.js',
  'deploy-optimized.js'
];

const excludedDirs = [
  'node_modules',
  'dist', 
  'build',
  '.git',
  '.vscode',
  '.kiro'
];

function shouldExclude(filePath) {
  return excludedFiles.some(excluded => filePath.includes(excluded)) ||
         excludedDirs.some(dir => filePath.includes(path.sep + dir + path.sep));
}

function renameJSFiles(dir) {
  const files = fs.readdirSync(dir);
  let renamedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (shouldExclude(filePath)) {
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      renamedCount += renameJSFiles(filePath);
    } else {
      let newPath = null;
      
      if (file.endsWith('.js') && !file.includes('.config.') && !file.includes('.test.')) {
        // Check if file contains JSX
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('import React') || content.includes('jsx') || content.includes('<')) {
          newPath = filePath.replace('.js', '.tsx');
        } else {
          newPath = filePath.replace('.js', '.ts');
        }
      } else if (file.endsWith('.jsx')) {
        newPath = filePath.replace('.jsx', '.tsx');
      }
      
      if (newPath && !fs.existsSync(newPath)) {
        console.log(`Renaming: ${filePath} → ${newPath}`);
        fs.renameSync(filePath, newPath);
        renamedCount++;
      }
    }
  });
  
  return renamedCount;
}

function updateImportPaths(dir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (shouldExclude(filePath)) {
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      updatedCount += updateImportPaths(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // Update import paths from .jsx to .tsx
      content = content.replace(/import\s+.*?\s+from\s+['"]([^'"]*?)\.jsx['"]/g, (match, path) => {
        updated = true;
        return match.replace('.jsx', '.tsx');
      });
      
      // Update import paths from .js to .ts/.tsx
      content = content.replace(/import\s+.*?\s+from\s+['"]([^'"]*?)\.js['"]/g, (match, importPath) => {
        // Check if the imported file exists as .tsx or .ts
        const fullImportPath = path.resolve(path.dirname(filePath), importPath);
        if (fs.existsSync(fullImportPath + '.tsx')) {
          updated = true;
          return match.replace('.js', '.tsx');
        } else if (fs.existsSync(fullImportPath + '.ts')) {
          updated = true;
          return match.replace('.js', '.ts');
        }
        return match;
      });
      
      if (updated) {
        fs.writeFileSync(filePath, content);
        updatedCount++;
        console.log(`Updated imports in: ${filePath}`);
      }
    }
  });
  
  return updatedCount;
}

console.log('🚀 Starting TypeScript Migration...\n');

// Step 1: Rename files
console.log('📁 Step 1: Renaming JS/JSX files to TS/TSX...');
const srcDir = path.join(__dirname, 'src');
const renamedCount = renameJSFiles(srcDir);
console.log(`✅ Renamed ${renamedCount} files\n`);

// Step 2: Update import paths
console.log('🔗 Step 2: Updating import paths...');
const updatedCount = updateImportPaths(srcDir);
console.log(`✅ Updated imports in ${updatedCount} files\n`);

// Step 3: Create TypeScript declaration file for existing JS modules
console.log('📝 Step 3: Creating type declarations...');
const declarationContent = `// Type declarations for migrated modules
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Global declarations
declare global {
  interface Window {
    __REACT_CONTEXT_FIX__?: boolean;
    __APP_VERSION__?: string;
    __BUILD_TIME__?: string;
    __DEV__?: boolean;
    __PROD__?: boolean;
  }
}

export {};
`;

fs.writeFileSync(path.join(__dirname, 'src', 'types', 'global.d.ts'), declarationContent);
console.log('✅ Created global type declarations\n');

console.log('🎉 TypeScript migration completed!');
console.log(`📊 Summary:`);
console.log(`   - Files renamed: ${renamedCount}`);
console.log(`   - Import paths updated: ${updatedCount}`);
console.log(`   - Type declarations created`);
console.log(`\n🔧 Next steps:`);
console.log(`   1. Run 'npm run type-check' to identify type issues`);
console.log(`   2. Add type annotations to components and functions`);
console.log(`   3. Test the application: 'npm run dev'`);
console.log(`   4. Build for production: 'npm run build'`);
