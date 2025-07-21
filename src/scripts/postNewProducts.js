
import csv from 'csv-parser';
import fs from 'fs';
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

            filteredProducts.push({
                product: {
                    "sku": row.sku,
                    "name": row.name,

                    "attribute_set_id": row.attribute_set_id || 4,
                    "price": row.price || 0,
                    "status": 1,
                    "type_id": row.type_id || "simple",
                    "visibility": 4,
                    "extension_attributes": {
                        "stock_item": {
                            "qty": 100,
                            "is_in_stock": true
                        }
                    },
                    "extension_attributes": {
                        "website_ids": [
                            1
                        ],
                        "category_links": [
                            {
                                "position": 0,
                                "category_id": "2408"
                            }
                        ]
                    },
                    "media_gallery_entries": [
                        {
                            "media_type": "image",
                            "label": "Image",
                            "position": 1,
                            "disabled": false,
                            "types": ["image", "small_image", "thumbnail"],
                            "file": row.base_image
                        }
                    ]
                }
            });
        }
    })
    .on('end', () => {
        // Write headers for the new CSV


        // Write to a new CSV file
        fs.writeFileSync('../productToPost.json', JSON.stringify(filteredProducts), 'utf8');
        console.log('Filtered products saved to filteredProducts.csv');




    });
