#!/usr/bin/env node

/**
 * Script to fix React context issues in TECHNO-ETL
 * Fixes the "Cannot read properties of undefined (reading 'createContext')" error
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React Context Issues in TECHNO-ETL');
console.log('========================================\n');

// Function to fix createContext usage in a file
function fixCreateContext(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if file already has the safe context creation pattern
    if (content.includes('Safe context creation with error handling')) {
      console.log(`✅ ${path.basename(filePath)} already fixed`);

      return true;
    }

    // Find and replace the createContext line
    const createContextPattern = /const (\w+Context) = createContext\(\);/;
    const match = content.match(createContextPattern);

    if (match) {
      const contextName = match[1];
      const replacement = `// Safe context creation with error handling
const ${contextName} = (() => {
  try {
    if (!React.createContext) {
      throw new Error('React.createContext is not available');
    }
    const context = React.createContext();
    context.displayName = '${contextName}';
    return context;
  } catch (error) {
    console.error('Failed to create ${contextName}:', error);
    throw error;
  }
})();`;

      content = content.replace(createContextPattern, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${path.basename(filePath)}`);

      return true;
    } else {
      console.log(`⚠️  No createContext found in ${path.basename(filePath)}`);

      return false;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${path.basename(filePath)}:`, error.message);

    return false;
  }
}

// List of context files to fix
const contextFiles = [
  'src/contexts/AuthContext.jsx',
  'src/contexts/LanguageContext.jsx',
  'src/contexts/PermissionContext.jsx',
  'src/contexts/SettingsContext.jsx',
  'src/contexts/ThemeContext.jsx',
];

let fixedCount = 0;
let errorCount = 0;

// Fix each context file
contextFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);

  if (fs.existsSync(fullPath)) {
    if (fixCreateContext(fullPath)) {
      fixedCount++;
    } else {
      errorCount++;
    }
  } else {
    console.log(`⚠️  File not found: ${file}`);
    errorCount++;
  }
});

console.log('\n📊 Summary:');
console.log(`   ✅ Fixed: ${fixedCount}`);
console.log(`   ❌ Errors: ${errorCount}`);
console.log(`   📁 Total: ${contextFiles.length}`);

if (fixedCount > 0) {
  console.log('\n✨ React context issues fixed! Please rebuild the application:');
  console.log('   npm run build');
}

console.log('\n💡 Tip: For development mode, use:');
console.log('   npm run dev');
