const fs = require('fs');
const csv = require('csv-parser');

// Array of SKUs to filter
const skus = [ 
            
];
const skusToUpdate = [
  570, 630, 632, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 571, 660, 661, 662, 503, 664, 665, 666, 667, 668, 669, 670, 671, 672, 673, 674, 675, 676, 677, 678, 679, 680, 681, 682, 683, 1141150104, 1140629397, 1140605488, 1140592158, 1140637668, 1140640782, 1140640788, 1140640783, 1140640789];
const filePath = '/home/mounir/Apps/IdeaProjects/extract export/src/data/products.csv';
const filteredProducts = [];
 
1141150104,1140629397,1140637668
const axios = require('axios');

const baseUrl = 'https://technostationery.com';
const accessToken = "eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjU3LCJ1dHlwaWQiOjIsImlhdCI6MTc0NTkzNDg0MSwiZXhwIjoxNzQ2MDIxMjQxfQ.T_rLVyr7jr8YbYvgyucDwNKVFXP65MQLesQ6448y-bM"
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
skusToUpdate.forEach((sku) => {
    setTimeout(function () {
      updateVisibility(sku);
    },1000);
  });
