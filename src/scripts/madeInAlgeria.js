const fs = require('fs');
const csv = require('csv-parser');

// Array of SKUs to filter
 
const skusToUpdate = [];
const filePath = '../assets/data/products.csv';
const filteredProducts = [];

if (!fs.existsSync(filePath)) {
  console.error(`Error: File "${filePath}" not found!`);
  process.exit(1);
}



fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    // Check if the SKU is in the 'skus' array and the product is invisible
    // Assuming 'visibility' column exists and invisible products are marked with a specific value (e.g., '0' or 'invisible')
    if (
  
      row.categories.includes('Algeria')
    ) {

      skusToUpdate.push(row.sku);
      filteredProducts.push({
        sku: row.sku,
        name: row.name, 
        categories:row.categories
      });
    }
  })
  .on('end', () => {
    // Write headers for the new CSV
    const headers = "sku,name,categories";
    const rows = filteredProducts.map(row => `${row.sku},${row.name},${row.categories}`);
    const csvOutput = [headers, ...rows].join('\n');

    // Write to a new CSV file
    fs.writeFileSync('../filteredAlgeriaProducts.csv', csvOutput, 'utf8');
    console.log('Filtered products saved to filteredProducts.csv');



    
  });
