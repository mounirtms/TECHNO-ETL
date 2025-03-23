const axios = require('axios');
const NodeCache = require('node-cache');

let isRefreshingToken = false;
let requestQueue = [];
const tokenCache = new NodeCache({ stdTTL: 1440000 });

class MagentoService {
    constructor(config) {
        this.config = config;
        this.instance = axios.create({
            baseURL: this.config.url,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    async getMagentoToken(forceRefresh = false) {
        if (!forceRefresh) {
            const cachedToken = tokenCache.get(this.config.url);
            if (cachedToken) {
                console.log("✅ Using cached Magento token");
                return cachedToken;
            }
        }

        if (isRefreshingToken) {
            console.log("⏳ Waiting for token refresh...");
            return new Promise(resolve => requestQueue.push(resolve));
        }

        isRefreshingToken = true;

        const authEndpoint = `${this.config.url}V1/integration/admin/token`;
        try {
            console.log(`🔑 Requesting new Magento token from: ${authEndpoint}`);
            const response = await axios.post(authEndpoint, {
                username: this.config.username,
                password: this.config.password
            });

            console.log("✅ Magento token received:", response.data);
            tokenCache.set(this.config.url, response.data);
            isRefreshingToken = false;

            // Resolve all queued requests with the new token
            requestQueue.forEach(resolve => resolve(response.data));
            requestQueue = [];

            return response.data;
        } catch (error) {
            isRefreshingToken = false;
            console.error("❌ Magento authentication failed:", error.response?.data || error.message);
            throw new Error("Magento authentication failed");
        }
    }

    clearTokenCache() {
        tokenCache.del(this.config.url);
        console.log("🗑️ Magento token cache cleared");
    }

    async request(method, endpoint, data = {}, params = {}) {
        let token = await this.getMagentoToken(); 
        try {
            const response = await this.instance.request({
                method,
                url: this.config.url + endpoint,
                headers: {
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Accept': '*/*',
                    'User-Agent': 'Magento Techno API Client',
                    'Connection': 'keep-alive',
                    'Authorization': `Bearer ${token}`
                },
                ...(method === 'get' ? { params } : { data })
            });

    

            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                console.warn("🔄 Token expired, refreshing...");

                this.clearTokenCache();

                return new Promise(async (resolve, reject) => {
                    try {
                        const newToken = await this.getMagentoToken(true);
                        await new Promise(res => setTimeout(res, 1000));

                        let retryResponse = await this.instance.request({
                            method,
                            url: this.config.url + endpoint,
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'User-Agent': 'Magento API Client',
                                'Authorization': `Bearer ${newToken}`
                            },
                            ...(method === 'get' ? { params } : { data })
                        });

                        console.log("✅ Retried Request Success:", retryResponse.status);
                        resolve(retryResponse.data);
                    } catch (retryError) {
                        console.error("❌ Retried Request Failed:", retryError.response?.data || retryError.message);
                        reject(retryError);
                    }
                });
            }

            console.error(`❌ Magento API ${method.toUpperCase()} Error:`, error.response?.data || error.message);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        return this.request('get', endpoint, {}, params);
    }

    async post(endpoint, data) {
        return this.request('post', endpoint, data);
    }

    async put(endpoint, data) {
        return this.request('put', endpoint, data);
    }

    async delete(endpoint) {
        return this.request('delete', endpoint);
    }
}

module.exports = MagentoService;
