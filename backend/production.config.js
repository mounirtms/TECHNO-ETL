/**
 * Production Configuration for Techno ETL Backend
 * Optimized for production deployment with proper CORS, security, and performance settings
 */

export const productionConfig = {
    // Server Configuration
    server: {
        port: process.env.PORT || 5000,
        host: process.env.HOST || '0.0.0.0',
        environment: 'production'
    },

    // CORS Configuration for Production
    cors: {
        origin: [
            'http://etl.techno-dz.com',
            'http://techno-webapp.web.app',
            'http://dashboard.technostationery.com',
            // Add development origins for testing
            'http://localhost:80',
            'http://localhost:4173'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type', 
            'Authorization', 
            'User-Agent', 
            'X-Requested-With',
            'X-App-Domain',
            'Origin',
            'Accept'
        ],
        credentials: true,
        optionsSuccessStatus: 200,
        preflightContinue: false
    },

    // Security Headers
    security: {
        helmet: {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    imgSrc: ["'self'", "data:", "https:"],
                    scriptSrc: ["'self'"],
                    connectSrc: ["'self'", "http://etl.techno-dz.com", "https://technostationery.com"]
                }
            },
            crossOriginEmbedderPolicy: false
        }
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // Limit each IP to 1000 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false
    },

    // Compression
    compression: {
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return true;
        }
    },

    // Logging
    logging: {
        level: 'info',
        format: 'combined',
        filename: 'logs/production.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        colorize: false,
        timestamp: true
    },

    // Database Configuration
    database: {
        connectionTimeout: 30000,
        requestTimeout: 30000,
        pool: {
            max: 20,
            min: 5,
            idleTimeoutMillis: 30000
        },
        options: {
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        }
    },

    // Magento API Configuration
    magento: {
        timeout: 30000,
        retries: 3,
        retryDelay: 1000,
        userAgent: 'Techno-ETL/1.0.0 (etl.techno-dz.com)',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Techno-ETL/1.0.0 (etl.techno-dz.com)'
        }
    },

    // Cache Configuration
    cache: {
        ttl: 300, // 5 minutes
        checkperiod: 600, // 10 minutes
        maxKeys: 1000,
        useClones: false
    },

    // Performance Monitoring
    monitoring: {
        enabled: true,
        endpoint: '/health',
        timeout: 5000
    }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
    productionConfig.cors.origin.push('http://localhost:3000');
    productionConfig.logging.level = 'debug';
    productionConfig.security.helmet.contentSecurityPolicy = false;
}

export default productionConfig;
