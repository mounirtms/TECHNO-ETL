import axios from 'axios';


// Magento API Configuration
const baseUrl =  'https://beta.technostationery.com/rest';
const apiToken = 'eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjMsInV0eXBpZCI6MiwiaWF0IjoxNzM3MzY2NTkwLCJleHAiOjM4OTczNjY1OTB9.Q3lXVVRdzX-4tiptd0kSSKP1sjSQmDHIRkOjlgDaz4Q';

// Axios Config
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiToken}`,
  },
};
// Translations Data
// Translations Data
const categoryId = 2377; // Replace with your category ID
const translations = [
  {
    store_id: 1,
    name: 'منتجات القرطاسية', // Arabic
    url_key: 'stationery-products-ar', // Custom URL key
    is_active: true,
  },
  {
    store_id: 2,
    name: 'Produits de papeterie', // French
    url_key: 'stationery-products-fr', // Custom URL key
    is_active: true,
  },
  {
    store_id: 4,
    name: 'Stationery Products', // English
    url_key: 'stationery-products-en', // Custom URL key
    is_active: true,
  },
];

// Function to Update Translations
const updateTranslation = async (categoryId, storeId, translation) => {
  const url = `${baseUrl}/V1/categories/${categoryId}?storeId=${storeId}`;
  const payload = {
    category: {
      name: translation.name,
      is_active: translation.is_active, // Ensure this attribute is always included
      custom_attributes: [
        { attribute_code: 'url_key', value: translation.url_key }, // Explicitly set the URL key
      ],
    },
  };

  try {
    const response = await axios.put(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
    });
    console.log(`Updated store_id ${storeId}:`, response.data);
  } catch (error) {
    console.error(
      `Error updating store_id ${storeId}:`,
      error.response ? error.response.data : error.message
    );
  }
};

// Bulk Update Translations
const updateTranslations = async () => {
  for (const translation of translations) {
    await updateTranslation(categoryId, translation.store_id, translation);
  }
};

// Run the script
updateTranslations();