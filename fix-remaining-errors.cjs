const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix missing commas in function parameters
function fixMissingCommas(content) {
  // Fix patterns like (param1: type param2: type) -> (param1: type, param2: type)
  content = content.replace(/(\w+:\s*\w+)\s+(\w+:\s*\w+)/g, '$1, $2');
  
  // Fix patterns like (error additionalContext: any = {})
  content = content.replace(/\(error\s+additionalContext:/g, '(error: Error, additionalContext:');
  
  // Fix patterns like ([key: any value]: any)
  content = content.replace(/\(\[(\w+):\s*any\s+(\w+)\]:/g, '([$1: any, $2]:');
  
  // Fix patterns like (value row: T)
  content = content.replace(/\(value\s+row:\s*T\)/g, '(value: any, row: T)');
  
  // Fix patterns like (data options: any = {})
  content = content.replace(/\(data\s+options:/g, '(data: any, options:');
  
  return content;
}

// Function to fix missing closing parentheses
function fixMissingParentheses(content) {
  // Fix patterns like isNaN(parseFloat(value) -> isNaN(parseFloat(value))
  content = content.replace(/isNaN\(parseFloat\(([^)]+)\)\s*\{/g, 'isNaN(parseFloat($1))) {');
  content = content.replace(/isNaN\(parseInt\(([^)]+)\)\s*\{/g, 'isNaN(parseInt($1))) {');
  
  // Fix patterns like includes(value.toLowerCase() -> includes(value.toLowerCase())
  content = content.replace(/includes\(([^)]+\.toLowerCase\(\))\s*\{/g, 'includes($1)) {');
  
  // Fix patterns like match(/pattern/) -> match(/pattern/)
  content = content.replace(/match\(([^)]+)\);\s*$/gm, 'match($1);');
  
  return content;
}

// Function to fix invalid assignments and syntax
function fixInvalidAssignments(content) {
  // Fix patterns like = {}; // Fixed invalid assignment
  content = content.replace(/=\s*\{\};\s*\/\/\s*Fixed invalid assignment/g, '');
  
  // Fix patterns like (column = {}; // Fixed invalid assignment index: number)
  content = content.replace(/\((\w+)\s*=\s*\{\};\s*\/\/\s*Fixed invalid assignment\s+(\w+):\s*(\w+)\)/g, '($1: any, $2: $3)');
  
  // Fix patterns like ({ path: any name }: {path: string = {}; // Fixed invalid assignment name: string}: any)
  content = content.replace(/\{\s*path:\s*any\s+name\s*\}:\s*\{path:\s*string\s*=\s*\{\};\s*\/\/[^}]+\}:\s*any/g, '{ path, name }: { path: string, name: string }');
  
  return content;
}

// Function to fix incomplete if statements and blocks
function fixIncompleteBlocks(content) {
  // Fix incomplete if statements
  content = content.replace(/if\s*\([^)]+\)\s*\{([^}]*)\s*$/gm, (match, body) => {
    if (!body.trim().endsWith('}')) {
      return match + '\n  }';
    }
    return match;
  });
  
  // Fix incomplete try-catch blocks
  content = content.replace(/try\s*\{([^}]*)\s*$/gm, (match, body) => {
    if (!body.includes('catch')) {
      return match + '\n  } catch (error) {\n    console.error(error);\n  }';
    }
    return match;
  });
  
  return content;
}

// Function to fix type annotations
function fixTypeAnnotations(content) {
  // Fix patterns like set(key: string, value ttl?: number)
  content = content.replace(/set\(key:\s*string,\s*value\s+ttl\?:\s*number\)/g, 'set(key: string, value: any, ttl?: number)');
  
  // Fix patterns like add(item: T): void {
  content = content.replace(/add\(item:\s*T\):\s*void\s*\{/g, 'add(item: T): void {');
  
  return content;
}

// Function to fix specific syntax issues
function fixSpecificIssues(content) {
  // Fix double equals in format check
  content = content.replace(/options\.format\s*=\s*==\s*"png"/g, 'options.format === "png"');
  
  // Fix missing closing parentheses in return statements
  content = content.replace(/return\s*\(([^)]+)\s*$/gm, 'return ($1);');
  
  // Fix incomplete function definitions
  content = content.replace(/export\s+const\s+(\w+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{([^}]*)\s*$/gm, 
    'export const $1 = async ($2) => {\n$3\n};');
  
  return content;
}

// Function to fix object destructuring issues
function fixDestructuring(content) {
  // Fix patterns like .map(({ path: any name }: any) =>
  content = content.replace(/\.map\(\(\{\s*path:\s*any\s+name\s*\}:\s*any\)/g, '.map(({ path, name }: any)');
  
  return content;
}

// Main function to process files
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = fixMissingCommas(content);
    content = fixMissingParentheses(content);
    content = fixInvalidAssignments(content);
    content = fixIncompleteBlocks(content);
    content = fixTypeAnnotations(content);
    content = fixSpecificIssues(content);
    content = fixDestructuring(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Find all TypeScript files with errors
const errorFiles = [
  'src/services/calligraphMediaUploadService.tsx',
  'src/services/categoryService.tsx',
  'src/services/cegidService.tsx',
  'src/services/dashboardApi.tsx',
  'src/services/DashboardController.tsx',
  'src/services/dashboardService.tsx',
  'src/services/FilterService.tsx',
  'src/services/unifiedMagentoService.ts',
  'src/types/baseComponents.ts',
  'src/types/components.ts',
  'src/utils/catalogProcessor.tsx',
  'src/utils/ColumnFactory.tsx',
  'src/utils/contextWrapper.tsx',
  'src/utils/csvImportUtils.tsx',
  'src/utils/domUtils.ts',
  'src/utils/errorHandler.tsx',
  'src/utils/gridUtils.tsx',
  'src/utils/optimizedComponentLoader.tsx',
  'src/utils/optimizedGridDataHandlers.tsx',
  'src/utils/performanceOptimizations.ts'
];

console.log(`Processing ${errorFiles.length} files with critical errors...`);

let fixedCount = 0;
errorFiles.forEach(file => {
  if (fs.existsSync(file) && processFile(file)) {
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files out of ${errorFiles.length} critical error files.`);