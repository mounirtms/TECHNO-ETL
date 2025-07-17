// Unified MagentoService using shared node-cache from config/magento.js

import { getMagentoToken } from '../config/magento.js';
import CacheClient from './CacheClient.js'; // Assuming this is your cache wrapper

let gotPromise = null;

async function getGot() {
    if (!gotPromise) {
        gotPromise = import('got').then(mod => mod.default);
    }
    return gotPromise;
}

class MagentoService {
    constructor(config, cache = new CacheClient()) {
        this.config = config;
        this.url = config.url.replace(/\/$/, ''); // ensure no trailing slash
        this.cache = cache;
        this.defaultCacheTTL = config.cacheTTL || 3600*5; // seconds
    }

    async getToken(forceRefresh = false) {
        return getMagentoToken(this.config, forceRefresh);
    }

    buildUrl(endpoint) {
        let path = endpoint.replace(/^\/+/, '');
        if (!/^V1\b|^rest\/V1\b|^async\//.test(path)) {
            path = `V1/${path}`;
        }
        return `${this.url}/${path}`;
    }

    async request(method, endpoint, data = null, customHeaders = {}, options = {}) {
        const token = await this.getToken();
        const got = await getGot();
        const url = this.buildUrl(endpoint);
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'Techno',
            ...customHeaders
        };

        const gotOptions = {
            method,
            headers,
            throwHttpErrors: false,
            ...options
        };
        if (data) {
            gotOptions.json = data;
        }

        const startTime = Date.now();

        try {
            const response = await got(url, gotOptions);
            const elapsed = Date.now() - startTime;

            this.logSuccess(method, endpoint, elapsed, response.statusCode);
            this.logResponse(response);

            if (response.statusCode >= 400) {
                const body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
                throw new Error((body && body.message) || `Magento API Error: ${response.statusCode}`);
            }

            return typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
        } catch (error) {
            this.logError(error, method, endpoint);
            throw error;
        }
    }

    /**
     * GET request with caching.
     * @param {string} endpointWithQuery
     * @param {object} options - got options + { cache: { ttl, forceRefresh } }
     */
    async get(endpointWithQuery, options = {}) {
        const { cache = {} } = options;
        const cacheKey = `magento:get:${endpointWithQuery}`;
        const ttl = cache.ttl ?? this.defaultCacheTTL;

        if (!cache.forceRefresh) {
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                console.log(`🎯 [MagentoService] Cache HIT: ${cacheKey}`, {
                    dataType: typeof cached,
                    hasItems: cached && 'items' in cached,
                    itemsCount: cached?.items?.length || 0,
                    totalCount: cached?.total_count || 0
                });
                return cached;
            } else {
                console.log(`❌ [MagentoService] Cache MISS: ${cacheKey}`);
            }
        } else {
            console.log(`🔄 [MagentoService] Cache FORCE REFRESH: ${cacheKey}`);
        }

        const response = await this.request('GET', endpointWithQuery, null, {}, options);

        console.log(`📦 [MagentoService] API Response received:`, {
            endpoint: endpointWithQuery,
            responseType: typeof response,
            hasItems: response && 'items' in response,
            itemsCount: response?.items?.length || 0,
            totalCount: response?.total_count || 0,
            responseKeys: response ? Object.keys(response) : []
        });

        await this.cache.set(cacheKey, response, ttl);
        console.log(`💾 [MagentoService] Cache SET: ${cacheKey} (TTL: ${ttl}s)`);
        return response;
    }

    async post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, {}, options);
    }

    async put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, {}, options);
    }

    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, {}, options);
    }

    logRequest(options) {
        if (!options) return;
        const { method, url, headers } = options;
        console.log(`[MagentoService] ${method} ${url} - Request`, headers);
    }

    logResponse(response) {
        const { statusCode, url } = response;
        console.log(`[MagentoService] ${statusCode} ${url} - Response`);
    }

    logError(error, method, endpoint) {
        console.error(`[MagentoService][ERROR]`, {
            method,
            endpoint,
            message: error.message,
            stack: error.stack
        });
    }

    logSuccess(method, endpoint, ms, statusCode) {
        console.log(`[MagentoService] SUCCESS ${method} ${endpoint} (${statusCode}) - ${ms}ms`);
    }
}

export default MagentoService;