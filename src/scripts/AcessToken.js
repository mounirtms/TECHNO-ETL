const axios = require('axios');
const cache = require('memory-cache');
const magentoUrl = 'https://technostationery.com/rest/V1/integration/admin/token';
const magentoCredentials = {
    username: 'islam.ba',
    password: 'tP5WTKPdJRYe2db'
};

/**
 * Get Magento Admin Token
 * @returns {Promise<string>} The admin token
 */
async function getMagentoAdminToken() {
    try {
        if (cache.get('magentoAdminToken')) {
            console.log('Using cached Magento Admin Token');
            return cache.get('magentoAdminToken');
        }
        console.log('Fetching new Magento Admin Token');

        const tokenResponse = await axios.post(magentoUrl, magentoCredentials);
        const token = tokenResponse.data;
        console.log('Magento Admin Token:', token);
        cache.put('magentoAdminToken', token, 48 * 3600 * 1000); // Cache for 48 hours
        console.log('Token cached successfully');
        return token;
    } catch (error) {
        console.error('Failed to get Magento Admin Token:', error.response?.data?.message || error.message);
        throw error;
    }
}

async function main (sku) {
    getMagentoAdminToken().then(token => {
        return fetchProductMedia(sku, token);
    });
}

async function fetchProductMedia(sku, token) {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
    try {
        const response = await axios.get(`https://technostationery.com/rest/V1/products/${sku}`, config);

        console.log('Product Media:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to get product media:', error.response?.data?.message || error.message);
        throw error;
    }
}

main('1140591612');