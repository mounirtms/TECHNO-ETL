/**
 * Order Database Queries
 * Professional SQL query management for order operations
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

/**
 * Get all orders with pagination and filtering
 * Retrieves orders with comprehensive filtering and pagination support
 * 
 * @param {Object} filters - Filter parameters (status, date range, customer, etc.)
 * @param {number} limit - Number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Array} Array of order records
 */
export const GET_ALL_ORDERS = `
SELECT 
    o.entity_id,
    o.increment_id,
    o.status,
    o.state,
    o.customer_id,
    o.customer_email,
    o.customer_firstname,
    o.customer_lastname,
    o.grand_total,
    o.subtotal,
    o.tax_amount,
    o.shipping_amount,
    o.discount_amount,
    o.total_qty_ordered,
    o.created_at,
    o.updated_at,
    o.store_id,
    o.currency_code,
    a.street,
    a.city,
    a.region,
    a.postcode,
    a.country_id,
    a.telephone
FROM sales_order o
LEFT JOIN sales_order_address a ON o.entity_id = a.parent_id AND a.address_type = 'billing'
WHERE 1=1
    AND (@status IS NULL OR o.status = @status)
    AND (@state IS NULL OR o.state = @state)
    AND (@customerId IS NULL OR o.customer_id = @customerId)
    AND (@startDate IS NULL OR o.created_at >= @startDate)
    AND (@endDate IS NULL OR o.created_at <= @endDate)
    AND (@minAmount IS NULL OR o.grand_total >= @minAmount)
    AND (@maxAmount IS NULL OR o.grand_total <= @maxAmount)
    AND (@searchTerm IS NULL OR 
         o.increment_id LIKE CONCAT('%', @searchTerm, '%') OR 
         o.customer_email LIKE CONCAT('%', @searchTerm, '%') OR
         CONCAT(o.customer_firstname, ' ', o.customer_lastname) LIKE CONCAT('%', @searchTerm, '%'))
ORDER BY o.created_at DESC
OFFSET @offset ROWS
FETCH NEXT @limit ROWS ONLY;
`;

/**
 * Get order by increment ID
 * Retrieves detailed order information for a specific order
 * 
 * @param {string} incrementId - Order increment ID
 * @returns {Object} Order details
 */
export const GET_ORDER_BY_INCREMENT_ID = `
SELECT 
    o.entity_id,
    o.increment_id,
    o.status,
    o.state,
    o.customer_id,
    o.customer_email,
    o.customer_firstname,
    o.customer_lastname,
    o.grand_total,
    o.subtotal,
    o.tax_amount,
    o.shipping_amount,
    o.discount_amount,
    o.total_qty_ordered,
    o.created_at,
    o.updated_at,
    o.store_id,
    o.currency_code,
    o.shipping_description,
    o.payment_method,
    ba.street as billing_street,
    ba.city as billing_city,
    ba.region as billing_region,
    ba.postcode as billing_postcode,
    ba.country_id as billing_country,
    ba.telephone as billing_telephone,
    sa.street as shipping_street,
    sa.city as shipping_city,
    sa.region as shipping_region,
    sa.postcode as shipping_postcode,
    sa.country_id as shipping_country,
    sa.telephone as shipping_telephone
FROM sales_order o
LEFT JOIN sales_order_address ba ON o.entity_id = ba.parent_id AND ba.address_type = 'billing'
LEFT JOIN sales_order_address sa ON o.entity_id = sa.parent_id AND sa.address_type = 'shipping'
WHERE o.increment_id = ?;
`;

/**
 * Get order items
 * Retrieves all items for a specific order
 * 
 * @param {number} orderId - Order entity ID
 * @returns {Array} Array of order items
 */
export const GET_ORDER_ITEMS = `
SELECT 
    oi.item_id,
    oi.order_id,
    oi.product_id,
    oi.sku,
    oi.name,
    oi.qty_ordered,
    oi.qty_shipped,
    oi.qty_invoiced,
    oi.qty_canceled,
    oi.qty_refunded,
    oi.price,
    oi.base_price,
    oi.original_price,
    oi.tax_amount,
    oi.discount_amount,
    oi.row_total,
    oi.base_row_total,
    oi.product_type,
    oi.weight,
    oi.created_at,
    oi.updated_at
FROM sales_order_item oi
WHERE oi.order_id = ?
ORDER BY oi.item_id;
`;

/**
 * Create new order
 * Inserts a new order into the system
 * 
 * @param {Object} orderData - Order information to insert
 * @returns {number} New order ID
 */
export const CREATE_ORDER = `
INSERT INTO sales_order (
    increment_id,
    status,
    state,
    customer_id,
    customer_email,
    customer_firstname,
    customer_lastname,
    grand_total,
    subtotal,
    tax_amount,
    shipping_amount,
    discount_amount,
    total_qty_ordered,
    store_id,
    currency_code,
    shipping_description,
    payment_method,
    created_at,
    updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), GETDATE());
`;

/**
 * Update order status
 * Updates the status and state of an order
 * 
 * @param {string} status - New order status
 * @param {string} state - New order state
 * @param {string} incrementId - Order increment ID
 * @returns {number} Number of affected rows
 */
export const UPDATE_ORDER_STATUS = `
UPDATE sales_order 
SET 
    status = ?,
    state = ?,
    updated_at = GETDATE()
WHERE increment_id = ?;
`;

/**
 * Get orders by customer
 * Retrieves all orders for a specific customer
 * 
 * @param {number} customerId - Customer ID
 * @param {number} limit - Number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Array} Array of customer orders
 */
export const GET_ORDERS_BY_CUSTOMER = `
SELECT 
    o.entity_id,
    o.increment_id,
    o.status,
    o.state,
    o.grand_total,
    o.total_qty_ordered,
    o.created_at,
    o.currency_code
FROM sales_order o
WHERE o.customer_id = ?
ORDER BY o.created_at DESC
OFFSET ? ROWS
FETCH NEXT ? ROWS ONLY;
`;

/**
 * Get recent orders
 * Retrieves the most recent orders within the specified time period
 * 
 * @param {number} hours - Number of hours to look back (default: 24)
 * @param {number} limit - Number of records to return
 * @returns {Array} Array of recent orders
 */
export const GET_RECENT_ORDERS = `
SELECT 
    o.entity_id,
    o.increment_id,
    o.status,
    o.state,
    o.customer_email,
    o.customer_firstname,
    o.customer_lastname,
    o.grand_total,
    o.created_at
FROM sales_order o
WHERE o.created_at >= DATEADD(HOUR, -?, GETDATE())
ORDER BY o.created_at DESC
OFFSET 0 ROWS
FETCH NEXT ? ROWS ONLY;
`;

/**
 * Get order statistics
 * Provides summary statistics for order management
 * 
 * @param {string} startDate - Start date for statistics (optional)
 * @param {string} endDate - End date for statistics (optional)
 * @returns {Object} Order statistics
 */
export const GET_ORDER_STATS = `
SELECT 
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_orders,
    SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) as completed_orders,
    SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled_orders,
    SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded_orders,
    SUM(CAST(grand_total AS FLOAT)) as total_revenue,
    AVG(CAST(grand_total AS FLOAT)) as average_order_value,
    SUM(CAST(total_qty_ordered AS INT)) as total_items_sold,
    AVG(CAST(total_qty_ordered AS FLOAT)) as average_items_per_order
FROM sales_order
WHERE 1=1
    AND (@startDate IS NULL OR created_at >= @startDate)
    AND (@endDate IS NULL OR created_at <= @endDate);
`;

/**
 * Get orders by status
 * Retrieves orders filtered by specific status
 * 
 * @param {string} status - Order status to filter by
 * @param {number} limit - Number of records to return
 * @param {number} offset - Number of records to skip
 * @returns {Array} Array of orders with specified status
 */
export const GET_ORDERS_BY_STATUS = `
SELECT 
    o.entity_id,
    o.increment_id,
    o.status,
    o.state,
    o.customer_email,
    o.customer_firstname,
    o.customer_lastname,
    o.grand_total,
    o.created_at,
    o.updated_at
FROM sales_order o
WHERE o.status = ?
ORDER BY o.created_at DESC
OFFSET ? ROWS
FETCH NEXT ? ROWS ONLY;
`;

/**
 * Get top selling products from orders
 * Retrieves products with highest sales volume
 * 
 * @param {number} days - Number of days to look back (default: 30)
 * @param {number} limit - Number of products to return
 * @returns {Array} Array of top selling products
 */
export const GET_TOP_SELLING_PRODUCTS = `
SELECT 
    oi.sku,
    oi.name,
    SUM(CAST(oi.qty_ordered AS INT)) as total_qty_sold,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(CAST(oi.row_total AS FLOAT)) as total_revenue,
    AVG(CAST(oi.price AS FLOAT)) as average_price
FROM sales_order_item oi
INNER JOIN sales_order o ON oi.order_id = o.entity_id
WHERE o.created_at >= DATEADD(DAY, -?, GETDATE())
    AND o.status NOT IN ('canceled', 'refunded')
GROUP BY oi.sku, oi.name
ORDER BY total_qty_sold DESC
OFFSET 0 ROWS
FETCH NEXT ? ROWS ONLY;
`;

/**
 * Get daily sales report
 * Provides daily breakdown of sales metrics
 * 
 * @param {number} days - Number of days to include in report
 * @returns {Array} Array of daily sales data
 */
export const GET_DAILY_SALES_REPORT = `
SELECT 
    CAST(o.created_at AS DATE) as sale_date,
    COUNT(*) as order_count,
    SUM(CAST(o.grand_total AS FLOAT)) as total_revenue,
    AVG(CAST(o.grand_total AS FLOAT)) as average_order_value,
    SUM(CAST(o.total_qty_ordered AS INT)) as total_items_sold
FROM sales_order o
WHERE o.created_at >= DATEADD(DAY, -?, GETDATE())
    AND o.status NOT IN ('canceled', 'refunded')
GROUP BY CAST(o.created_at AS DATE)
ORDER BY sale_date DESC;
`;
