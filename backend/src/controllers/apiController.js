// src/controllers/apiController.js
const mdmQueries = require('../mdm/mdm'); // Adjust the path as necessary
const cegidQueries = require('../cegid/cegid'); // Adjust the path as necessary
const { cloudConfig, betaConfig } = require('../config/magento'); // Import Magento config
const MagentoService = require('../services/magentoService'); // Import Magento service



exports.getMdmData = async (req, res) => {
    try {
        const data = await mdmQueries.executeQuery(); // Replace with your actual query function
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getCegiData = async (req, res) => {
    try {
        const data = await cegidQueries.executeQuery(); // Replace with your actual query function
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

function buildSearchParams(params = {}) {
    const searchParams = new URLSearchParams();

    // Ensure searchCriteria is present
    searchParams.append("searchCriteria", "");

    // Pagination
    if (params.pageSize) {
        searchParams.append("searchCriteria[pageSize]", params.pageSize);
    }
    if (params.currentPage) {
        searchParams.append("searchCriteria[currentPage]", params.currentPage);
    }

    // Sorting
    if (params.sortOrders) {
        params.sortOrders.forEach((sort, index) => {
            searchParams.append(`searchCriteria[sortOrders][${index}][field]`, sort.field);
            searchParams.append(`searchCriteria[sortOrders][${index}][direction]`, sort.direction);
        });
    }

    // Filters
    if (params.filterGroups) {
        params.filterGroups.forEach((group, groupIndex) => {
            group.filters.forEach((filter, filterIndex) => {
                searchParams.append(`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][field]`, filter.field);
                searchParams.append(`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][value]`, filter.value);
                searchParams.append(`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][condition_type]`, filter.conditionType || 'eq');
            });
        });
    }

    return searchParams.toString();
}

let magentoService = null;

exports.proxyMagentoRequest = async (req, res) => {
    try {
        const { method, query, body } = req;
        const endpoint = req.originalUrl.replace("/api/magento", "");

        if (!magentoService) {
            magentoService = new MagentoService(cloudConfig);
        }

        let response;
        const formattedParams = buildSearchParams(query);

        if (endpoint.includes('admin/token')) {
            let username = body.username.replace("@techno-dz.com", "");
            response = await magentoService.getMagentoToken(true);
            return res.json(response);
        }

        console.log("Endpoint:", endpoint);
        console.log("Formatted Params:", formattedParams);

        switch (method.toLowerCase()) {
            case "get":
                response = await magentoService.get(endpoint, formattedParams);
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
};
