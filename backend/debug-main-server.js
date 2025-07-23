// Debug version of main server to identify blocking issues
import dotenv from 'dotenv';

console.log('🔍 Step 1: Starting server debug...');

// Load environment variables
dotenv.config();

console.log('🔍 Step 2: Environment loaded');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import timeout from 'connect-timeout';
import rateLimit from 'express-rate-limit';

console.log('🔍 Step 3: Basic imports loaded');

try {
    const { logger } = await import('./src/utils/logger.js');
    console.log('🔍 Step 4: Logger imported');
    
    const { productionConfig } = await import('./production.config.js');
    console.log('🔍 Step 5: Production config imported');
    
    // Use production config for port and host
    const PORT = productionConfig.server.port;
    const HOST = productionConfig.server.host;
    
    console.log(`🔍 Step 6: Configuration - ${HOST}:${PORT}`);
    
    const app = express();
    
    console.log('🔍 Step 7: Express app created');
    
    // Basic middleware
    app.use(timeout('30s'));
    app.use(cors(productionConfig.cors));
    app.use(helmet(productionConfig.security.helmet));
    app.use(compression());
    app.use(express.json({ limit: '15mb' }));
    app.use(express.urlencoded({ extended: true, limit: '15mb' }));
    
    console.log('🔍 Step 8: Basic middleware configured');
    
    // Simple health check
    app.get('/api/health', (req, res) => {
        console.log('🏥 Health check requested');
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            port: PORT,
            version: '1.0.0'
        });
    });
    
    console.log('🔍 Step 9: Health route configured');
    
    // Start server
    const server = app.listen(PORT, HOST, () => {
        console.log(`🚀 Debug main server running on ${HOST}:${PORT}`);
        console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
        logger.info('✅ Server started successfully', { port: PORT, host: HOST });
    });
    
    server.on('error', (err) => {
        console.error('❌ Server error:', err);
    });
    
    console.log('🔍 Step 10: Server startup initiated');
    
} catch (error) {
    console.error('❌ Error during server setup:', error.message);
    console.error('Stack:', error.stack);
}
