/**
 * Base API Service Class
 * Provides common functionality for all API services
 */
class BaseAPIService {
    constructor(config = {}) {
        this.config = {
            timeout: 30000,
            retryAttempts: 3,
            enableLogging: true,
            enableCaching: false,
            cacheTimeout: 300000, // 5 minutes
            ...config
        };
        
        this.cache = new Map();
        this.requestQueue = [];
        this.activeRequests = 0;
        this.maxConcurrentRequests = config.maxConcurrentRequests || 10;
    }

    /**
     * Make HTTP request with retry logic and caching
     */
    async makeRequest(url, options = {}) {
        const requestConfig = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.config.timeout,
            ...options
        };

        // Check cache first
        if (this.config.enableCaching && requestConfig.method === 'GET') {
            const cached = this.getFromCache(url);
            if (cached) {
                this.log('Cache hit', { url });
                return cached;
            }
        }

        // Queue request if too many concurrent requests
        if (this.activeRequests >= this.maxConcurrentRequests) {
            await this.queueRequest();
        }

        this.activeRequests++;
        
        try {
            const response = await this.executeRequest(url, requestConfig);
            
            // Cache successful GET requests
            if (this.config.enableCaching && requestConfig.method === 'GET' && response.ok) {
                this.setCache(url, response.data);
            }
            
            return response;
        } catch (error) {
            if (this.config.retryAttempts > 0) {
                return this.retryRequest(url, requestConfig, error);
            }
            throw error;
        } finally {
            this.activeRequests--;
            this.processQueue();
        }
    }

    /**
     * Execute the actual HTTP request
     */
    async executeRequest(url, config) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        try {
            this.log('Making request', { url, method: config.method });
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            this.log('Request successful', { url, status: response.status });
            
            return {
                ok: true,
                status: response.status,
                data,
                headers: response.headers
            };
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            this.log('Request failed', { url, error: error.message });
            throw error;
        }
    }

    /**
     * Retry failed requests with exponential backoff
     */
    async retryRequest(url, config, originalError, attempt = 1) {
        if (attempt > this.config.retryAttempts) {
            throw originalError;
        }

        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
        this.log('Retrying request', { url, attempt, delay });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
            return await this.executeRequest(url, config);
        } catch (error) {
            return this.retryRequest(url, config, originalError, attempt + 1);
        }
    }

    /**
     * Queue management for concurrent requests
     */
    async queueRequest() {
        return new Promise(resolve => {
            this.requestQueue.push(resolve);
        });
    }

    processQueue() {
        if (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
            const resolve = this.requestQueue.shift();
            resolve();
        }
    }

    /**
     * Cache management
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
            return cached.data;
        }
        
        if (cached) {
            this.cache.delete(key); // Remove expired cache
        }
        
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    clearCache() {
        this.cache.clear();
        this.log('Cache cleared');
    }

    /**
     * Authentication helpers
     */
    getAuthHeaders(authConfig) {
        switch (authConfig.type) {
            case 'basic':
                const credentials = btoa(`${authConfig.username}:${authConfig.password}`);
                return { 'Authorization': `Basic ${credentials}` };
                
            case 'bearer':
                return { 'Authorization': `Bearer ${authConfig.token}` };
                
            case 'apikey':
                return { 
                    'X-API-Key': authConfig.apiKey,
                    'Authorization': `ApiKey ${authConfig.apiKey}`
                };
                
            default:
                return {};
        }
    }

    /**
     * URL building helpers
     */
    buildUrl(baseUrl, endpoint, params = {}) {
        const url = new URL(endpoint, baseUrl);
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        return url.toString();
    }

    /**
     * Logging utility
     */
    log(message, data = {}) {
        if (this.config.enableLogging) {
            console.log(`[${this.constructor.name}] ${message}`, data);
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.makeRequest(this.getHealthCheckUrl(), {
                method: 'GET',
                timeout: 5000
            });
            
            return {
                status: 'healthy',
                responseTime: Date.now(),
                details: response.data
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                responseTime: Date.now()
            };
        }
    }

    /**
     * Abstract methods to be implemented by subclasses
     */
    getHealthCheckUrl() {
        throw new Error('getHealthCheckUrl must be implemented by subclass');
    }

    /**
     * Cleanup resources
     */
    destroy() {
        this.clearCache();
        this.requestQueue = [];
        this.activeRequests = 0;
    }
}

export default BaseAPIService;