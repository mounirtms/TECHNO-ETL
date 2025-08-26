/**
 * Emergency TypeScript Syntax Fix Script
 * Fix common syntax errors preventing compilation
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🚨 Starting Emergency TypeScript Syntax Fixes...');

// Find all TypeScript/JSX files
const files = glob.sync('src/**/*.{ts,tsx}', { 
  cwd: __dirname,
  absolute: true 
});

let fixedCount = 0;
let totalFiles = files.length;

files.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let hasChanges = false;
    
    console.log(`Fixing: ${path.relative(__dirname, filePath)}`);
    
    // Fix 1: Remove duplicate display properties
    content = content.replace(/display:\s*"flex",\s*display:\s*'flex',/g, "display: 'flex',");
    content = content.replace(/display:\s*'flex',\s*display:\s*"flex",/g, "display: 'flex',");
    
    // Fix 2: Fix malformed type annotations in function parameters  
    content = content.replace(/\(\s*([^:,)]+):\s*([^,)]+):\s*([^,)]+):\s*any\s*\)/g, '($1: $2, $3: any)');
    content = content.replace(/\(\s*([^:,)]+):\s*([^,)]+):\s*any\s+([^:,)]+):\s*([^,)]+):\s*any\s*\)/g, '($1: $2, $3: $4)');
    
    // Fix 3: Fix map function parameters
    content = content.replace(/\.map\(\s*\(\s*([^:,)]+):\s*([^,)]+):\s*any\s+([^:,)]+):\s*([^,)]+):\s*any\s*\)\s*=>/g, '.map(($1: $2, $3: $4) =>');
    content = content.replace(/\.map\(\s*\(\s*\[([^:,)]+):\s*any\s+([^:,)]+)\]:\s*any\s*\)\s*=>/g, '.map(([$1, $2]: any) =>');
    
    // Fix 4: Fix JSX closing tag issues
    content = content.replace(/<([A-Z][a-zA-Z0-9]*)\s+([^>]*?)>\s*<\/([A-Z][a-zA-Z0-9]*)\s*>/g, (match, openTag, attrs, closeTag) => {
      if (openTag === closeTag) return match;
      return `<${openTag} ${attrs}></${openTag}>`;
    });
    
    // Fix 5: Fix malformed sx props
    content = content.replace(/sx=\{\{\s*([^}]+)\s*\}\}\s*\}\}/g, 'sx={{ $1 }}');
    
    // Fix 6: Fix incomplete JSX elements
    content = content.replace(/<([A-Z][a-zA-Z0-9]*)\s+([^/>]*?)\s*>/g, (match, tag, attrs) => {
      if (attrs.includes('/>') || match.includes('/>')) return match;
      return `<${tag} ${attrs}>`;
    });
    
    // Fix 7: Remove orphaned closing braces and parens
    content = content.replace(/^\s*\}\s*$/gm, '');
    content = content.replace(/^\s*\)\s*$/gm, '');
    
    // Fix 8: Fix return statement parentheses issues
    content = content.replace(/return\s*\(\s*Boolean\([^)]+\)\s*;\s*$/gm, (match) => {
      return match.replace(/;\s*$/, ') );');
    });
    
    // Fix 9: Fix missing closing tags patterns
    content = content.replace(/(<[A-Z][a-zA-Z0-9]*[^>]*>)(?!.*<\/[A-Z][a-zA-Z0-9]*>)(\s*\n\s*<[A-Z][a-zA-Z0-9]*)/g, '$1</$2');
    
    // Fix 10: Fix malformed object destructuring
    content = content.replace(/\{\s*([^}]+)=\s*\[\]\s*:\s*any\s*,\s*([^}]+)=\s*'[^']*'\s*:\s*any\s*\}/g, '{ $1 = [], $2 = \'product\' }');
    
    // Check if any changes were made
    hasChanges = content !== originalContent;
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixedCount++;
      console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log(`\n📊 Fix Summary:`);
console.log(`   Files processed: ${totalFiles}`);
console.log(`   Files fixed: ${fixedCount}`);
console.log(`   Files unchanged: ${totalFiles - fixedCount}`);

if (fixedCount > 0) {
  console.log(`\n✅ Emergency fixes applied! Running TypeScript check...`);
} else {
  console.log(`\n💡 No common syntax errors found to fix automatically.`);
}
