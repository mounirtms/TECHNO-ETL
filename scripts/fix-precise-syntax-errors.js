#!/usr/bin/env node

/**
 * Precise TypeScript Syntax Fix Script
 * Fixes overcorrected patterns and remaining syntax issues
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🔧 Starting precise TypeScript syntax fix...');

let filesProcessed = 0;
let totalFixes = 0;

/**
 * Define precise syntax fixes
 */
const PRECISE_FIXES = [
  // Fix overcorrected destructuring patterns (revert invalid fixes)
  {
    name: 'Fix overcorrected destructuring in function params',
    pattern: /(\w+) = \{\}; \/\/ Fixed invalid assignment\s*$/gm,
    replacement: '$1',
    description: 'Revert invalid destructuring corrections'
  },
  
  // Fix overcorrected interface/type properties
  {
    name: 'Fix overcorrected interface properties',
    pattern: /(\s+)(\w+) = \{\}; \/\/ Fixed invalid assignment$/gm,
    replacement: '$1$2?: any;',
    description: 'Fix interface property syntax'
  },
  
  // Fix any remaining Boolean wrapper issues
  {
    name: 'Fix Boolean wrapper',
    pattern: /Boolean\(\(/g,
    replacement: '(',
    description: 'Remove Boolean wrapper'
  },
  
  // Fix specific Material-UI sx prop patterns that were missed
  {
    name: 'Fix remaining sx prop issues',
    pattern: /sx=\{\{(\s+)/g,
    replacement: 'sx={{$1display: "flex",$1',
    description: 'Fix incomplete sx objects'
  }
];

/**
 * Get all TypeScript and TSX files
 */
function getSourceFiles() {
  const patterns = [
    'src/**/*.tsx',
    'src/**/*.ts'
  ];
  
  let allFiles = [];
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, { 
      cwd: process.cwd(),
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/build/**'
      ]
    });
    allFiles = allFiles.concat(files);
  });
  
  return [...new Set(allFiles)];
}

/**
 * Apply precise fixes to a file
 */
function fixFileContent(filePath, content) {
  let modifiedContent = content;
  let fileFixes = 0;
  
  PRECISE_FIXES.forEach(fix => {
    const matches = modifiedContent.match(fix.pattern);
    if (matches) {
      modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
      fileFixes += matches.length;
    }
  });
  
  return { content: modifiedContent, fixes: fileFixes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = fixFileContent(filePath, content);
    
    if (result.fixes > 0) {
      fs.writeFileSync(filePath, result.content, 'utf8');
      console.log(`✅ Fixed ${result.fixes} issues in ${filePath}`);
      totalFixes += result.fixes;
    }
    
    filesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('📂 Scanning for TypeScript/TSX files...');
  
  const sourceFiles = getSourceFiles();
  console.log(`📋 Found ${sourceFiles.length} source files to process`);
  
  // Process all files
  sourceFiles.forEach(processFile);
  
  console.log('\n📊 Fix Summary:');
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Total fixes applied: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n✅ Precise TypeScript syntax fixes applied!');
    console.log('💡 Run npm run type-check to verify fixes');
  } else {
    console.log('\n✅ No additional syntax errors found to fix');
  }
}

// Execute the main function
main();

export { main, processFile, fixFileContent };