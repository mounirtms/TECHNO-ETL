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
    // Check if the 'categories' column includes 'Default Category/Promos'
    if (row.categories.includes('Default Category/Promo Rentree Univ')) {
      const updatedCategories = row.categories
        .split(',')
        .map(category => category.trim())
        .filter(category => category !== 'Default Category/Promo Rentree Univ')
        .join(',');

      skusToUpdate.push(row.sku);
      filteredProducts.push({
        sku: row.sku,
        categories: `"${updatedCategories}"`, // Wrap updated categories in quotes
      });
    } else {
      if (row.categories.includes('Default Category/Promos')) {
        // Remove 'Default Category/Promos' from the categories string
        const updatedCategories = row.categories
          .split(',')
          .map(category => category.trim())
          .filter(category => category !== 'Default Category/Promos')
          .join(',');

        skusToUpdate.push(row.sku);
        filteredProducts.push({
          sku: row.sku,
          categories: `"${updatedCategories}"`, // Wrap updated categories in quotes
        });
      }
    }
  })
  .on('end', () => {
    // Write headers for the new CSV
    const headers = "sku,categories";
    const rows = filteredProducts.map(row => `${row.sku},${row.categories}`);
    const csvOutput = [headers, ...rows].join('\n');

    // Write to a new CSV file
    fs.writeFileSync('../filteredPromosProducts.csv', csvOutput, 'utf8');
    console.log('Filtered products saved to filteredProducts.csv');
  });
