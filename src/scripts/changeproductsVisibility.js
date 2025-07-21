const axios = require('axios');

const baseUrl = 'https://technostationery.com';
const accessToken = 'eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjU3LCJ1dHlwaWQiOjIsImlhdCI6MTczNTY2MDgyNSwiZXhwIjoxNzM1NzQ3MjI1fQ.911O4zYcMagyi3kTo4hepOTqAnxwF7z8lFcs34KDU-Y';
const skus = [1140631841, 1140631840, 1140631839]; // Add your SKUs here

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

skus.forEach((sku) => {
  updateVisibility(sku);
});
