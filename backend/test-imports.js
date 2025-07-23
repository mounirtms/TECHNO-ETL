// Test imports one by one to identify the problematic one
import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Testing imports one by one...');

try {
    console.log('1. Testing basic imports...');
    const express = await import('express');
    console.log('✅ Express imported');
    
    console.log('2. Testing logger...');
    const { logger } = await import('./src/utils/logger.js');
    console.log('✅ Logger imported');
    
    console.log('3. Testing production config...');
    const { productionConfig } = await import('./production.config.js');
    console.log('✅ Production config imported');
    
    console.log('4. Testing SQL queries...');
    const { SQL_QUERIES } = await import('./src/constants/sqlQueries.js');
    console.log('✅ SQL queries imported');
    
    console.log('5. Testing database setup...');
    const { connectToDatabases } = await import('./src/utils/database-setup.js');
    console.log('✅ Database setup imported');
    
    console.log('6. Testing redis client...');
    const { quitRedisClient } = await import('./src/utils/redisClient.js');
    console.log('✅ Redis client imported');
    
    console.log('7. Testing sync routes...');
    const syncRoutes = await import('./src/routes/syncRoutes.js');
    console.log('✅ Sync routes imported');
    
    console.log('8. Testing MDM routes...');
    const mdmRoutes = await import('./src/mdm/routes.js');
    console.log('✅ MDM routes imported');
    
    console.log('9. Testing health routes...');
    const healthRoutes = await import('./src/routes/healthRoutes.js');
    console.log('✅ Health routes imported');
    
    console.log('10. Testing metrics routes...');
    const metricsRoutes = await import('./src/routes/metricsRoutes.js');
    console.log('✅ Metrics routes imported');
    
    console.log('11. Testing dashboard routes...');
    const dashboardRoutes = await import('./src/routes/dashboardRoutes.js');
    console.log('✅ Dashboard routes imported');
    
    console.log('12. Testing API controller...');
    const { proxyMagentoRequest } = await import('./src/controllers/apiController.js');
    console.log('✅ API controller imported');
    
    console.log('13. Testing performance middleware...');
    const performanceMiddleware = await import('./src/middleware/performanceMiddleware.js');
    console.log('✅ Performance middleware imported');
    
    console.log('🎉 All imports successful!');
    
} catch (error) {
    console.error('❌ Import failed:', error.message);
    console.error('Stack:', error.stack);
}
