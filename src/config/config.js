// Application configuration
const config = {
    api: {
        magento: {
            baseUrl: import.meta.env.VITE_MAGENTO_API_URL || 'https://technostationery.com/rest/V1',
            endpoints: {
                login: '/integration/admin/token',
                storeConfig: '/store/storeConfigs',
                // Add other endpoints as needed
            }
        }
    },
    version: '1.0.0',
    // Add other configuration as needed
};

export default config;
