/**
 * @file categoryService.js
 * @description Service for handling category data, including fetching, processing, and filtering.
 */

import categoryData from '../assets/data/category.json';

// --- Private Helper Functions ---

/**
 * Flattens the category tree into a flat array with hierarchy information.
 * @param {Array} categories - The array of category objects to flatten.
 * @param {number} [level=0] - The starting level for the hierarchy.
 * @param {string|null} parentId - The ID of the parent category.
 * @param {Array} [result=[]] - The accumulator for the flattened categories.
 * @param {string} [parentPath=''] - The path of the parent category.
 * @returns {Array} A flat array of category objects.
 */
const processCategories = (categories, level = 0, parentId = null, result = [], parentPath = '') => {
    if (!categories) return result;
    const categoryArray = Array.isArray(categories) ? categories : [categories];

    categoryArray.forEach(category => {
        if (!category || !category.id) return;

        const currentPath = parentPath ? `${parentPath}-${category.id}` : `${category.id}`;
        const processedCategory = {
            ...category,
            id: currentPath,
            originalId: category.id,
            level,
            parentId,
            has_children: category.children_data?.length > 0 || category.children?.length > 0,
            name: category.name || `Category ${category.id}`,
            position: category.position || 0,
            is_active: category.is_active !== undefined ? category.is_active : true,
            product_count: category.product_count || 0,
        };
        result.push(processedCategory);

        const children = category.children_data || category.children || [];
        if (children.length > 0) {
            processCategories(children, level + 1, currentPath, result, currentPath);
        }
    });

    return result;
};

const allCategories = processCategories(categoryData.children_data || categoryData.children || []);

// --- Public API ---

const getAllCategories = () => allCategories;

const getRootCategories = () => allCategories.filter(cat => cat.level === 0);

const findCategoryById = (id) => allCategories.find(cat => cat.id === id);

const getVisibleCategories = (expandedRows = new Set()) => {
    return allCategories.filter(cat => {
        if (cat.level === 0) return true;
        return expandedRows.has(cat.parentId);
    });
};

const searchCategories = (searchTerm) => {
    if (!searchTerm) return allCategories;
    const lowercasedTerm = searchTerm.toLowerCase();
    return allCategories.filter(category => 
        category.name.toLowerCase().includes(lowercasedTerm)
    );
};

const getCategoryStats = () => ({
    total: allCategories.length,
    active: allCategories.filter(cat => cat.is_active).length,
    inactive: allCategories.filter(cat => !cat.is_active).length,
});

const formatCategoryForGrid = (category) => ({
    ...category,
    // Additional formatting can be done here if needed
});

/**
 * Asynchronously fetches and processes categories based on filters.
 * @param {object} [filters={}] - The filtering criteria.
 * @returns {Promise<{categories: Array, stats: object}>} A promise that resolves to the processed categories and stats.
 */
const fetchAndProcessCategories = async (filters = {}) => {
    return new Promise(resolve => {
        let categories = getAllCategories();

        if (filters.search) {
            categories = searchCategories(filters.search);
        }

        if (filters.is_active !== undefined) {
            const isActive = filters.is_active === 'true' || filters.is_active === true;
            categories = categories.filter(cat => cat.is_active === isActive);
        }

        const visibleCategories = getVisibleCategories(filters.expandedRows);
        const finalCategories = categories.filter(cat => visibleCategories.includes(cat));

        resolve({
            categories: finalCategories.map(formatCategoryForGrid),
            stats: getCategoryStats(),
        });
    });
};

export default {
    getAllCategories,
    getRootCategories,
    findCategoryById,
    getVisibleCategories,
    searchCategories,
    getCategoryStats,
    formatCategoryForGrid,
    fetchAndProcessCategories,
};
