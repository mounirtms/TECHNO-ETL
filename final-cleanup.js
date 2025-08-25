const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Final cleanup patterns for remaining TypeScript errors
const fixes = [
  // Fix malformed spread operators
  { pattern: /\.\.\?\./g, replacement: '...' },
  { pattern: /\.\.\?\s*\./g, replacement: '...' },
  { pattern: /\.\.\?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g, replacement: '...$1' },
  
  // Fix malformed optional chaining
  { pattern: /\?\s*\?\s*\./g, replacement: '?.' },
  { pattern: /\?\?\./g, replacement: '?.' },
  
  // Fix console calls with malformed optional chaining
  { pattern: /console\s*\?\s*\?\s*\./g, replacement: 'console.' },
  { pattern: /console\?\?\./g, replacement: 'console.' },
  
  // Fix window/document calls
  { pattern: /window\s*\?\s*\?\s*\./g, replacement: 'window.' },
  { pattern: /document\s*\?\s*\?\s*\./g, replacement: 'document.' },
  
  // Fix React calls
  { pattern: /React\s*\?\s*\?\s*\./g, replacement: 'React.' },
  
  // Fix object property access
  { pattern: /(\w+)\s*\?\s*\?\s*\./g, replacement: '$1?.' },
  
  // Fix array/object destructuring with malformed syntax
  { pattern: /\{\s*\.\.\.\?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}/g, replacement: '{...$1}' },
  { pattern: /\[\s*\.\.\.\?\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\]/g, replacement: '[...$1]' },
  
  // Fix function parameters with incorrect syntax
  { pattern: /\(\s*([^)]+)\s+as\s+any\s*\)/g, replacement: '($1: any)' },
  
  // Fix type assertions in wrong places
  { pattern: /:\s*([^,;}\]]+)\s+as\s+any/g, replacement: ': $1' },
  
  // Fix return statements with unnecessary type assertions
  { pattern: /return\s+([^;]+)\s+as\s+any\s*;/g, replacement: 'return $1;' },
  
  // Fix variable assignments with unnecessary type assertions
  { pattern: /=\s*([^;]+)\s+as\s+any\s*;/g, replacement: '= $1;' },
  
  // Fix JSX props with unnecessary type assertions
  { pattern: /=\{([^}]+)\s+as\s+any\}/g, replacement: '={$1}' },
  
  // Fix array methods with malformed parameters
  { pattern: /\.map\(\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: '.map(($1: any) =>' },
  { pattern: /\.filter\(\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: '.filter(($1: any) =>' },
  { pattern: /\.forEach\(\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: '.forEach(($1: any) =>' },
  { pattern: /\.find\(\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: '.find(($1: any) =>' },
  { pattern: /\.reduce\(\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: '.reduce(($1: any) =>' },
  
  // Fix React hooks with malformed parameters
  { pattern: /useCallback\(\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: 'useCallback(($1: any) =>' },
  { pattern: /useMemo\(\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: 'useMemo(($1: any) =>' },
  { pattern: /useEffect\(\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: 'useEffect(($1: any) =>' },
  
  // Fix event handlers
  { pattern: /onClick=\{([^}]+)\s+as\s+any\}/g, replacement: 'onClick={$1}' },
  { pattern: /onChange=\{([^}]+)\s+as\s+any\}/g, replacement: 'onChange={$1}' },
  { pattern: /onSubmit=\{([^}]+)\s+as\s+any\}/g, replacement: 'onSubmit={$1}' },
  
  // Fix generic type parameters
  { pattern: /<([^>]+)\s+as\s+any>/g, replacement: '<$1>' },
  
  // Fix interface/type definitions
  { pattern: /:\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*=>/g, replacement: ': ($1: any) =>' },
  
  // Fix class method parameters
  { pattern: /(\w+)\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*\{/g, replacement: '$1($2: any) {' },
  { pattern: /(\w+)\s*\(\s*([^)]+)\s+as\s+any\s*\)\s*:/g, replacement: '$1($2: any):' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let changesMade = 0;
    
    fixes.forEach(fix => {
      const matches = content.match(fix.pattern);
      if (matches) {
        content = content.replace(fix.pattern, fix.replacement);
        changesMade += matches.length;
      }
    });
    
    if (changesMade > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${changesMade} patterns in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🧹 Starting final cleanup of TypeScript syntax...');
  
  const patterns = [
    'src/**/*.ts',
    'src/**/*.tsx'
  ];
  
  let totalFiles = 0;
  let fixedFiles = 0;
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { ignore: ['node_modules/**', 'dist/**'] });
    
    files.forEach(file => {
      totalFiles++;
      if (fixFile(file)) {
        fixedFiles++;
      }
    });
  });
  
  console.log(`\n📊 Final Cleanup Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files fixed: ${fixedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - fixedFiles}`);
}

main();