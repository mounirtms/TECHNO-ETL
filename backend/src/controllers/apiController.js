// src/controllers/apiController.js
import { cloudConfig, betaConfig } from '../config/magento.js';
import MagentoService from '../services/magentoService.js';
import usageAnalytics from '../services/usageAnalytics.js';
import errorCollector, { ERROR_CATEGORIES } from '../middleware/errorCollector.js';
import crypto from 'crypto';

// Simple console logger for clean development
const logger = {
    info: (message, meta = {}) => console.log(`[INFO] ${message}`, meta),
    warn: (message, meta = {}) => console.warn(`[WARN] ${message}`, meta),
    error: (message, meta = {}) => console.error(`[ERROR] ${message}`, meta),
    debug: (message, meta = {}) => console.log(`[DEBUG] ${message}`, meta)
};

// Helper: Recursively flatten params for Magento (searchCriteria, arrays, objects)
function flattenMagentoParams(obj, urlParams, prefix = '') {
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const value = obj[key];
        const paramKey = prefix ? `${prefix}[${key}]` : key;
        if (value === undefined || value === null || value === '') continue;
        if (typeof value === 'object' && !Array.isArray(value)) {
            flattenMagentoParams(value, urlParams, paramKey);
        } else if (Array.isArray(value)) {
            value.forEach((item, idx) => {
                if (typeof item === 'object') {
                    flattenMagentoParams(item, urlParams, `${paramKey}[${idx}]`);
                } else {
                    urlParams.append(`${paramKey}[${idx}]`, item);
                }
            });
        } else {
            urlParams.append(paramKey, value);
        }
    }
}

function buildMagentoQueryString(query = {}) {
    if (typeof query === 'string') return query;
    const params = new URLSearchParams();
    flattenMagentoParams(query, params);
    return params.toString();
}

let magentoService = null;

export async function getMdmData(req, res) {
    const startTime = Date.now();

    try {
        // Log API usage
        usageAnalytics.trackApiUsage(req, res, 0);

        // Track feature usage
        if (req.user?.id) {
            usageAnalytics.trackFeatureUsage('mdm_data_access', req.user.id, {
                endpoint: 'getMdmData',
                correlationId: req.correlationId
            });
        }

        logger.info('MDM data request initiated', {
            category: 'api_request',
            endpoint: 'getMdmData',
            userId: req.user?.id,
            correlationId: req.correlationId,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Simulate data retrieval (replace with actual MDM logic)
        const responseTime = Date.now() - startTime;
        const response = {
            message: 'getMdmData handler stub',
            timestamp: new Date().toISOString(),
            correlationId: req.correlationId
        };

        // Log successful response
        logger.info('MDM data request completed', {
            category: 'api_response',
            endpoint: 'getMdmData',
            responseTime,
            statusCode: 200,
            correlationId: req.correlationId
        });

        // Track usage analytics
        usageAnalytics.trackApiUsage(req, res, responseTime);

        res.json(response);
    } catch (error) {
        const responseTime = Date.now() - startTime;

        // Collect error with context
        errorCollector.collectError(error, req, {
            endpoint: 'getMdmData',
            isExternalService: false,
            responseTime
        });

        logger.error('MDM data request failed', {
            category: 'api_error',
            endpoint: 'getMdmData',
            error: error.message,
            stack: error.stack,
            responseTime,
            correlationId: req.correlationId
        });

        res.status(500).json({
            error: 'Internal server error',
            correlationId: req.correlationId,
            timestamp: new Date().toISOString()
        });
    }
}

export async function getCegiData(req, res) {
    const startTime = Date.now();

    try {
        // Track feature usage
        if (req.user?.id) {
            usageAnalytics.trackFeatureUsage('cegi_data_access', req.user.id, {
                endpoint: 'getCegiData',
                correlationId: req.correlationId
            });
        }

        logger.info('CEGI data request initiated', {
            category: 'api_request',
            endpoint: 'getCegiData',
            userId: req.user?.id,
            correlationId: req.correlationId,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Simulate data retrieval (replace with actual CEGI logic)
        const responseTime = Date.now() - startTime;
        const response = {
            message: 'getCegiData handler stub',
            timestamp: new Date().toISOString(),
            correlationId: req.correlationId
        };

        // Log successful response
        logger.info('CEGI data request completed', {
            category: 'api_response',
            endpoint: 'getCegiData',
            responseTime,
            statusCode: 200,
            correlationId: req.correlationId
        });

        // Track usage analytics
        usageAnalytics.trackApiUsage(req, res, responseTime);

        res.json(response);
    } catch (error) {
        const responseTime = Date.now() - startTime;

        // Collect error with context
        errorCollector.collectError(error, req, {
            endpoint: 'getCegiData',
            isExternalService: false,
            responseTime
        });

        logger.error('CEGI data request failed', {
            category: 'api_error',
            endpoint: 'getCegiData',
            error: error.message,
            stack: error.stack,
            responseTime,
            correlationId: req.correlationId
        });

        res.status(500).json({
            error: 'Internal server error',
            correlationId: req.correlationId,
            timestamp: new Date().toISOString()
        });
    }
}

export async function proxyMagentoRequest(req, res) {
    const startTime = Date.now();
    const requestId = req.correlationId || 'unknown';

    try {
        const { method, query, body } = req;
        // Remove any double slashes in the endpoint path
        let endpoint = req.originalUrl.replace("/api/magento", "").replace(/\/+/g, "/");

        // Log request initiation
        logger.info('Magento proxy request initiated', {
            category: 'magento_proxy',
            action: 'request_start',
            method,
            endpoint,
            correlationId: requestId,
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            hasBody: !!body,
            queryParams: Object.keys(query).length
        });

        // Track feature usage
        if (req.user?.id) {
            usageAnalytics.trackFeatureUsage('magento_proxy', req.user.id, {
                endpoint,
                method,
                correlationId: requestId
            });
        }

        // Set CORS headers for production
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');

        // Handle preflight requests
        if (method.toLowerCase() === 'options') {
            logger.debug('Magento proxy CORS preflight', {
                category: 'magento_proxy',
                action: 'cors_preflight',
                correlationId: requestId
            });
            return res.status(200).end();
        }

        if (!magentoService) {
            magentoService = new MagentoService(cloudConfig);
            logger.info('Magento service initialized', {
                category: 'magento_proxy',
                action: 'service_init',
                correlationId: requestId
            });
        }

        let response;
        let endpointWithQuery = endpoint;
        // Only build query string if not already present in endpoint
        if (method.toLowerCase() === 'get' && Object.keys(query).length > 0 && !endpoint.includes('?')) {
            const queryString = buildMagentoQueryString(query);
            endpointWithQuery = endpoint + (queryString ? '?' + queryString : '');

            logger.debug('Query string built for Magento request', {
                category: 'magento_proxy',
                action: 'query_build',
                originalEndpoint: endpoint,
                finalEndpoint: endpointWithQuery,
                correlationId: requestId
            });
        }

        // Special case for admin token
        if (endpoint.includes('admin/token')) {
            logger.info('Magento admin token request', {
                category: 'magento_proxy',
                action: 'token_request',
                correlationId: requestId
            });

            response = await magentoService.getToken(true);
            const responseTime = Date.now() - startTime;

            logger.info('Magento admin token response', {
                category: 'magento_proxy',
                action: 'token_response',
                responseTime,
                correlationId: requestId
            });

            usageAnalytics.trackApiUsage(req, res, responseTime);
            return res.json(response);
        }

        logger.info('Magento API request executing', {
            category: 'magento_proxy',
            action: 'api_call',
            method: method.toUpperCase(),
            endpoint: endpointWithQuery,
            correlationId: requestId
        });

        switch (method.toLowerCase()) {
            case "get":
                response = await magentoService.get(endpointWithQuery);
                break;
            case "post":
                response = await magentoService.post(endpoint, body);
                break;
            case "put":
                response = await magentoService.put(endpoint, body);
                break;
            case "delete":
                response = await magentoService.delete(endpoint);
                break;
            default:
                const methodError = new Error(`Method not allowed: ${method}`);
                methodError.status = 405;

                logger.warn('Magento proxy method not allowed', {
                    category: 'magento_proxy',
                    action: 'method_not_allowed',
                    method,
                    endpoint,
                    correlationId: requestId
                });

                errorCollector.collectError(methodError, req, {
                    endpoint: 'proxyMagentoRequest',
                    isExternalService: true,
                    category: ERROR_CATEGORIES.VALIDATION
                });

                return res.status(405).json({
                    error: "Method not allowed",
                    correlationId: requestId,
                    timestamp: new Date().toISOString()
                });
        }

        const responseTime = Date.now() - startTime;

        // Log successful response
        logger.info('Magento proxy response ready', {
            category: 'magento_proxy',
            action: 'response_ready',
            responseType: typeof response,
            hasItems: response && typeof response === 'object' && response !== null && 'items' in response,
            itemsCount: response?.items?.length || 0,
            totalCount: response?.total_count || 0,
            responseKeys: response && typeof response === 'object' && response !== null ? Object.keys(response) : [],
            responseTime,
            correlationId: requestId
        });

        // Track usage analytics
        usageAnalytics.trackApiUsage(req, res, responseTime);

        // Track user behavior
        if (req.user?.id) {
            const behaviorEndpoint = req.originalUrl?.replace('/api/magento', '').replace(/\/+/g, '/') || 'unknown';
            usageAnalytics.trackUserBehavior(req.user.id, 'magento_api_call', {
                endpoint: behaviorEndpoint,
                method,
                responseTime,
                success: true,
                correlationId: requestId
            });
        }

        res.json(response);
    } catch (error) {
        const responseTime = Date.now() - startTime;

        // Categorize the error
        const errorCategory = error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT'
            ? ERROR_CATEGORIES.EXTERNAL_SERVICE
            : ERROR_CATEGORIES.SYSTEM;

        // Collect error with full context
        const errorEndpoint = req.originalUrl?.replace('/api/magento', '').replace(/\/+/g, '/') || 'unknown';
        errorCollector.collectError(error, req, {
            endpoint: 'proxyMagentoRequest',
            isExternalService: true,
            responseTime,
            magentoEndpoint: errorEndpoint,
            method: method || 'unknown'
        });

        const logEndpoint = req.originalUrl?.replace('/api/magento', '').replace(/\/+/g, '/') || 'unknown';
        logger.error('Magento proxy error', {
            category: 'magento_proxy',
            action: 'request_failed',
            error: error.message,
            stack: error.stack,
            code: error.code,
            responseTime,
            endpoint: logEndpoint,
            method,
            correlationId: requestId
        });

        // Track failed user behavior
        if (req.user?.id) {
            const behaviorEndpoint = req.originalUrl?.replace('/api/magento', '').replace(/\/+/g, '/') || 'unknown';
            usageAnalytics.trackUserBehavior(req.user.id, 'magento_api_error', {
                endpoint: behaviorEndpoint,
                method,
                error: error.message,
                responseTime,
                success: false,
                correlationId: requestId
            });
        }

        // Return appropriate error response
        const statusCode = error.status || error.statusCode || 500;
        res.status(statusCode).json({
            error: process.env.NODE_ENV === 'production' ? 'External service error' : error.message,
            correlationId: requestId,
            timestamp: new Date().toISOString()
        });
    }
}

export default {
    getMdmData,
    getCegiData,
    proxyMagentoRequest
};
