
// Unified MagentoService using shared node-cache from config/magento.js

const { getMagentoToken } = require('../config/magento');
let gotPromise = null;

// Helper to dynamically import got (ESM in CommonJS)
async function getGot() {
    if (!gotPromise) {
        gotPromise = import('got').then(mod => mod.default);
    }
    return gotPromise;
}

/**
 * MagentoService using got for robust, high-performance HTTP requests.
 * - Native retry, timeout, and hook support
 * - Handles token-based Magento auth (admin/user tokens)
 * - Works with REST and GraphQL endpoints
 * - Supports streams and form data
 */
class MagentoService {
    constructor(config) {
        this.config = config;
        this.url = config.url;
    }

    // Always use the shared node-cache for Magento token

    async getToken(forceRefresh = false) {
        // Always use the shared node-cache for Magento token
        return getMagentoToken(this.config);
    }

    /**
     * Generic request method using got
     * @param {string} method - HTTP method (get, post, put, delete)
     * @param {string} endpoint - Magento REST/GraphQL endpoint (with query string if needed)
     * @param {object} [data] - Body data for POST/PUT
     * @param {object} [customHeaders] - Additional headers
     * @param {object} [options] - Additional got options (timeout, retry, hooks, etc)
     */
    async request(method, endpoint, data = null, customHeaders = {}, options = {}) {
        const token = await this.getToken();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Techno',
            ...customHeaders
        };
        const got = await getGot();
        // Remove all hooks and retry logic, keep it simple
        let baseUrl = this.url;
        let path = endpoint;
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        if (path.startsWith('/')) path = path.slice(1);
        if (!/^V1\b|^rest\/V1\b|^async\//.test(path)) {
            path = 'V1/' + path;
        }
        const url = `${baseUrl}/${path}`;
        const gotOptions = {
            method,
            headers,
            throwHttpErrors: false,
            ...options
        };
        if (data) {
            gotOptions.json = data;
        }
        let response;
        try {
            response = await got(url, gotOptions);
        } catch (error) {
            // Network or got error
            throw error;
        }
        // If Magento returns an error status, throw with message
        if (response.statusCode >= 400) {
            let magentoError;
            try {
                magentoError = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
            } catch (e) {
                magentoError = response.body;
            }
            throw new Error((magentoError && magentoError.message) || `Magento API Error: ${response.statusCode}`);
        }
        try {
            return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
        } catch (e) {
            return response.body;
        }
    }

    // Logging hooks (can be extended or replaced)
    logRequest(options) {
        if (!options) return options;
        const { method, url, headers } = options;
        console.log(`[MagentoService] ${method} ${url} - Request`, headers);
        return options;
    }
    logResponse(response) {
        if (!response) return response;
        const { statusCode, url } = response;
        console.log(`[MagentoService] ${statusCode} ${url} - Response`);
        return response;
    }
    logError(error, method, endpoint, statusCode) {
        if (!error) return;
        // Log full error object for debugging
        console.error(`[MagentoService][LOG_ERROR]`, {
            method,
            endpoint,
            statusCode,
            errorMessage: error.message || error,
            errorObject: error,
            stack: error.stack
        });
    }
    logSuccess(method, endpoint, ms, statusCode) {
        console.log(`[MagentoService] SUCCESS ${method} ${endpoint} (${statusCode}) - ${ms}ms`);
    }

    /**
     * GET request (endpoint should include query string if needed)
     * @param {string} endpointWithQuery
     * @param {object} [options] - got options
     */
    async get(endpointWithQuery, options = {}) {
        return this.request('GET', endpointWithQuery, null, {}, options);
    }

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, {}, options);
    }

    /**
     * PUT request
     */
    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, {}, options);
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, {}, options);
    }
}

// Export the unified service
module.exports = MagentoService;

