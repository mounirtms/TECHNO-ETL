/**
 * Script to add signature to docs content
 * Adds author signature to documentation files
 */

const fs = require('fs');
const path = require('path');

// Signature to add
const signature = `
<!-- 
  TECHNO-ETL Documentation
  Author: Mounir Abderrahmani
  Email: mounir.ab@techno-dz.com
  Website: https://mounir1.github.io
  Generated: ${new Date().toISOString()}
-->
`;

// Function to add signature to HTML files
function addSignatureToHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Recursively process subdirectories
      addSignatureToHtmlFiles(filePath);
    } else if (file.endsWith('.html')) {
      // Add signature to HTML files
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Check if signature already exists
      if (!content.includes('TECHNO-ETL Documentation')) {
        // Add signature at the beginning of the file
        content = signature + '\n' + content;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Signature added to ${filePath}`);
      }
    }
  });
}

// Process docs dist directory
const docsDistDir = path.join(__dirname, '..', 'docs', 'dist');

if (fs.existsSync(docsDistDir)) {
  console.log('Adding signature to docs HTML files...');
  addSignatureToHtmlFiles(docsDistDir);
  console.log('✅ Signature addition completed!');
} else {
  console.log('⚠️ Docs dist directory not found. Please build docs first.');
}