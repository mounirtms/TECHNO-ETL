const fs = require('fs');
const csv = require('csv-parser');

// Array of SKUs to filter
const skus = [
  "1140631841", "1140631840", "1140631839", "1140631834", "1140631825",
  "1140631815", "1140631814", "1140631824", "1140631813", "1140631811",
  "1140631816", "1140631807", "1140631827", "1140631829", "1140631826",
  "1140631828", "1140631844", "1140631843", "1140631842", "1140631810",
  "1140631835", "1140631836", "1140631837", "1140631838", "1140631845",
  "1140631808", "1140631809", "1140631848", "1140631846", "1140631847"
];



// Array to store filtered products
const filteredProducts = [];

// Read and parse the CSV file
fs.createReadStream('products.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Check if the SKU is in the 'skus' array
    if (skus.includes(row.sku)) {
      // Push only the required columns and append to the categories string
      filteredProducts.push({
        sku: row.sku,
        categories: `"${row.categories},Default Category/Promos"`
      });
    }
  })
  .on('end', () => {
    // Write headers for the new CSV
    const headers = "sku,categories";
    const rows = filteredProducts.map(row => `${row.sku},${row.categories}`);
    const csvOutput = [headers, ...rows].join('\n');

    // Write to a new CSV file
    fs.writeFileSync('filteredProducts.csv', csvOutput, 'utf8');
    console.log('Filtered products saved to filteredProducts.csv');
  });
