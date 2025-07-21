const axios = require('axios');

// Magento Configuration
 
const magentoDomain = 'https://beta.echnostationery.com'; // Replace with your Magento domain
const storeCode = 'default'; // Replace with your store code if needed
const accessToken = '<your-access-token>'; // Replace with your Magento Admin Access Token

// Bulk Product Data
const bulkProductData = [
  {
    sku: 'test-product-1',
    product: {
      sku: 'test-product-1',
      name: 'Test Product 1',
      attribute_set_id: 4,
      price: 100,
      status: 1,
      visibility: 4,
      type_id: 'simple',
      weight: 1,
      extension_attributes: {
        stock_item: {
          qty: 50,
          is_in_stock: true,
        },
      },
    },
    saveOptions: true,
  },
  {
    sku: 'test-product-2',
    product: {
      sku: 'test-product-2',
      name: 'Test Product 2',
      attribute_set_id: 4,
      price: 200,
      status: 1,
      visibility: 4,
      type_id: 'simple',
      weight: 2,
      extension_attributes: {
        stock_item: {
          qty: 30,
          is_in_stock: true,
        },
      },
    },
    saveOptions: true,
  },
];

// Function to Post Bulk Products
const postBulkProducts = async () => {
  const url = `https://${magentoDomain}/rest/${storeCode}/async/bulk/V1/products`;

  try {
    const response = await axios.post(url, bulkProductData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Bulk Operation Submitted:');
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the Script
postBulkProducts();
