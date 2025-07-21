const fs = require('fs');
const csv = require('csv-parser');

// Array of SKUs to filter
const skus = [
  1140631841, 1140631840, 1140631839, 1140631834, 1140631825, 1140631815, 1140631814, 1140631824, 1140631813, 1140631811, 1140631816, 1140631807, 1140631827, 1140631829, 1140631826, 1140631828, 1140631844, 1140631843, 1140631842, 1140631810, 1140631835, 1140631836, 1140631837, 1140631838, 1140631845, 1140631808, 1140631809, 1140631848, 1140631846, 1140631847, 1140631017, 1140631070, 1140631020, 1140631021, 1140631067, 1140631019, 1140631022, 1140631023, 1140631032, 1140631029, 1140631028, 1140631033, 1140631030, 1140631018, 1140631065, 1140631069, 1140631068, 1140631066, 1140631031, 1140631027, 1140626179, 1140626181, 1140626180, 1140628769, 1140637935, 1140628767, 1140628764, 1140628766, 1140628765, 1140626410, 1140619152, 1140619151, 1140626405, 1140619150, 1140626402, 1140626406, 1140619122, 1140626408, 1140626403, 1140626407, 1140619028
];
const skusToUpdate = [];
const filePath = '/home/mounir/Apps/IdeaProjects/extract export/src/data/products.csv';
const filteredProducts = [];

if (!fs.existsSync(filePath)) {
  console.error(`Error: File "${filePath}" not found!`);
  process.exit(1);
}


const axios = require('axios');

const baseUrl = 'https://technostationery.com';
const accessToken = 'eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjU3LCJ1dHlwaWQiOjIsImlhdCI6MTczNTY2MDgyNSwiZXhwIjoxNzM1NzQ3MjI1fQ.911O4zYcMagyi3kTo4hepOTqAnxwF7z8lFcs34KDU-Y';


const updateVisibility = async (sku) => {
  try {
    const response = await axios.put(
      `${baseUrl}/rest/V1/products/${sku}`,
      {
        product: {
          visibility: 4 // Set visibility value here
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    console.log(`Product ${sku} updated successfully.`);
  } catch (error) {
    console.error(`Failed to update product ${sku}:`, error.response.data);
  }
};


fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    // Check if the SKU is in the 'skus' array and the product is invisible
    // Assuming 'visibility' column exists and invisible products are marked with a specific value (e.g., '0' or 'invisible')
    if (
      skus.includes(Number(row.sku)) &&
      !row.visibility.includes('Catalog')
    ) {

      skusToUpdate.push(row.sku);
      filteredProducts.push({
        sku: row.sku,
        name: row.name,
        visibility: row.visibility
      });
    }
  })
  .on('end', () => {
    // Write headers for the new CSV
    const headers = "sku,name,visibility";
    const rows = filteredProducts.map(row => `${row.sku},${row.name},${row.visibility}`);
    const csvOutput = [headers, ...rows].join('\n');

    // Write to a new CSV file
    fs.writeFileSync('../filteredInvisibleProducts.csv', csvOutput, 'utf8');
    console.log('Filtered products saved to filteredProducts.csv');



    skusToUpdate.forEach((sku) => {
      setTimeout(function () {
        updateVisibility(sku);
      },10000);
    });
  });





