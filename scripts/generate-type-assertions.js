/**
 * Type Assertion Test Generator
 * 
 * This script generates basic type assertion tests for components or modules.
 * Usage: node scripts/generate-type-assertions.js [path/to/component]
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const componentPath = process.argv[2];

if (!componentPath) {
  console.error('Please provide a component path.');
  console.error('Usage: node scripts/generate-type-assertions.js [path/to/component]');
  process.exit(1);
}

// Determine paths and names
const fullPath = path.resolve(process.cwd(), componentPath);
const fileExtension = path.extname(fullPath);
const baseName = path.basename(fullPath, fileExtension);
const dirName = path.dirname(fullPath);

// Check if file exists
if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

// Create test directory if needed
const testDir = path.join(dirName, '__tests__');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Determine test file name
const testFileName = path.join(testDir, `${baseName}.typetest.ts`);

// Read file to analyze exports
const fileContent = fs.readFileSync(fullPath, 'utf8');

// Extract exports (very simple regex, won't work for all cases)
const exportMatches = fileContent.match(/export (?:const|function|class|interface|type) (\w+)/g) || [];
const defaultExportMatch = fileContent.match(/export default (?:function|class)? (\w+)/);

const exports = exportMatches.map(match => {
  const parts = match.split(' ');
  return parts[parts.length - 1];
});

if (defaultExportMatch) {
  exports.push('default');
}

// Create relative import path
const importPath = path.relative(testDir, fullPath).replace(/\\/g, '/');
const importStatement = `./${importPath.startsWith('../') ? importPath : '../' + importPath}`.replace(fileExtension, '');

// Generate test content
const testContent = `/**
 * Type Assertion Test for ${baseName}
 * 
 * This file contains type assertions that verify types
 * are working correctly at compile-time.
 */

import { assertType, assertAssignable, Parameters, ReturnType } from '../../__tests__/typeUtils';
import * as ${baseName}Module from '${importStatement}';

describe('${baseName} Type Definitions', () => {
${exports.map(exportName => {
  if (exportName === 'default') {
    return `  it('default export has correct types', () => {
    // Add type assertions for default export
    const defaultExport = ${baseName}Module.default;
    // assertType(defaultExport, {} as ExpectedType);
  });`;
  } else {
    return `  it('${exportName} has correct types', () => {
    // Add type assertions for ${exportName}
    const exported = ${baseName}Module.${exportName};
    // assertType(exported, {} as ExpectedType);
    
    // For functions, check parameter and return types
    // if (typeof exported === 'function') {
    //   type Params = Parameters<typeof exported>;
    //   type Return = ReturnType<typeof exported>;
    //   // Add assertions for parameter and return types
    // }
  });`;
  }
}).join('\n\n')}
});

export {}; // This export is needed to make the file a module`;

// Write test file
fs.writeFileSync(testFileName, testContent);

console.log(`Generated type assertion test: ${testFileName}`);