// Simple test to check if server can start
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing server startup...');

try {
    // Test imports
    console.log('1. Testing imports...');
    
    const { logger } = await import('./src/utils/logger.js');
    console.log('✅ Logger imported successfully');
    
    const { productionConfig } = await import('./production.config.js');
    console.log('✅ Production config imported successfully');
    
    const performanceMiddleware = await import('./src/middleware/performanceMiddleware.js');
    console.log('✅ Performance middleware imported successfully');
    
    const metricsService = await import('./src/services/metricsService.js');
    console.log('✅ Metrics service imported successfully');
    
    const cacheService = await import('./src/services/cacheService.js');
    console.log('✅ Cache service imported successfully');
    
    console.log('✅ All imports successful!');
    console.log('Server should be able to start without import errors.');
    
} catch (error) {
    console.error('❌ Import error:', error.message);
    console.error('Stack:', error.stack);
}
