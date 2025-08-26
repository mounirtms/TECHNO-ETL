const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix Boolean() wrapping JSX
function fixBooleanWrapping(content) {
  // Fix return Boolean(( patterns
  content = content.replace(/return Boolean\(\(/g, 'return (');
  
  // Fix Boolean((Boolean( nested patterns
  content = content.replace(/Boolean\(\(Boolean\(/g, 'Boolean(');
  
  // Fix excessive closing parentheses
  content = content.replace(/\)\)\)\)\)\)/g, ')');
  content = content.replace(/\)\)\)\)\)/g, ')');
  content = content.replace(/\)\)\)\)/g, ')');
  content = content.replace(/\)\)\)/g, ')');
  
  return content;
}

// Function to fix duplicate override keywords
function fixOverrideKeywords(content) {
  content = content.replace(/override override override/g, 'override');
  content = content.replace(/override override/g, 'override');
  return content;
}

// Function to fix type annotations
function fixTypeAnnotations(content) {
  // Fix multiple type annotations like : any: any: any
  content = content.replace(/: any: any: any: any: any/g, ': any');
  content = content.replace(/: any: any: any: any/g, ': any');
  content = content.replace(/: any: any: any/g, ': any');
  content = content.replace(/: any: any/g, ': any');
  
  // Fix string type annotations
  content = content.replace(/: string: any: any: any: any/g, ': string');
  content = content.replace(/: string: any: any: any/g, ': string');
  content = content.replace(/: string: any: any/g, ': string');
  content = content.replace(/: string: any/g, ': string');
  
  return content;
}

// Function to fix display flex duplicates
function fixDisplayFlex(content) {
  content = content.replace(/display: "flex", display: 'flex'/g, "display: 'flex'");
  content = content.replace(/display: "flex", display: "flex"/g, 'display: "flex"');
  return content;
}

// Function to fix variant issues
function fixVariantIssues(content) {
  content = content.replace(/variant="body2"/g, 'variant="outlined"');
  return content;
}

// Function to fix incomplete function definitions
function fixIncompleteFunctions(content) {
  // Fix incomplete arrow functions
  content = content.replace(/handleRetry\s*\n\s*error: null,/g, 'handleRetry = () => {\n    this.setState({\n      hasError: false,\n      error: null,');
  content = content.replace(/handleGoHome\s*\n\s*};/g, 'handleGoHome = () => {\n    window.location.href = \'/\';\n  };');
  
  return content;
}

// Main function to process files
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = fixBooleanWrapping(content);
    content = fixOverrideKeywords(content);
    content = fixTypeAnnotations(content);
    content = fixDisplayFlex(content);
    content = fixVariantIssues(content);
    content = fixIncompleteFunctions(content);
    
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

// Find all TypeScript files
const files = glob.sync('src/**/*.{ts,tsx}', { ignore: ['node_modules/**', 'dist/**'] });

console.log(`Processing ${files.length} files...`);

let fixedCount = 0;
files.forEach(file => {
  if (processFile(file)) {
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} files out of ${files.length} total files.`);