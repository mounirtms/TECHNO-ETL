const axios = require('axios');

// Magento Configuration
const magentoDomain = 'https://beta.technostationery.com'; // Replace with your Magento domain
const storeCode = 'default'; // Replace with your store code if needed
const accessToken = 'eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjU5LCJ1dHlwaWQiOjIsImlhdCI6MTczNjM0NDA0MCwiZXhwIjoxNzM2NDMwNDQwfQ.KqaWyG52Db27_SmftanfdBuZ0y46NXR36FCBNufXY8Y'; // Replace with your Magento Admin Access Token

// Function to Fetch Products with category_id = 1798
const getProductsByCategory = async () => {
  const url = `https://${magentoDomain}/rest/V1/products`;

  // Build query parameters
  const params = {
    'searchCriteria[filter_groups][0][filters][0][field]': 'custom_attributes',
    'searchCriteria[filter_groups][0][filters][0][value]': 1798,
    'searchCriteria[filter_groups][0][filters][0][condition_type]': 'eq',
    'searchCriteria[pageSize]': 10,
  };

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params,
    });

    console.log('Filtered Products:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the Script
getProductsByCategory();
