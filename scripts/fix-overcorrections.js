#!/usr/bin/env node

import fs from 'fs';
import { glob } from 'glob';

console.log('🔧 Fixing overcorrected patterns...');

let totalFixes = 0;

function fixOvercorrections() {
  const files = glob.sync('src/**/*.{ts,tsx}');
  
  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Fix overcorrected destructuring parameters
    content = content.replace(/ = \{\}; \/\/ Fixed invalid assignment/g, '');
    
    // Fix overcorrected assignment in trend logic
    content = content.replace(/trend = \{\}; \/\/ Fixed invalid assignment/g, 'trend = "up"');
    
    // Fix any remaining Boolean wrappers
    content = content.replace(/Boolean\(Boolean\(/g, '(');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const fixes = (originalContent.match(/ = \{\}; \/\/ Fixed invalid assignment/g) || []).length;
      if (fixes > 0) {
        console.log(`✅ Fixed ${fixes} overcorrections in ${filePath}`);
        totalFixes += fixes;
      }
    }
  });
  
  console.log(`\n📊 Total overcorrections fixed: ${totalFixes}`);
}

fixOvercorrections();