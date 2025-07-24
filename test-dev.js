// Simple test to check if Node.js is working
console.log('Node.js is working!');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Check if package.json exists
const fs = require('fs');
const path = require('path');

try {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageExists = fs.existsSync(packagePath);
  console.log('package.json exists:', packageExists);
  
  if (packageExists) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('Project name:', packageContent.name);
    console.log('Scripts available:', Object.keys(packageContent.scripts || {}));
  }
} catch (error) {
  console.error('Error reading package.json:', error.message);
}

// Check if src directory exists
const srcExists = fs.existsSync(path.join(process.cwd(), 'src'));
console.log('src directory exists:', srcExists);

// Check if main.jsx exists
const mainExists = fs.existsSync(path.join(process.cwd(), 'src', 'main.jsx'));
console.log('src/main.jsx exists:', mainExists);

console.log('Test completed successfully!');
