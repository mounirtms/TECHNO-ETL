// Import JSON data
import orders from '../assets/data/orders.json';
import customers from '../assets/data/customers.json';
import invoices from '../assets/data/invoices.json';
import products from '../assets/data/products.json';
import salesRules from '../assets/data/salesRules.json';
import categories from '../assets/data/category.json';

export const getOrders = () => orders;
export const getCustomers = () => customers;
export const getInvoices = () => invoices;
export const getProducts = () => products;
export const getSalesRules = () => salesRules;

// Function to transform categories into tree structure
export const getCategoryTree = () => {
    const buildTree = (categories, parentId = null) => {
        return categories
            .filter(category => category.parent_id === parentId)
            .map(category => ({
                ...category,
                id: category.entity_id,
                children: buildTree(categories, category.entity_id)
            }));
    };

    return buildTree(categories);
};
