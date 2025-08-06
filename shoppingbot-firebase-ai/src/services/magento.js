const axios = require('axios');
const { magentoBaseUrl, magentoToken } = require('../config');

// Create Magento API client with authentication
const magentoApi = axios.create({ 
  baseURL: magentoBaseUrl,
  headers: {
    'Authorization': `Bearer ${magentoToken || ''}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor for logging
magentoApi.interceptors.request.use(
  (config) => {
    console.log(`🛒 Making Magento API request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Magento API request error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
magentoApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Magento API response: ${response.status} - ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Magento API error: ${error.response?.status || 'Network Error'} - ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    return Promise.reject(error);
  }
);

async function fetchProducts(page = 1, pageSize = 10) {
  try {
    console.log(`📦 Fetching products - Page: ${page}, Size: ${pageSize}`);
    const response = await magentoApi.get(`/rest/V1/products`, {
      params: {
        'searchCriteria[currentPage]': page,
        'searchCriteria[pageSize]': pageSize,
        'searchCriteria[filterGroups][0][filters][0][field]': 'status',
        'searchCriteria[filterGroups][0][filters][0][value]': '1',
        'searchCriteria[filterGroups][0][filters][0][conditionType]': 'eq'
      }
    });
    
    const products = response.data.items.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price || 'N/A',
      short_description: product.custom_attributes?.find(attr => attr.attribute_code === 'short_description')?.value || '',
      status: product.status,
      type: product.type_id
    }));
    
    console.log(`✅ Successfully fetched ${products.length} products`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    // Return mock data if API fails
    return getMockProducts();
  }
}

async function fetchProduct(sku) {
  try {
    console.log(`🔍 Fetching product details for SKU: ${sku}`);
    const response = await magentoApi.get(`/rest/V1/products/${sku}`);
    
    const product = {
      id: response.data.id,
      sku: response.data.sku,
      name: response.data.name,
      price: response.data.price || 'N/A',
      description: response.data.custom_attributes?.find(attr => attr.attribute_code === 'description')?.value || '',
      short_description: response.data.custom_attributes?.find(attr => attr.attribute_code === 'short_description')?.value || '',
      status: response.data.status,
      type: response.data.type_id
    };
    
    console.log(`✅ Successfully fetched product: ${product.name}`);
    return product;
  } catch (error) {
    console.error(`❌ Error fetching product ${sku}:`, error.message);
    return null;
  }
}

async function searchProducts(query, limit = 5) {
  try {
    console.log(`🔍 Searching products for query: "${query}"`);
    const response = await magentoApi.get(`/rest/V1/products`, {
      params: {
        'searchCriteria[filterGroups][0][filters][0][field]': 'name',
        'searchCriteria[filterGroups][0][filters][0][value]': `%${query}%`,
        'searchCriteria[filterGroups][0][filters][0][conditionType]': 'like',
        'searchCriteria[filterGroups][1][filters][0][field]': 'status',
        'searchCriteria[filterGroups][1][filters][0][value]': '1',
        'searchCriteria[filterGroups][1][filters][0][conditionType]': 'eq',
        'searchCriteria[pageSize]': limit
      }
    });
    
    const products = response.data.items.map(product => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price || 'N/A',
      short_description: product.custom_attributes?.find(attr => attr.attribute_code === 'short_description')?.value || ''
    }));
    
    console.log(`✅ Found ${products.length} products matching "${query}"`);
    return products;
  } catch (error) {
    console.error(`❌ Error searching products for "${query}":`, error.message);
    return [];
  }
}

async function getCategories() {
  try {
    console.log('📂 Fetching product categories');
    const response = await magentoApi.get(`/rest/V1/categories`);
    
    const categories = response.data.children_data?.map(category => ({
      id: category.id,
      name: category.name,
      level: category.level,
      is_active: category.is_active
    })) || [];
    
    console.log(`✅ Successfully fetched ${categories.length} categories`);
    return categories;
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
    // Return mock categories if API fails
    return getMockCategories();
  }
}

// Mock data for testing when Magento API is not available
function getMockProducts() {
  console.log('🧪 Using mock product data');
  return [
    {
      id: 1,
      sku: 'MOCK-001',
      name: 'Premium Wireless Headphones',
      price: '99.99',
      short_description: 'High-quality wireless headphones with noise cancellation'
    },
    {
      id: 2,
      sku: 'MOCK-002',
      name: 'Smart Fitness Watch',
      price: '149.99',
      short_description: 'Advanced fitness tracking with heart rate monitor'
    },
    {
      id: 3,
      sku: 'MOCK-003',
      name: 'USB-C Fast Charger',
      price: '29.99',
      short_description: 'Rapid charging for all your devices'
    }
  ];
}

function getMockCategories() {
  console.log('🧪 Using mock category data');
  return [
    { id: 1, name: 'Electronics', level: 1, is_active: true },
    { id: 2, name: 'Clothing', level: 1, is_active: true },
    { id: 3, name: 'Home & Garden', level: 1, is_active: true },
    { id: 4, name: 'Sports & Outdoors', level: 1, is_active: true }
  ];
}

module.exports = { 
  fetchProducts, 
  fetchProduct, 
  searchProducts, 
  getCategories 
};
