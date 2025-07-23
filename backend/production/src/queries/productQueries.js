/**
 * Product Database Queries
 * Professional SQL query management for product operations
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

/**
 * Get all products with pagination and filtering
 * Retrieves products with comprehensive filtering and pagination support
 * 
 * @param {Object} filters - Filter parameters (category, status, price range, etc.)
 * @param {number} limit - Number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Array} Array of product records
 */
export const GET_ALL_PRODUCTS = `
SELECT 
    p.id,
    p.sku,
    p.name,
    p.price,
    p.special_price,
    p.status,
    p.visibility,
    p.type_id,
    p.attribute_set_id,
    p.created_at,
    p.updated_at,
    p.weight,
    p.category_ids,
    s.qty as stock_quantity,
    s.is_in_stock,
    s.manage_stock
FROM catalog_product_entity p
LEFT JOIN cataloginventory_stock_item s ON p.entity_id = s.product_id
WHERE 1=1
    AND (@status IS NULL OR p.status = @status)
    AND (@category IS NULL OR p.category_ids LIKE CONCAT('%', @category, '%'))
    AND (@minPrice IS NULL OR p.price >= @minPrice)
    AND (@maxPrice IS NULL OR p.price <= @maxPrice)
    AND (@searchTerm IS NULL OR p.name LIKE CONCAT('%', @searchTerm, '%') OR p.sku LIKE CONCAT('%', @searchTerm, '%'))
ORDER BY p.updated_at DESC
OFFSET @offset ROWS
FETCH NEXT @limit ROWS ONLY;
`;

/**
 * Get product by SKU
 * Retrieves detailed product information for a specific SKU
 * 
 * @param {string} sku - Product SKU to lookup
 * @returns {Object} Product details
 */
export const GET_PRODUCT_BY_SKU = `
SELECT 
    p.id,
    p.sku,
    p.name,
    p.description,
    p.short_description,
    p.price,
    p.special_price,
    p.special_from_date,
    p.special_to_date,
    p.status,
    p.visibility,
    p.type_id,
    p.attribute_set_id,
    p.created_at,
    p.updated_at,
    p.weight,
    p.category_ids,
    p.image,
    p.small_image,
    p.thumbnail,
    s.qty as stock_quantity,
    s.is_in_stock,
    s.manage_stock,
    s.min_qty,
    s.max_sale_qty
FROM catalog_product_entity p
LEFT JOIN cataloginventory_stock_item s ON p.entity_id = s.product_id
WHERE p.sku = ?;
`;

/**
 * Create new product
 * Inserts a new product into the catalog
 * 
 * @param {Object} productData - Product information to insert
 * @returns {number} New product ID
 */
export const CREATE_PRODUCT = `
INSERT INTO catalog_product_entity (
    sku,
    name,
    description,
    short_description,
    price,
    special_price,
    special_from_date,
    special_to_date,
    status,
    visibility,
    type_id,
    attribute_set_id,
    weight,
    category_ids,
    image,
    small_image,
    thumbnail,
    created_at,
    updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), GETDATE());
`;

/**
 * Update product information
 * Updates existing product with new information
 * 
 * @param {Object} productData - Updated product information
 * @param {string} sku - Product SKU to update
 * @returns {number} Number of affected rows
 */
export const UPDATE_PRODUCT = `
UPDATE catalog_product_entity 
SET 
    name = ?,
    description = ?,
    short_description = ?,
    price = ?,
    special_price = ?,
    special_from_date = ?,
    special_to_date = ?,
    status = ?,
    visibility = ?,
    weight = ?,
    category_ids = ?,
    image = ?,
    small_image = ?,
    thumbnail = ?,
    updated_at = GETDATE()
WHERE sku = ?;
`;

/**
 * Update product stock
 * Updates stock information for a product
 * 
 * @param {number} qty - New stock quantity
 * @param {boolean} isInStock - Stock availability status
 * @param {string} sku - Product SKU
 * @returns {number} Number of affected rows
 */
export const UPDATE_PRODUCT_STOCK = `
UPDATE cataloginventory_stock_item 
SET 
    qty = ?,
    is_in_stock = ?,
    updated_at = GETDATE()
WHERE product_id = (SELECT id FROM catalog_product_entity WHERE sku = ?);
`;

/**
 * Delete product
 * Removes a product from the catalog
 * 
 * @param {string} sku - Product SKU to delete
 * @returns {number} Number of affected rows
 */
export const DELETE_PRODUCT = `
DELETE FROM catalog_product_entity 
WHERE sku = ?;
`;

/**
 * Get products by category
 * Retrieves products belonging to a specific category
 * 
 * @param {number} categoryId - Category ID
 * @param {number} limit - Number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Array} Array of products in category
 */
export const GET_PRODUCTS_BY_CATEGORY = `
SELECT 
    p.id,
    p.sku,
    p.name,
    p.price,
    p.special_price,
    p.status,
    p.created_at,
    s.qty as stock_quantity,
    s.is_in_stock
FROM catalog_product_entity p
LEFT JOIN cataloginventory_stock_item s ON p.entity_id = s.product_id
WHERE p.category_ids LIKE CONCAT('%', ?, '%')
    AND p.status = 1
ORDER BY p.name
OFFSET ? ROWS
FETCH NEXT ? ROWS ONLY;
`;

/**
 * Get low stock products
 * Identifies products with stock levels below the specified threshold
 * 
 * @param {number} threshold - Minimum stock threshold
 * @returns {Array} Array of low stock products
 */
export const GET_LOW_STOCK_PRODUCTS = `
SELECT 
    p.id,
    p.sku,
    p.name,
    p.price,
    s.qty as stock_quantity,
    s.min_qty,
    p.updated_at
FROM catalog_product_entity p
INNER JOIN cataloginventory_stock_item s ON p.entity_id = s.product_id
WHERE s.qty < ? 
    AND s.qty > 0
    AND s.manage_stock = 1
    AND p.status = 1
ORDER BY s.qty ASC, p.name;
`;

/**
 * Get out of stock products
 * Retrieves products that are completely out of stock
 * 
 * @returns {Array} Array of out of stock products
 */
export const GET_OUT_OF_STOCK_PRODUCTS = `
SELECT 
    p.id,
    p.sku,
    p.name,
    p.price,
    s.qty as stock_quantity,
    p.updated_at
FROM catalog_product_entity p
INNER JOIN cataloginventory_stock_item s ON p.entity_id = s.product_id
WHERE (s.qty = 0 OR s.is_in_stock = 0)
    AND s.manage_stock = 1
    AND p.status = 1
ORDER BY p.updated_at DESC;
`;

/**
 * Get product statistics
 * Provides summary statistics for product catalog
 * 
 * @returns {Object} Product statistics
 */
export const GET_PRODUCT_STATS = `
SELECT 
    COUNT(*) as total_products,
    SUM(CASE WHEN p.status = 1 THEN 1 ELSE 0 END) as active_products,
    SUM(CASE WHEN p.status = 0 THEN 1 ELSE 0 END) as inactive_products,
    SUM(CASE WHEN s.qty > 0 AND s.is_in_stock = 1 THEN 1 ELSE 0 END) as in_stock,
    SUM(CASE WHEN s.qty = 0 OR s.is_in_stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
    SUM(CASE WHEN s.qty > 0 AND s.qty < 10 THEN 1 ELSE 0 END) as low_stock,
    AVG(CAST(p.price AS FLOAT)) as average_price,
    SUM(CAST(s.qty AS BIGINT) * CAST(p.price AS FLOAT)) as total_inventory_value
FROM catalog_product_entity p
LEFT JOIN cataloginventory_stock_item s ON p.entity_id = s.product_id
WHERE p.price IS NOT NULL AND p.price > 0;
`;

/**
 * Search products
 * Full-text search across product name, SKU, and description
 * 
 * @param {string} searchTerm - Search term
 * @param {number} limit - Number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Array} Array of matching products
 */
export const SEARCH_PRODUCTS = `
SELECT 
    p.id,
    p.sku,
    p.name,
    p.description,
    p.price,
    p.special_price,
    p.status,
    s.qty as stock_quantity,
    s.is_in_stock,
    p.created_at
FROM catalog_product_entity p
LEFT JOIN cataloginventory_stock_item s ON p.entity_id = s.product_id
WHERE (
    p.name LIKE CONCAT('%', ?, '%') 
    OR p.sku LIKE CONCAT('%', ?, '%')
    OR p.description LIKE CONCAT('%', ?, '%')
)
AND p.status = 1
ORDER BY 
    CASE 
        WHEN p.sku = ? THEN 1
        WHEN p.name LIKE CONCAT(?, '%') THEN 2
        WHEN p.sku LIKE CONCAT(?, '%') THEN 3
        ELSE 4
    END,
    p.name
OFFSET ? ROWS
FETCH NEXT ? ROWS ONLY;
`;
