const fs = require('fs');
const csv = require('csv-parser');

const inputFile = './export_catalog_madeinAlgeria.csv';
const outputFile = './mainAlgeria.json';

let products = [];

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    // Extract relevant attributes only
    if (row.base_image) {
      const product = {
        sku: row.sku,
        name: row.name,
   
        media_gallery_entries: [
          {
            media_type: "image",
            label: "Main Image",
            position: 1,
            disabled: false,
            types: ["image", "small_image", "thumbnail"],
            file: row.base_image
          }
        ]

      }


      products.push({ product: product });
    }
  })
  .on('end', () => {
    // Write the filtered JSON to a file
    fs.writeFile(outputFile, JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error('Error writing JSON file:', err);
      } else {
        console.log(`JSON file successfully created at ${outputFile}`);
      }
    });
  });
