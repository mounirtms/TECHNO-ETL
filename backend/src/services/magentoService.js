const axios = require('axios');
const NodeCache = require('node-cache');

  

class MagentoService {
    static instance = null;
    static token = null;

    constructor(config) {
        if (MagentoService.instance) {
            return MagentoService.instance;
        }

        this.url = config.url;
        this.username = config.username;
        this.password = config.password;
        this.token = MagentoService.token; // Reuse token if available

        MagentoService.instance = this;
    }

    async getMagentoToken(forceRefresh = false) {
        if (MagentoService.token && !forceRefresh) {
            console.log("✅ Using existing Magento token.");
            return MagentoService.token;
        }

        console.log("🔑 Fetching new Magento token...");
        try {
            const response = await axios.post(`${this.url}/V1/integration/admin/token`, {
                username: this.username,
                password: this.password
            });
            MagentoService.token = response.data;
            return response.data;
        } catch (error) {
            console.error("❌ Error fetching Magento token:", error.response?.data || error.message);
            throw error;
        }
    }

    async request(method, endpoint, data = null) {
        if (!MagentoService.token) {
            await this.getMagentoToken();
        }

        const headers = {
            Authorization: `Bearer ${MagentoService.token}`,
            "Content-Type": "application/json"
        };

        try {
            const response = await axios({
                method,
                url: `${this.url}${endpoint}`,
                data,
                headers
            });
            return response.data;
        } catch (error) {
            console.error(`❌ Magento API Error (${method} ${endpoint}):`, error.response?.data || error.message);
            throw error;
        }
    }

    async get(endpoint, params = {}) {
        return this.request("get", endpoint, { params });
    }

    async post(endpoint, data) {
        return this.request("post", endpoint, data);
    }

    async put(endpoint, data) {
        return this.request("put", endpoint, data);
    }

    async delete(endpoint) {
        return this.request("delete", endpoint);
    }
}

module.exports = MagentoService;
 
