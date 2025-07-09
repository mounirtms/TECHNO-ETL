// src/controllers/apiController.js
import { cloudConfig, betaConfig } from '../config/magento.js';
import MagentoService from '../services/magentoService.js';

// Helper: Recursively flatten params for Magento (searchCriteria, arrays, objects)
function flattenMagentoParams(obj, urlParams, prefix = '') {
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const value = obj[key];
        const paramKey = prefix ? `${prefix}[${key}]` : key;
        if (value === undefined || value === null || value === '') continue;
        if (typeof value === 'object' && !Array.isArray(value)) {
            flattenMagentoParams(value, urlParams, paramKey);
        } else if (Array.isArray(value)) {
            value.forEach((item, idx) => {
                if (typeof item === 'object') {
                    flattenMagentoParams(item, urlParams, `${paramKey}[${idx}]`);
                } else {
                    urlParams.append(`${paramKey}[${idx}]`, item);
                }
            });
        } else {
            urlParams.append(paramKey, value);
        }
    }
}

function buildMagentoQueryString(query = {}) {
    if (typeof query === 'string') return query;
    const params = new URLSearchParams();
    flattenMagentoParams(query, params);
    return params.toString();
}

let magentoService = null;

export async function getMdmData(req, res) {
    res.json({ message: 'getMdmData handler stub' });
}

export async function getCegiData(req, res) {
    res.json({ message: 'getCegiData handler stub' });
}

export async function proxyMagentoRequest(req, res) {
    try {
        const { method, query, body } = req;
        // Remove any double slashes in the endpoint path
        let endpoint = req.originalUrl.replace("/api/magento", "").replace(/\/+/g, "/");

        if (!magentoService) {
            magentoService = new MagentoService(cloudConfig);
        }

        let response;
        let endpointWithQuery = endpoint;
        // Only build query string if not already present in endpoint
        if (method.toLowerCase() === 'get' && Object.keys(query).length > 0 && !endpoint.includes('?')) {
            const queryString = buildMagentoQueryString(query);
            endpointWithQuery = endpoint + (queryString ? '?' + queryString : '');
        }

        // Special case for admin token
        if (endpoint.includes('admin/token')) {
            response = await magentoService.getToken(true);
            return res.json(response);
        }

        console.log(`[MagentoProxy] ${method.toUpperCase()} ${endpointWithQuery}`);

        switch (method.toLowerCase()) {
            case "get":
                response = await magentoService.get(endpointWithQuery);
                break;
            case "post":
                response = await magentoService.post(endpoint, body);
                break;
            case "put":
                response = await magentoService.put(endpoint, body);
                break;
            case "delete":
                response = await magentoService.delete(endpoint);
                break;
            default:
                return res.status(405).json({ error: "Method not allowed" });
        }

        res.json(response);
    } catch (error) {
        console.error(`❌ Magento Proxy Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
}

export default {
    getMdmData,
    getCegiData,
    proxyMagentoRequest
};
