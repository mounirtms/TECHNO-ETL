import axios from 'axios';
import directMagentoClient from '../services/directMagentoClient';

// Create axios instance factory with default config
const createAxiosInstance = (baseURL) => {
    const instance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': import.meta.env.VITE_USER_AGENT || 'Techno-ETL/1.0.0 (etl.techno-dz.com)',
        },
        // Disable withCredentials as it can cause CORS preflight issues
        withCredentials: false,
        // Add proxy configuration if needed
        proxy: false,
        // Timeout in milliseconds
        timeout: 30000,
    });

    // Request interceptor
    instance.interceptors.request.use((config) => {
            // Remove any CORS headers from client side as they should be set by the server
            delete config.headers['Access-Control-Allow-Origin'];
            delete config.headers['Access-Control-Allow-Methods'];
            delete config.headers['Access-Control-Allow-Headers'];

            // Add specific headers for Magento REST API if needed
            if (config.baseURL?.includes('technostationery.com')) {
                config.headers['Origin'] = 'https://technostationery.com';
                // Add any required Magento API authentication headers here
                // config.headers['Authorization'] = `Bearer ${token}`;
            }

            // Add production-specific headers
            if(import.meta.env.PROD) {
                config.headers['X-Requested-With'] = 'XMLHttpRequest';
                config.headers['X-App-Domain'] = import.meta.env.VITE_APP_DOMAIN || 'etl.techno-dz.com';
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor with specific handling for technostationery.com
    instance.interceptors.response.use((response) => response,
        (error) => {
            if(error.response) {
                if(error.response.status ===403) {
                    console.error('Access Forbidden - Check Magento API permissions');
                    return Promise.reject(new Error('Access Forbidden - Check Magento API permissions'));
                }
                if(error.response.status ===401) {
                    console.error('Authentication Error - Invalid or expired token');
                    return Promise.reject(new Error('Authentication Error - Invalid or expired token'));
                }
                console.error('Response error:', error.response.data);
            } else if(error.code === 'ERR_NETWORK') {
                console.error('Network Error: Unable to connect to technostationery.com. This might be due to CORS or network connectivity issues.');
                // Provide more helpful error message
                const errorMessage = 'Unable to connect to technostationery.com. Please ensure:\n' +
                    '1. You have the correct API permissions\n' +
                    '2. Your authentication token is valid\n' +
                    '3. The API endpoint is correct';
                return Promise.reject(new Error(errorMessage));
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// Create service-specific instances
let magentoInstance = null;
let cegidInstance = null;

export const initializeServices = (settings) => {
    if(settings.directMagento && settings.directMagento.enableDirectConnection) {
        console.log('🔄 Direct Magento connection enabled, initializing direct client...');
        directMagentoClient.initialize(settings.directMagento);
    } else {
        console.log('Using Proxy Magento Connection');
        if(settings.magentoUrl) {
            // Ensure the Magento URL is properly formatted
            const magentoBaseUrl = settings.magentoUrl.endsWith('/') 
                ? settings.magentoUrl.slice(0, -1) 
                : settings.magentoUrl;
            magentoInstance: any,
        }
        if(settings.cegidUrl) {
            cegidInstance: any,
        }
    }
};

// Utility functions for Magento service
export const magento = {
    get: async (url, params = {}) => {
        if (!magentoInstance) throw new Error('Magento service not initialized');
        try {
            return await magentoInstance.get(url, { 
                params,
                // Ensure these headers are sent with every request
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
        } catch(error: any) {
            console.error(`Error accessing Magento API at ${url}:`, error.message);
            throw error;
        }
    },
    post: async (url, data = {}) => {
        if (!magentoInstance) throw new Error('Magento service not initialized');
        try {
            return await magentoInstance.post(url, data, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
        } catch(error: any) {
            console.error(`Error posting to Magento API at ${url}:`, error.message);
            throw error;
        }
    },
    put: async (url, data = {}) => {
        if (!magentoInstance) throw new Error('Magento service not initialized');
        try {
            return await magentoInstance.put(url, data, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
        } catch(error: any) {
            console.error(`Error putting to Magento API at ${url}:`, error.message);
            throw error;
        }
    },
    delete: async(url) => {
        if (!magentoInstance) throw new Error('Magento service not initialized');
        try {
            return await magentoInstance.delete(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
        } catch(error: any) {
            console.error(`Error deleting from Magento API at ${url}:`, error.message);
            throw error;
        }
    },
    patch: async (url, data = {}) => {
        if (!magentoInstance) throw new Error('Magento service not initialized');
        try {
            return await magentoInstance.patch(url, data, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
        } catch(error: any) {
            console.error(`Error patching to Magento API at ${url}:`, error.message);
            throw error;
        }
    },
};

// Utility functions for Cegid service
export const cegid = {
    get: async (url, params = {}) => {
        if (!cegidInstance) throw new Error('Cegid service not initialized');
        try {
            return await cegidInstance.get(url, { params });
        } catch(error: any) {
            if (error.message.includes('CORS')) {
                // Handle CORS specific error for Cegid
                console.error('Cegid CORS Error:', error.message);
            }
            throw error;
        }
    },
    post: async (url, data = {}) => {
        if (!cegidInstance) throw new Error('Cegid service not initialized');
        try {
            return await cegidInstance.post(url, data);
        } catch(error: any) {
            if (error.message.includes('CORS')) {
                console.error('Cegid CORS Error:', error.message);
            }
            throw error;
        }
    },
    put: async (url, data = {}) => {
        if (!cegidInstance) throw new Error('Cegid service not initialized');
        try {
            return await cegidInstance.put(url, data);
        } catch(error: any) {
            if (error.message.includes('CORS')) {
                console.error('Cegid CORS Error:', error.message);
            }
            throw error;
        }
    },
    delete: async(url) => {
        if (!cegidInstance) throw new Error('Cegid service not initialized');
        try {
            return await cegidInstance.delete(url);
        } catch(error: any) {
            if (error.message.includes('CORS')) {
                console.error('Cegid CORS Error:', error.message);
            }
            throw error;
        }
    },
    patch: async (url, data = {}) => {
        if (!cegidInstance) throw new Error('Cegid service not initialized');
        try {
            return await cegidInstance.patch(url, data);
        } catch(error: any) {
            if (error.message.includes('CORS')) {
                console.error('Cegid CORS Error:', error.message);
            }
            throw error;
        }
    },
};
