import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import timeout from 'connect-timeout';
import rateLimit from 'express-rate-limit';
import { logger } from './src/utils/logger.js';
// import { SQL_QUERIES } from './src/constants/sqlQueries.js';
// import { connectToDatabases } from './src/utils/database-setup.js';
// import { quitRedisClient } from './src/utils/redisClient.js';
import { productionConfig } from './production.config.js';
// Import and use the main router (temporarily disabled for debugging)
// import syncRoutes from './src/routes/syncRoutes.js';
// import mdmRoutes from './src/mdm/routes.js';
import healthRoutes from './src/routes/healthRoutes.js';
import metricsRoutes from './src/routes/metricsRoutes.js';
import votingRoutes from './src/routes/votingRoutes.js';
// import dashboardRoutes from './src/routes/dashboardRoutes.js';
// import monitoringRoutes from './src/routes/monitoringRoutes.js';

// Import logging and monitoring middleware (temporarily disabled)
// import productionLogger from './src/services/productionLogger.js';
// import { requestResponseMiddleware } from './src/middleware/requestResponseLogger.js';
// import { userActivityMiddleware } from './src/middleware/userActivityLogger.js';
// import { errorHandlingMiddleware, warningMiddleware, performanceMiddleware } from './src/middleware/errorCollector.js';
// import usageAnalytics from './src/services/usageAnalytics.js';
// import { proxyMagentoRequest } from './src/controllers/apiController.js';
import {
  requestTimingMiddleware,
  memoryMonitoringMiddleware,
  rateLimitMonitoringMiddleware,
  errorTrackingMiddleware
} from './src/middleware/performanceMiddleware.js';

// Use production config for port and host (moved up before usage)
const PORT = productionConfig.server.port;
const HOST = productionConfig.server.host;

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: `../${envFile}` });
const app = express();

// Global server variable for shutdown handlers
let server;

// Set a global request timeout to prevent requests from hanging
app.use(timeout('30s'));

// Rate limiting to protect against brute-force attacks and API abuse
const apiLimiter = rateLimit({
    ...productionConfig.rateLimit,
    message: { error: productionConfig.rateLimit.message }
});
app.use('/api/', apiLimiter);

// Use production CORS configuration
app.use(cors(productionConfig.cors));

// Add security headers
app.use(helmet(productionConfig.security.helmet));

// Add performance monitoring middleware
app.use(requestTimingMiddleware);
app.use(memoryMonitoringMiddleware);
app.use(rateLimitMonitoringMiddleware);

// Apply production logging and monitoring middleware (temporarily disabled)
// app.use(requestResponseMiddleware);
// app.use(userActivityMiddleware);
// app.use(warningMiddleware);
// app.use(performanceMiddleware);

// Log server startup
console.log('TECHNO-ETL Backend Server starting', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    pid: process.pid
});

// Add compression with threshold
app.use(compression({
    threshold: 1024, // Only compress responses larger than 1KB
    level: 9, // Maximum compression level
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Increase payload limits and optimize parsing
app.use(express.json({
    limit: '15mb',
    verify: (req, res, buf, encoding) => {
        if (buf.length > 15 * 1024 * 1024) {
            throw new Error('Payload too large');
        }
    }
}));

app.use(express.urlencoded({
    extended: true,
    limit: '15mb',
    parameterLimit: 10000
}));

// Add user-agent middleware for Magento compatibility
app.use((req, res, next) => {
    // Set a proper user-agent for Techno ETL system
    req.headers['user-agent'] = req.headers['user-agent'] || productionConfig.magento.userAgent;

    // Add additional headers for Magento API compatibility
    if (req.path.includes('/api/magento')) {
        Object.assign(req.headers, productionConfig.magento.headers);
    }

    // Add CORS headers for all requests
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', productionConfig.cors.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', 'true');

    next();
});

// =========================
// 1. Helper Functions
// =========================

/**
 * Gets a SQL query by key.
 * @param {string} queryKey - The key of the SQL query to retrieve.
 * @returns {string} The SQL query as a string.
 */
// const getSQLQuery = (queryKey) => {
//     const query = SQL_QUERIES[queryKey];
//     if (!query) {
//         throw new Error(`SQL query not found for key: ${queryKey}`);
//     }
//     return query;
// };

 

// Health check endpoint
app.get('/api/health', (req, res) => {
    try {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
               environment: process.env.NODE_ENV || 'development',
        port: productionConfig.server.port,
        version: '1.0.0'
        });
    } catch (error) {
        console.error('Error during health check:', error);
        res.status(500).json({ error: 'Health check failed' });
    }
});



// app.use('/api/mdm', mdmRoutes);
// app.use('/api/mdm', syncRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/monitoring', monitoringRoutes);
// app.all('/api/magento/*', proxyMagentoRequest);
app.use('/api', healthRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/voting', votingRoutes);

// =========================
// 4. Error Handling
// =========================

// 404 handler
app.use((req, res, next) => {
    console.log('404 Not Found:', req.method, req.originalUrl);

    res.status(404).json({
        error: 'Not Found',
        timestamp: new Date().toISOString()
    });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    // Handle timeout errors specifically
    if (req.timedout) {
        console.error('Request Timeout:', req.originalUrl, req.method);
        return res.status(503).json({
            error: 'Service Unavailable: Request Timed Out',
            timestamp: new Date().toISOString()
        });
    }

    // Basic error handling
    console.error('Server Error:', err.message);
    res.status(500).json({
        error: 'Internal Server Error',
        timestamp: new Date().toISOString()
    });
});

// Main function to run the operations
async function main() {
    try {
        // Skip database connections for now - focus on API endpoints
        console.log('⚠️ Skipping database connections - running in API-only mode');
        logger.info('✅ Server initialized in API-only mode');

        // Start the server
        startServer();
    } catch (err) {
        logger.error('Failed to initialize server', { error: err.message });
        console.error('Failed to initialize server:', err.message);
    }
}

// Function to start the server
function startServer() {
    server = app.listen(PORT, HOST, () => {
        console.log(`🚀 TECHNO-ETL Backend Server running on ${HOST}:${PORT}`);
        console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
        console.log(`🔄 Price sync: POST http://${HOST}:${PORT}/api/mdm/sync/prices`);
        console.log(`📦 Inventory sync: POST http://${HOST}:${PORT}/api/mdm/sync/inventory`);
        console.log(`📈 Dashboard stats: http://${HOST}:${PORT}/api/dashboard/stats`);
        logger.info('✅ Server started successfully', { port: PORT, host: HOST });
    });
}

// Start the process
main().catch((err) => {
    logger.error('Failed to initialize server', { error: err.message });
    console.error('Failed to initialize server:', err.message);
    process.exit(1);
});



// Graceful shutdown and error handling
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
    // Consider a more robust logging and alerting mechanism here
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
});

const shutdown = (signal) => {
    console.log(`🔄 ${signal} received, shutting down gracefully...`);
    if (server) {
        server.close(() => {
            logger.info(`Worker ${process.pid} closed`);
            // Close database connections, etc.
            // quitRedisClient();
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// No ESM export, use CommonJS if needed

