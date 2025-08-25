#!/usr/bin/env node

/**
 * Comprehensive TypeScript Syntax Error Fix Script
 * Fixes remaining syntax corruption patterns in development server
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

console.log('🔧 Starting comprehensive TypeScript syntax error fix...');

// Track statistics
let filesProcessed = 0;
let totalFixes = 0;
const fixPatterns = [];

/**
 * Define all syntax corruption patterns to fix
 */
const SYNTAX_FIXES = [
  // Material-UI sx prop corruption
  {
    name: 'Material-UI sx prop corruption',
    pattern: /sx: any,(\s+)/g,
    replacement: 'sx={{$1',
    description: 'Fix corrupted sx prop syntax'
  },
  
  // Material-UI variant prop corruption
  {
    name: 'Material-UI variant prop corruption',
    pattern: /variant: any,(\s+)/g,
    replacement: 'variant="body2"$1',
    description: 'Fix corrupted variant prop syntax'
  },
  
  // Material-UI size prop corruption
  {
    name: 'Material-UI size prop corruption',
    pattern: /size: any,(\s+)/g,
    replacement: 'size="small"$1',
    description: 'Fix corrupted size prop syntax'
  },
  
  // Invalid assignment patterns (trend: any,)
  {
    name: 'Invalid assignment patterns',
    pattern: /(\w+): any,(\s+)/g,
    replacement: '$1 = {}; // Fixed invalid assignment$2',
    description: 'Fix invalid assignment syntax'
  },
  
  // Corrupted Boolean wrapper
  {
    name: 'Corrupted Boolean wrapper',
    pattern: /return Boolean\(Boolean\(\(/g,
    replacement: 'return (',
    description: 'Fix corrupted Boolean wrapper'
  },
  
  // Fix incomplete object properties in sx
  {
    name: 'Incomplete sx object properties',
    pattern: /sx: any,(\s+)(\w+): /g,
    replacement: 'sx={{$1$2: ',
    description: 'Fix incomplete sx object properties'
  },
  
  // Fix malformed closing braces
  {
    name: 'Malformed closing braces',
    pattern: /\}\}\}(\s*>)/g,
    replacement: '}}$1',
    description: 'Fix extra closing braces'
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
  
  return [...new Set(allFiles)]; // Remove duplicates
}

/**
 * Apply syntax fixes to a file
 */
function fixFileContent(filePath, content) {
  let modifiedContent = content;
  let fileFixes = 0;
  
  SYNTAX_FIXES.forEach(fix => {
    const beforeLength = modifiedContent.length;
    modifiedContent = modifiedContent.replace(fix.pattern, fix.replacement);
    const afterLength = modifiedContent.length;
    
    if (beforeLength !== afterLength) {
      const fixCount = (content.match(fix.pattern) || []).length;
      fileFixes += fixCount;
      
      if (fixCount > 0) {
        fixPatterns.push({
          file: filePath,
          pattern: fix.name,
          count: fixCount
        });
      }
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
  
  // Generate summary
  console.log('\n📊 Fix Summary:');
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Total fixes applied: ${totalFixes}`);
  
  if (fixPatterns.length > 0) {
    console.log('\n🔍 Detailed fix patterns:');
    const patternSummary = {};
    fixPatterns.forEach(fix => {
      if (!patternSummary[fix.pattern]) {
        patternSummary[fix.pattern] = 0;
      }
      patternSummary[fix.pattern] += fix.count;
    });
    
    Object.entries(patternSummary).forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count} fixes`);
    });
  }
  
  if (totalFixes > 0) {
    console.log('\n✅ TypeScript syntax errors fixed successfully!');
    console.log('💡 Run npm run type-check to verify fixes');
  } else {
    console.log('\n✅ No syntax errors found to fix');
  }
}

// Execute the main function
main();

export { main, processFile, fixFileContent };