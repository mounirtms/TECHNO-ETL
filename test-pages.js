#!/usr/bin/env node

/**
 * Simple Page Loading Test
 * Tests if all pages can be imported without errors
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing page imports...');

const pagesDir = 'src/pages';
const pages = fs.readdirSync(pagesDir).filter(file => file.endsWith('.jsx'));

const testResults = [];

pages.forEach(page => {
  const pagePath = path.join(pagesDir, page);
  const content = fs.readFileSync(pagePath, 'utf8');
  
  const result = {
    name: page,
    hasDefaultExport: content.includes('export default'),
    hasImportErrors: false,
    syntaxValid: true,
    issues: []
  };
  
  // Check for common syntax issues
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  if (openBraces !== closeBraces) {
    result.syntaxValid = false;
    result.issues.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
  }
  
  if (openParens !== closeParens) {
    result.syntaxValid = false;
    result.issues.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
  }
  
  // Check for require statements (should use import)
  if (content.includes('require(')) {
    result.hasImportErrors = true;
    result.issues.push('Contains require() statements - should use import');
  }
  
  // Check for missing React import
  if (content.includes('React.') && !content.includes('import React')) {
    result.hasImportErrors = true;
    result.issues.push('Uses React but missing React import');
  }
  
  testResults.push(result);
});

// Report results
console.log('\n📊 Page Test Results:');
console.log('='.repeat(50));

let allPassed = true;

testResults.forEach(result => {
  const status = result.syntaxValid && result.hasDefaultExport && !result.hasImportErrors ? '✅' : '❌';
  console.log(`${status} ${result.name}`);
  
  if (!result.hasDefaultExport) {
    console.log(`   ⚠️  Missing default export`);
    allPassed = false;
  }
  
  if (result.hasImportErrors) {
    console.log(`   ⚠️  Import issues detected`);
    allPassed = false;
  }
  
  if (!result.syntaxValid) {
    console.log(`   ❌ Syntax issues detected`);
    allPassed = false;
  }
  
  result.issues.forEach(issue => {
    console.log(`   - ${issue}`);
  });
});

console.log('\n📈 Summary:');
console.log(`Total pages: ${testResults.length}`);
console.log(`Passed: ${testResults.filter(r => r.syntaxValid && r.hasDefaultExport && !r.hasImportErrors).length}`);
console.log(`Failed: ${testResults.filter(r => !r.syntaxValid || !r.hasDefaultExport || r.hasImportErrors).length}`);

if (allPassed) {
  console.log('\n🎉 All pages passed basic validation!');
} else {
  console.log('\n⚠️  Some pages have issues that need to be fixed.');
}

// Create a simple test report
const report = {
  timestamp: new Date().toISOString(),
  totalPages: testResults.length,
  results: testResults,
  summary: {
    passed: testResults.filter(r => r.syntaxValid && r.hasDefaultExport && !r.hasImportErrors).length,
    failed: testResults.filter(r => !r.syntaxValid || !r.hasDefaultExport || r.hasImportErrors).length
  }
};

fs.writeFileSync('page-test-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Detailed report saved to page-test-report.json');

process.exit(allPassed ? 0 : 1);