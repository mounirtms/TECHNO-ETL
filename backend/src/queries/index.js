/**
 * SQL Queries Index
 * Central export point for all SQL queries in the application
 *
 * @author Techno-ETL Team
 * @version 1.0.0
 */

// Import all query modules
import * as mdmQueries from './mdmQueries.js';
import * as productQueries from './productQueries.js';
import * as orderQueries from './orderQueries.js';

/**
 * MDM (Master Data Management) Queries
 * Queries for inventory, pricing, and stock management
 */
export const MDM = mdmQueries;

/**
 * Product Catalog Queries
 * Queries for product management, search, and catalog operations
 */
export const PRODUCTS = productQueries;

/**
 * Order Management Queries
 * Queries for order processing, tracking, and reporting
 */
export const ORDERS = orderQueries;

/**
 * All queries grouped by functionality
 * Provides easy access to all query categories
 */
export const QUERIES = {
  MDM: mdmQueries,
  PRODUCTS: productQueries,
  ORDERS: orderQueries,
};

/**
 * Query execution helper
 * Provides a standardized way to execute queries with parameters
 *
 * @param {Object} pool - Database connection pool
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function executeQuery(pool, query, params = []) {
  try {
    const request = pool.request();

    // Add parameters to the request
    params.forEach((param, index) => {
      request.input(`param${index}`, param);
    });

    const result = await request.query(query);

    return {
      success: true,
      data: result.recordset,
      rowsAffected: result.rowsAffected,
    };
  } catch (error) {
    console.error('Query execution error:', error);

    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}

/**
 * Query builder helper
 * Helps build dynamic queries with conditional WHERE clauses
 *
 * @param {string} baseQuery - Base SQL query
 * @param {Object} conditions - Conditional WHERE clauses
 * @returns {string} Built query string
 */
export function buildQuery(baseQuery, conditions = {}) {
  let query = baseQuery;
  const whereConditions = [];

  Object.entries(conditions).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      whereConditions.push(`${key} = @${key}`);
    }
  });

  if (whereConditions.length > 0) {
    if (query.includes('WHERE 1=1')) {
      query = query.replace('WHERE 1=1', `WHERE 1=1 AND ${whereConditions.join(' AND ')}`);
    } else {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
  }

  return query;
}

/**
 * Pagination helper
 * Adds OFFSET and FETCH clauses to queries for pagination
 *
 * @param {string} query - Base SQL query
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Number of records per page
 * @returns {string} Query with pagination
 */
export function addPagination(query, page = 1, pageSize = 25) {
  const offset = (page - 1) * pageSize;

  if (!query.includes('ORDER BY')) {
    query += ' ORDER BY 1'; // Add default ordering if none exists
  }

  query += ` OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;

  return query;
}

/**
 * Query validation helper
 * Validates query parameters and structure
 *
 * @param {string} query - SQL query to validate
 * @param {Array} params - Query parameters
 * @returns {Object} Validation result
 */
export function validateQuery(query, params = []) {
  const validation = {
    isValid: true,
    errors: [],
  };

  // Check for basic SQL injection patterns
  const dangerousPatterns = [
    /;\s*(drop|delete|truncate|alter)\s+/i,
    /union\s+select/i,
    /exec\s*\(/i,
    /xp_cmdshell/i,
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(query)) {
      validation.isValid = false;
      validation.errors.push('Potentially dangerous SQL pattern detected');
    }
  });

  // Check parameter count vs placeholders
  const placeholderCount = (query.match(/\?/g) || []).length;

  if (placeholderCount !== params.length) {
    validation.isValid = false;
    validation.errors.push(`Parameter count mismatch: expected ${placeholderCount}, got ${params.length}`);
  }

  return validation;
}

/**
 * Query performance monitoring
 * Tracks query execution times and performance metrics
 *
 * @param {string} queryName - Name/identifier for the query
 * @param {Function} queryFunction - Function that executes the query
 * @returns {Promise<Object>} Query result with performance metrics
 */
export async function monitorQuery(queryName, queryFunction) {
  const startTime = Date.now();

  try {
    const result = await queryFunction();
    const executionTime = Date.now() - startTime;

    console.log(`Query Performance [${queryName}]: ${executionTime}ms`);

    return {
      ...result,
      performance: {
        executionTime,
        queryName,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;

    console.error(`Query Error [${queryName}] after ${executionTime}ms:`, error);

    throw {
      ...error,
      performance: {
        executionTime,
        queryName,
        timestamp: new Date().toISOString(),
        failed: true,
      },
    };
  }
}

// Export default object with all queries and utilities
export default {
  MDM: mdmQueries,
  PRODUCTS: productQueries,
  ORDERS: orderQueries,
  executeQuery,
  buildQuery,
  addPagination,
  validateQuery,
  monitorQuery,
};
