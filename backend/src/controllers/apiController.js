// Add a default export for compatibility with routes.js
export async function getMdmData(req, res) {
    res.json({ message: 'getMdmData handler stub' });
}

export async function getCegiData(req, res) {
    res.json({ message: 'getCegiData handler stub' });
}

export async function proxyMagentoRequest(req, res) {
    res.json({ message: 'proxyMagentoRequest handler stub' });
}

export default {
    getMdmData,
    getCegiData,
    proxyMagentoRequest
};
// src/controllers/apiController.js
//import mdmQueries from '../mdm/mdm.js';
//import cegidQueries from '../cegid/cegid.js';
import { cloudConfig, betaConfig } from '../config/magento.js';
import MagentoService from '../services/magentoService.js';



// Removed duplicate getMdmData export/function

// Removed duplicate getCegiData export/function



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

// Removed duplicate proxyMagentoRequest export/function

// Removed export of undefined functions
