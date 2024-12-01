// Application configuration
const config = {
    api: {
        magento: {
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
