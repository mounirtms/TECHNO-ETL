// Simple API test script
const axios = require('axios');

const testAPI = async () => {
  console.log('Testing API endpoints...');
  
  try {
    // Test direct backend
    console.log('1. Testing direct backend connection...');
    const backendResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend health:', backendResponse.data);
    
    // Test backend MDM endpoints
    console.log('2. Testing MDM endpoints...');
    const mdmResponse = await axios.get('http://localhost:5000/api/mdm/sync-prices');
    console.log('✅ MDM sync-prices:', mdmResponse.data);
    
    const taskResponse = await axios.get('http://localhost:5000/api/task/stats');
    console.log('✅ Task stats:', taskResponse.data);
    
    console.log('🎉 All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

testAPI();