/**
 * Generic Data Handling Functions for All Grids
 * Provides standardized data fetching, validation, and transformation utilities
 */

import { toast } from 'react-toastify';

/**
 * Generic data validator
 * @param {any} data - Data to validate
 * @param {Object} options - Validation options
 * @returns {Object} - Validated data with metadata
 */
export const validateGridData = (data, options = {}) => {
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
      console.warn('GridDataHandler: Expected array but got:', typeof data);
      return {
        isValid: false,
        data: allowEmpty ? [] : fallbackValue,
        errors: ['Data is not an array'],
        metadata: { originalType: typeof data, expectedType }
      };
    }

    if (expectedType === 'object' && (typeof data !== 'object' || Array.isArray(data))) {
      console.warn('GridDataHandler: Expected object but got:', typeof data);
      return {
        isValid: false,
        data: fallbackValue || {},
        errors: ['Data is not an object'],
        metadata: { originalType: typeof data, expectedType }
      };
    }

    // Empty data validation
    if (!allowEmpty && (!data || (Array.isArray(data) && data.length === 0))) {
      return {
        isValid: false,
        data: fallbackValue,
        errors: ['Data is empty but empty data is not allowed'],
        metadata: { isEmpty: true }
      };
    }

    // Field validation for arrays of objects
    if (Array.isArray(data) && requiredFields.length > 0) {
      const missingFields = [];
      data.forEach((item, index) => {
        requiredFields.forEach(field => {
          if (!(field in item)) {
            missingFields.push(`Item ${index} missing field: ${field}`);
          }
        });
      });

      if (missingFields.length > 0) {
        console.warn('GridDataHandler: Missing required fields:', missingFields);
        return {
          isValid: false,
          data: data,
          errors: missingFields,
          metadata: { hasFieldErrors: true }
        };
      }
    }

    // Apply transformers
    let transformedData = data;
    if (Array.isArray(data) && Object.keys(transformers).length > 0) {
      transformedData = data.map(item => {
        const transformed = { ...item };
        Object.entries(transformers).forEach(([field, transformer]) => {
          if (field in transformed) {
            try {
              transformed[field] = transformer(transformed[field], transformed);
            } catch (error) {
              console.warn(`GridDataHandler: Transformer error for field ${field}:`, error);
            }
          }
        });
        return transformed;
      });
    }

    return {
      isValid: true,
      data: transformedData,
      errors: [],
      metadata: { 
        count: Array.isArray(transformedData) ? transformedData.length : 1,
        hasTransformers: Object.keys(transformers).length > 0
      }
    };

  } catch (error) {
    console.error('GridDataHandler: Validation error:', error);
    return {
      isValid: false,
      data: fallbackValue,
      errors: [error.message],
      metadata: { hasException: true }
    };
  }
};

/**
 * Generic data fetcher with error handling
 * @param {Function} fetchFunction - Function that returns a promise with data
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Standardized response
 */
export const fetchGridData = async (fetchFunction, options = {}) => {
  const {
    showLoading = true,
    showErrors = true,
    retryCount = 0,
    timeout = 30000,
    validateResponse = true,
    validationOptions = {},
    onSuccess,
    onError,
    transformResponse
  } = options;

  let attempt = 0;
  const maxAttempts = retryCount + 1;

  while (attempt < maxAttempts) {
    try {
      if (showLoading && attempt === 0) {
        toast.info('Loading data...', { autoClose: 2000 });
      }

      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Race between fetch and timeout
      const response = await Promise.race([
        fetchFunction(),
        timeoutPromise
      ]);

      // Transform response if transformer provided
      let processedResponse = response;
      if (transformResponse && typeof transformResponse === 'function') {
        processedResponse = transformResponse(response);
      }

      // Validate response if enabled
      let validationResult = { isValid: true, data: processedResponse, errors: [] };
      if (validateResponse) {
        validationResult = validateGridData(processedResponse, validationOptions);
      } else {
        // Basic validation - ensure we have some data structure
        if (processedResponse === null || processedResponse === undefined) {
          validationResult = {
            isValid: false,
            data: [],
            errors: ['Response is null or undefined'],
            metadata: { isEmpty: true }
          };
        } else {
          validationResult = {
            isValid: true,
            data: processedResponse,
            errors: [],
            metadata: {
              count: Array.isArray(processedResponse) ? processedResponse.length : 1,
              type: Array.isArray(processedResponse) ? 'array' : typeof processedResponse
            }
          };
        }
      }

      if (showLoading) {
        toast.dismiss();
      }

      if (validationResult.isValid) {
        if (onSuccess) {
          onSuccess(validationResult.data, validationResult.metadata);
        }
        
        return {
          success: true,
          data: validationResult.data,
          metadata: validationResult.metadata,
          errors: [],
          attempt: attempt + 1
        };
      } else {
        throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
      }

    } catch (error) {
      attempt++;
      console.error(`GridDataHandler: Fetch attempt ${attempt} failed:`, error);

      if (attempt >= maxAttempts) {
        if (showLoading) {
          toast.dismiss();
        }

        if (showErrors) {
          const errorMessage = error.message || 'Failed to fetch data';
          toast.error(`Error: ${errorMessage}`);
        }

        if (onError) {
          onError(error, attempt);
        }

        return {
          success: false,
          data: null,
          metadata: {},
          errors: [error.message],
          attempt
        };
      } else {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
};

/**
 * Common data transformers
 */
export const dataTransformers = {
  // Ensure numeric values
  toNumber: (value, fallback = 0) => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  },

  // Ensure string values
  toString: (value, fallback = '') => {
    return value != null ? String(value) : fallback;
  },

  // Format dates
  toDate: (value, fallback = null) => {
    if (!value) return fallback;
    const date = new Date(value);
    return isNaN(date.getTime()) ? fallback : date;
  },

  // Format currency
  toCurrency: (value, currency = 'DZD', locale = 'fr-DZ') => {
    const num = Number(value);
    if (isNaN(num)) return '0.00 ' + currency;
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency 
    }).format(num);
  },

  // Boolean conversion
  toBoolean: (value, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return fallback;
  },

  // Trim and clean strings
  cleanString: (value, fallback = '') => {
    if (typeof value !== 'string') return fallback;
    return value.trim().replace(/\s+/g, ' ');
  }
};

/**
 * Grid-specific data handlers
 */
export const gridDataHandlers = {
  // MDM Products specific handler
  mdmProducts: (data) => {
    return validateGridData(data, {
      expectedType: 'array',
      allowEmpty: true,
      requiredFields: ['Code_MDM'],
      transformers: {
        QteStock: (value) => dataTransformers.toNumber(value, 0),
        Tarif: (value) => dataTransformers.toNumber(value, 0),
        changed: (value) => dataTransformers.toBoolean(value, false),
        Code_MDM: (value) => dataTransformers.toString(value),
        TypeProd: (value) => dataTransformers.cleanString(value),
        Source: (value) => dataTransformers.cleanString(value)
      }
    });
  },

  // Magento Products specific handler
  magentoProducts: (data) => {
    return validateGridData(data, {
      expectedType: 'array',
      allowEmpty: true,
      requiredFields: ['entity_id', 'sku'],
      transformers: {
        entity_id: (value) => dataTransformers.toNumber(value),
        price: (value) => dataTransformers.toNumber(value, 0),
        qty: (value) => dataTransformers.toNumber(value, 0),
        status: (value) => dataTransformers.toNumber(value, 1),
        visibility: (value) => dataTransformers.toNumber(value, 1),
        sku: (value) => dataTransformers.toString(value),
        name: (value) => dataTransformers.cleanString(value),
        created_at: (value) => dataTransformers.toDate(value),
        updated_at: (value) => dataTransformers.toDate(value)
      }
    });
  },

  // Generic handler for other grids
  generic: (data, customTransformers = {}) => {
    return validateGridData(data, {
      expectedType: 'array',
      allowEmpty: true,
      transformers: customTransformers
    });
  }
};

/**
 * Export default handler factory
 */
export default {
  validateGridData,
  fetchGridData,
  dataTransformers,
  gridDataHandlers
};
