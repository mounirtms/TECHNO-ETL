import fs from 'fs';
import { glob } from 'glob';

function fixComparisonOperators(content) {
  // Fix malformed comparison operators = == to ===
  let updated = content;
  
  // Fix patterns like: prop = ==value to prop === value
  updated = updated.replace(/(\w+(?:\.\w+)*)\s*=\s*==/g, '$1 ===');
  
  // Fix patterns in ternary operations: = =='value' ? to === 'value' ?
  updated = updated.replace(/(\w+(?:\.\w+)*)\s*=\s*=='([^']*?)'/g, "$1 === '$2'");
  updated = updated.replace(/(\w+(?:\.\w+)*)\s*=\s*=="([^"]*?)"/g, '$1 === "$2"');
  
  return updated;
}

function fixFile(file) {
  try {
    const orig = fs.readFileSync(file, 'utf8');
    const fixed = fixComparisonOperators(orig);
    if (fixed !== orig) {
      fs.writeFileSync(file, fixed, 'utf8');
      console.log(`✅ Fixed comparison operators in: ${file}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing malformed comparison operators...');
  const patterns = ['src/**/*.ts', 'src/**/*.tsx'];
  let total = 0;
  let changed = 0;
  
  patterns.forEach((pattern) => {
    const files = glob.sync(pattern, { ignore: ['node_modules/**', 'dist/**'] });
    files.forEach((file) => {
      total++;
      if (fixFile(file)) changed++;
    });
  });
  
  console.log(`\n📊 Summary: processed ${total}, changed ${changed}, unchanged ${total - changed}`);
}

main();
