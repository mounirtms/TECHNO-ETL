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
    database: {
        sqlServer: {
            server: process.env.SQL_SERVER_HOST || 'localhost',
            port: parseInt(process.env.SQL_SERVER_PORT) || 1433,
            database: process.env.SQL_SERVER_DATABASE || 'master',
            options: {
                encrypt: process.env.SQL_SERVER_ENCRYPT === 'true',
                trustServerCertificate: true,
                enableArithAbort: true
            },
            authentication: {
                type: 'default',
                options: {
                    trustedConnection: true
                }
            }
        }
    },
    version: '1.0.0',
};

export default config;