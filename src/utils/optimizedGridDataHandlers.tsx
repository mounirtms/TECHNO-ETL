/**
 * Optimized Grid Data Handlers
 * Prevents duplicate processing and excessive logging
 * Uses memoization and caching for better performance
 */

import { toast } from 'react-toastify';

// Cache for processed data to prevent duplicate processing
const dataCache = new Map();
const validationCache = new Map();
const errorLogCache = new Set();

/**
 * Generate cache key for data
 */
const generateCacheKey = (data, options) => {
  try {
    return JSON.stringify({ data: Array.isArray(data) ? data.length : typeof data, options });
  } catch {
    return `${typeof data}-${Date.now()}`;
  }
};

/**
 * Optimized data validator with caching
 */
export const validateGridData = (data, options = {}) => {
  const cacheKey = generateCacheKey(data, options);
  
  // Return cached result if available
  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey);
  }

  const {
    expectedType = 'array',
    allowEmpty = true,
    requiredFields = [],
    transformers = {},
    fallbackValue = null
  } = options;

  try {
    // Type validation
    if (expectedType === 'array' && !Array.isArray(data)) {
      const errorKey = `type-error-${typeof data}`;
      if (!errorLogCache.has(errorKey)) {
        console.warn('GridDataHandler: Expected array but got:', typeof data);
        errorLogCache.add(errorKey);
      }
      
      const result = {
        isValid: false,
        data: allowEmpty ? [] : fallbackValue,
        errors: ['Data is not an array'],
        metadata: { originalType: typeof data, expectedType }
      };
      
      validationCache.set(cacheKey, result);
      return result;
    }

    // Empty data validation
    if (!allowEmpty && (!data || (Array.isArray(data) && data.length === 0))) {
      const result = {
        isValid: false,
        data: fallbackValue,
        errors: ['Data is empty but empty data is not allowed'],
        metadata: { isEmpty: true }
      };
      
      validationCache.set(cacheKey, result);
      return result;
    }

    // Field validation for arrays
    if (Array.isArray(data) && requiredFields.length > 0) {
      const missingFields = [];
      const sampleItem = data[0] || {};
      
      requiredFields.forEach(field => {
        if (!(field in sampleItem)) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        const errorKey = `missing-fields-${missingFields.join(',')}`;
        if (!errorLogCache.has(errorKey)) {
          console.warn('GridDataHandler: Missing required fields:', missingFields);
          errorLogCache.add(errorKey);
        }
      }
    }

    // Apply transformers
    let transformedData = data;
    if (Array.isArray(data) && Object.keys(transformers).length > 0) {
      transformedData = data.map(item => {
        const transformed = { ...item };
        Object.entries(transformers).forEach(([field, transformer]) => {
          if (field in transformed && typeof transformer === 'function') {
            try {
              transformed[field] = transformer(transformed[field]);
            } catch (error) {
              const errorKey = `transform-error-${field}`;
              if (!errorLogCache.has(errorKey)) {
                console.warn(`Transform error for field ${field}:`, error);
                errorLogCache.add(errorKey);
              }
            }
          }
        });
        return transformed;
      });
    }

    const result = {
      isValid: true,
      data: transformedData,
      errors: [],
      metadata: {
        itemCount: Array.isArray(transformedData) ? transformedData.length : 1,
        hasTransformers: Object.keys(transformers).length > 0
      }
    };

    // Cache successful validation
    validationCache.set(cacheKey, result);
    return result;

  } catch (error) {
    const errorKey = `validation-error-${error.message}`;
    if (!errorLogCache.has(errorKey)) {
      console.error('GridDataHandler: Validation error:', error);
      errorLogCache.add(errorKey);
    }

    const result = {
      isValid: false,
      data: fallbackValue,
      errors: [error.message],
      metadata: { hasError: true }
    };

    validationCache.set(cacheKey, result);
    return result;
  }
};

/**
 * Optimized data fetcher with caching and deduplication
 */
export const fetchGridData = async (url, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = 10000,
    retries = 1,
    cacheTimeout = 5000 // 5 seconds cache
  } = options;

  const cacheKey = `${method}-${url}-${JSON.stringify(body)}`;
  
  // Check cache first
  if (dataCache.has(cacheKey)) {
    const cached = dataCache.get(cacheKey);
    if (Date.now() - cached.timestamp < cacheTimeout) {
      return cached.data;
    } else {
      dataCache.delete(cacheKey);
    }
  }

  const fetchWithTimeout = async (fetchUrl, fetchOptions, timeoutMs) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(fetchUrl, {
        ...fetchOptions,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : null
      }, timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache successful response
      dataCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;

    } catch (error) {
      lastError = error;
      
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  // Log error only once per unique error
  const errorKey = `fetch-error-${url}-${lastError.message}`;
  if (!errorLogCache.has(errorKey)) {
    console.error(`GridDataHandler: Failed to fetch data from ${url}:`, lastError);
    errorLogCache.add(errorKey);
  }

  throw lastError;
};

/**
 * Optimized grid data handlers for specific data types
 */
export const gridDataHandlers = {
  // MDM Products handler
  mdmProducts: (data) => {
    const cacheKey = `mdm-products-${Array.isArray(data) ? data.length : 0}`;
    
    if (validationCache.has(cacheKey)) {
      return validationCache.get(cacheKey);
    }

    const result = validateGridData(data, {
      expectedType: 'array',
      allowEmpty: true,
      requiredFields: ['Code_MDM', 'Designation'],
      transformers: {
        QteStock: (value) => parseFloat(value) || 0,
        Tarif: (value) => parseFloat(value) || 0,
        Changed: (value) => Boolean(value)
      }
    });

    validationCache.set(cacheKey, result);
    return result;
  },

  // Magento Products handler
  magentoProducts: (data) => {
    const cacheKey = `magento-products-${Array.isArray(data) ? data.length : 0}`;
    
    if (validationCache.has(cacheKey)) {
      return validationCache.get(cacheKey);
    }

    const result = validateGridData(data, {
      expectedType: 'array',
      allowEmpty: true,
      requiredFields: ['sku', 'name'],
      transformers: {
        price: (value) => parseFloat(value) || 0,
        status: (value) => parseInt(value) || 0,
        qty: (value) => parseInt(value) || 0
      }
    });

    validationCache.set(cacheKey, result);
    return result;
  },

  // Generic handler for other data types
  generic: (data, options = {}) => {
    return validateGridData(data, options);
  }
};

/**
 * Clear caches (useful for testing or memory management)
 */
export const clearCaches = () => {
  dataCache.clear();
  validationCache.clear();
  errorLogCache.clear();
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return {
    dataCache: dataCache.size,
    validationCache: validationCache.size,
    errorLogCache: errorLogCache.size
  };
};

export default {
  validateGridData,
  fetchGridData,
  gridDataHandlers,
  clearCaches,
  getCacheStats
};
