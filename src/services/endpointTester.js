/**
 * Endpoint Testing and Validation Service
 * Tests all API endpoints to ensure they function correctly
 */

import axios from 'axios';

/**
 * Test configuration for different endpoint types
 */
const ENDPOINT_TESTS = {
  // MDM Endpoints
  mdm: [
    {
      name: 'MDM Inventory',
      endpoint: '/api/mdm/inventory',
      method: 'GET',
      params: { limit: 5 },
      expectedFields: ['Code_MDM', 'QteStock', 'Tarif']
    },
    {
      name: 'MDM Sync Stocks',
      endpoint: '/api/mdm/sync/stocks',
      method: 'POST',
      data: { syncAll: true, sources: 'all' },
      skipInBatch: true // Skip in batch testing due to side effects
    },
    {
      name: 'MDM Sync Prices',
      endpoint: '/api/mdm/sync/prices',
      method: 'POST',
      data: { syncAll: true, updateMagento: true },
      skipInBatch: true // Skip in batch testing due to side effects
    }
  ],
  
  // Magento Endpoints
  magento: [
    {
      name: 'Magento Products',
      endpoint: '/api/magento/products',
      method: 'GET',
      params: { 'searchCriteria[pageSize]': 5 },
      expectedFields: ['items']
    },
    {
      name: 'Magento Orders',
      endpoint: '/api/magento/orders',
      method: 'GET',
      params: { 'searchCriteria[pageSize]': 5 },
      expectedFields: ['items']
    },
    {
      name: 'Magento Customers',
      endpoint: '/api/magento/customers',
      method: 'GET',
      params: { 'searchCriteria[pageSize]': 5 },
      expectedFields: ['items']
    },
    {
      name: 'Magento Categories',
      endpoint: '/api/magento/categories',
      method: 'GET',
      expectedFields: ['children_data']
    },
    {
      name: 'Magento Stock Sources',
      endpoint: '/api/magento/inventory/sources',
      method: 'GET',
      expectedFields: []
    }
  ],
  
  // Dashboard Endpoints
  dashboard: [
    {
      name: 'Dashboard Stats',
      endpoint: '/api/dashboard/stats',
      method: 'GET',
      expectedFields: ['totalOrders', 'totalCustomers', 'totalProducts']
    }
  ],
  
  // Health Check
  health: [
    {
      name: 'Backend Health',
      endpoint: '/api/health',
      method: 'GET',
      expectedFields: ['status', 'timestamp', 'uptime']
    }
  ]
};

/**
 * Test a single endpoint
 * @param {Object} test - Test configuration
 * @returns {Promise<Object>} Test result
 */
export const testEndpoint = async (test) => {
  const startTime = Date.now();
  
  try {
    console.log(`🧪 Testing ${test.name}...`);
    
    const config = {
      method: test.method,
      url: test.endpoint,
      timeout: 10000 // 10 second timeout
    };
    
    if (test.params) {
      config.params = test.params;
    }
    
    if (test.data) {
      config.data = test.data;
    }
    
    const response = await axios(config);
    const responseTime = Date.now() - startTime;
    
    // Validate response structure
    const validation = validateResponse(response.data, test.expectedFields);
    
    return {
      name: test.name,
      endpoint: test.endpoint,
      method: test.method,
      status: 'success',
      statusCode: response.status,
      responseTime: `${responseTime}ms`,
      dataSize: JSON.stringify(response.data).length,
      validation: validation,
      sampleData: getSampleData(response.data)
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      name: test.name,
      endpoint: test.endpoint,
      method: test.method,
      status: 'error',
      statusCode: error.response?.status || 'Network Error',
      responseTime: `${responseTime}ms`,
      error: error.message,
      details: error.response?.data || 'No response data'
    };
  }
};

/**
 * Validate response structure
 * @param {Object} data - Response data
 * @param {Array} expectedFields - Expected fields in response
 * @returns {Object} Validation result
 */
const validateResponse = (data, expectedFields) => {
  if (!expectedFields || expectedFields.length === 0) {
    return { valid: true, message: 'No validation required' };
  }
  
  const missingFields = expectedFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing fields: ${missingFields.join(', ')}`,
      availableFields: Object.keys(data)
    };
  }
  
  return { valid: true, message: 'All expected fields present' };
};

/**
 * Get sample data from response
 * @param {Object} data - Response data
 * @returns {Object} Sample data
 */
const getSampleData = (data) => {
  if (Array.isArray(data)) {
    return {
      type: 'array',
      length: data.length,
      sample: data.slice(0, 2)
    };
  }
  
  if (data && typeof data === 'object') {
    return {
      type: 'object',
      keys: Object.keys(data),
      sample: Object.keys(data).slice(0, 5).reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {})
    };
  }
  
  return {
    type: typeof data,
    value: data
  };
};

/**
 * Test all endpoints in a category
 * @param {string} category - Category name (mdm, magento, dashboard, health)
 * @returns {Promise<Array>} Test results
 */
export const testEndpointCategory = async (category) => {
  const tests = ENDPOINT_TESTS[category];
  if (!tests) {
    throw new Error(`Unknown endpoint category: ${category}`);
  }
  
  console.log(`🧪 Testing ${category.toUpperCase()} endpoints...`);
  
  const results = [];
  for (const test of tests) {
    if (test.skipInBatch) {
      results.push({
        name: test.name,
        endpoint: test.endpoint,
        status: 'skipped',
        message: 'Skipped in batch testing'
      });
      continue;
    }
    
    const result = await testEndpoint(test);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
};

/**
 * Test all endpoints
 * @returns {Promise<Object>} Complete test results
 */
export const testAllEndpoints = async () => {
  console.log('🧪 Starting comprehensive endpoint testing...');
  
  const results = {};
  const categories = Object.keys(ENDPOINT_TESTS);
  
  for (const category of categories) {
    try {
      results[category] = await testEndpointCategory(category);
    } catch (error) {
      results[category] = [{
        name: `${category} category`,
        status: 'error',
        error: error.message
      }];
    }
  }
  
  // Generate summary
  const summary = generateTestSummary(results);
  
  return {
    timestamp: new Date().toISOString(),
    summary: summary,
    results: results
  };
};

/**
 * Generate test summary
 * @param {Object} results - Test results
 * @returns {Object} Summary statistics
 */
const generateTestSummary = (results) => {
  let totalTests = 0;
  let successfulTests = 0;
  let failedTests = 0;
  let skippedTests = 0;
  
  Object.values(results).forEach(categoryResults => {
    categoryResults.forEach(result => {
      totalTests++;
      if (result.status === 'success') successfulTests++;
      else if (result.status === 'error') failedTests++;
      else if (result.status === 'skipped') skippedTests++;
    });
  });
  
  return {
    totalTests,
    successfulTests,
    failedTests,
    skippedTests,
    successRate: totalTests > 0 ? ((successfulTests / totalTests) * 100).toFixed(1) + '%' : '0%'
  };
};

/**
 * Format test results for console output
 * @param {Object} testResults - Test results from testAllEndpoints
 */
export const logTestResults = (testResults) => {
  console.log('\n📊 ENDPOINT TEST RESULTS');
  console.log('========================');
  console.log(`Timestamp: ${testResults.timestamp}`);
  console.log(`Total Tests: ${testResults.summary.totalTests}`);
  console.log(`✅ Successful: ${testResults.summary.successfulTests}`);
  console.log(`❌ Failed: ${testResults.summary.failedTests}`);
  console.log(`⏭️ Skipped: ${testResults.summary.skippedTests}`);
  console.log(`📈 Success Rate: ${testResults.summary.successRate}`);
  
  Object.entries(testResults.results).forEach(([category, results]) => {
    console.log(`\n📂 ${category.toUpperCase()} ENDPOINTS:`);
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'error' ? '❌' : '⏭️';
      console.log(`  ${status} ${result.name} (${result.endpoint})`);
      if (result.responseTime) console.log(`     Response Time: ${result.responseTime}`);
      if (result.error) console.log(`     Error: ${result.error}`);
    });
  });
};

export default {
  testEndpoint,
  testEndpointCategory,
  testAllEndpoints,
  logTestResults,
  ENDPOINT_TESTS
};
