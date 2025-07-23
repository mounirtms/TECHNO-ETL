import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import timeout from 'connect-timeout';
import rateLimit from 'express-rate-limit';
import { logger } from './src/utils/logger.js';
import { SQL_QUERIES } from './src/constants/sqlQueries.js';
import { connectToDatabases } from './src/utils/database-setup.js';
import { quitRedisClient } from './src/utils/redisClient.js';
import { productionConfig } from './production.config.js';
// No ESM export, use CommonJS if needed
import router from './utils/routes.js';
app.use('/api', router);
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: `../${envFile}` });
const app = express();

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
const getSQLQuery = (queryKey) => {
    const query = SQL_QUERIES[queryKey];
    if (!query) {
        throw new Error(`SQL query not found for key: ${queryKey}`);
    }
    return query;
};

 

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

// Import and use the main router
import router from './src/routes/index.js';
app.use('/api', router);

// =========================
// 4. Error Handling
// =========================
app.use((err, req, res, next) => {
    // Handle timeout errors specifically
    if (req.timedout) {
        logger.error('Request Timeout', { path: req.originalUrl, method: req.method });
        return res.status(503).json({ error: 'Service Unavailable: Request Timed Out' });
    }

    logger.error('An unhandled error occurred', { 
        error: err.message, 
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    res.status(500).json({ error: 'An internal server error occurred.' });
});

// Main function to run the operations
async function main() {
    await connectToDatabases();
}

// Start the process
main();

// Use production config for port and host
const PORT = productionConfig.server.port;
const HOST = productionConfig.server.host;

const server = app.listen(PORT, HOST, () => {
    // In a clustered environment (like with PM2), this will run for each worker.
    // The `process.pid` helps identify which worker is logging.
    logger.startup(`Worker ${process.pid} started. Server running on ${HOST}:${PORT}`, {
        environment: productionConfig.server.environment,
        port: PORT,
        host: HOST
    });
});

// Graceful shutdown and error handling
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
    // Consider a more robust logging and alerting mechanism here
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // It's often recommended to gracefully shut down the process on an uncaught exception
    server.close(() => process.exit(1));
});

const shutdown = (signal) => {
    console.log(`🔄 ${signal} received, shutting down gracefully...`);
    server.close(() => {
        logger.info(`Worker ${process.pid} closed`);
        // Close database connections, etc.
        quitRedisClient();
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// No ESM export, use CommonJS if needed

