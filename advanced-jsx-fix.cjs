/**
 * Advanced JSX Syntax Fix Script
 * Fix complex JSX syntax errors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 Starting Advanced JSX Syntax Fixes...');

// Find all TypeScript/JSX files with errors
const files = glob.sync('src/**/*.{ts,tsx}', { 
  cwd: __dirname,
  absolute: true 
});

let fixedCount = 0;

files.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    console.log(`Fixing: ${path.relative(__dirname, filePath)}`);
    
    // Fix 1: Fix malformed JSX self-closing tags
    content = content.replace(/(<[A-Z][a-zA-Z0-9]*[^>]*?)><\//g, '$1></');
    content = content.replace(/><\/([A-Z][a-zA-Z0-9]*\s*)>/g, '></$1>');
    
    // Fix 2: Fix incomplete self-closing tags
    content = content.replace(/(<[A-Z][a-zA-Z0-9]*[^/>]*?)><$/gm, '$1 />');
    content = content.replace(/(<[A-Z][a-zA-Z0-9]*[^/>]*?)>\s*<\/$/gm, '$1 />');
    
    // Fix 3: Fix malformed catch blocks
    content = content.replace(/} catch\s*\(\s*error:\s*any\s*\)\s*{/g, '} catch (error: any) {');
    
    // Fix 4: Fix malformed function parameter types
    content = content.replace(/\(\s*([^:,)]+):\s*([^,)]+)\s+([^:,)]+):\s*([^,)]+)\s*\)/g, '($1: $2, $3: $4)');
    
    // Fix 5: Fix boolean return statement syntax 
    content = content.replace(/return\s*\(\s*Boolean\s*\([^)]+\)\s*;\s*$/gm, 'return Boolean($1));');
    
    // Fix 6: Fix useEffect dependencies
    content = content.replace(/}, \[([^\]]*)\]\);/g, '}, [$1]);');
    
    // Fix 7: Fix array map parameters
    content = content.replace(/\.map\s*\(\s*\(\s*([^:,)]+):\s*any\s+([^:,)]+):\s*any\s*\)\s*=>/g, '.map(($1: any, $2: any) =>');
    
    // Fix 8: Fix object destructuring in function params
    content = content.replace(/\{\s*([^}]+)\s+=\s+\[\]\s*:\s*any\s*,\s*([^}]+)\s+=\s*'[^']*'\s*:\s*any\s*\}/g, '{ $1 = [], $2 = \'product\' }');
    
    // Fix 9: Fix missing return statements in case blocks
    content = content.replace(/case\s+(\d+):\s*$/gm, 'case $1:');
    content = content.replace(/default:\s*$/gm, 'default:');
    
    // Fix 10: Fix React.FC type annotations
    content = content.replace(/React\.FC<\{([^}]*?):\s*any\s*([^}]*?):\s*any\s*:\s*any\}>/g, 'React.FC<{ $1: any; $2: any }>');
    
    // Fix 11: Fix incomplete JSX elements
    content = content.replace(/(<[A-Z][a-zA-Z0-9]*[^/>]*?)>\s*$/gm, '$1>');
    
    // Fix 12: Remove orphaned JSX closing elements at start of lines  
    content = content.replace(/^\s*<\/[A-Z][a-zA-Z0-9]*>\s*$/gm, '');
    content = content.replace(/^\s*\}\s*$/gm, '');
    content = content.replace(/^\s*\)\s*$/gm, '');
    
    // Fix 13: Fix switch statement blocks
    content = content.replace(/case\s+(\d+):\s*([^}]+?)(?=case|\}|default)/gs, (match, caseNum, caseBody) => {
      if (!caseBody.includes('return') && !caseBody.includes('break')) {
        return `case ${caseNum}:\n${caseBody.trim()}\nbreak;\n`;
      }
      return match;
    });
    
    // Check if any changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
      console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Advanced Fix Summary:`);
console.log(`   Files fixed: ${fixedCount}`);

if (fixedCount > 0) {
  console.log(`\n✅ Advanced JSX fixes applied!`);
} else {
  console.log(`\n💡 No additional JSX issues found to fix.`);
}
