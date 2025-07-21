const fs = require('fs');
const csv = require('csv-parser');

const csvFile = '../csvFiles/calligraph_updated.csv';

console.log('🔍 Verifying CSV Update - Checking for processed images');
console.log('='.repeat(60));

let totalRows = 0;
let processedRows = 0;
const processedProducts = [];

fs.createReadStream(csvFile)
  .pipe(csv())
  .on('data', (row) => {
    totalRows++;
    
    if (row['image_processed'] === '✓') {
      processedRows++;
      processedProducts.push({
        ref: row.ref,
        imageName: row['image name'],
        productName: row.name ? row.name.substring(0, 50) + '...' : 'N/A'
      });
    }
  })
  .on('end', () => {
    console.log(`📊 Total products in CSV: ${totalRows}`);
    console.log(`✅ Products marked as processed: ${processedRows}`);
    console.log(`❌ Products not processed: ${totalRows - processedRows}`);
    console.log('');
    
    if (processedProducts.length > 0) {
      console.log('📋 Sample of processed products:');
      console.log('-'.repeat(60));
      processedProducts.slice(0, 10).forEach((product, index) => {
        console.log(`${index + 1}. ${product.ref} - ${product.imageName}`);
      });
      
      if (processedProducts.length > 10) {
        console.log(`... and ${processedProducts.length - 10} more processed products`);
      }
    }
    
    console.log('');
    console.log('✅ CSV verification completed!');
    console.log(`📁 Updated file: ${csvFile}`);
  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });
