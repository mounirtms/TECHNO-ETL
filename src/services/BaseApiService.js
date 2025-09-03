/**
 * Base API Service - Foundation for all API services
 * Implements DRY principles, caching, parameter handling, and error management
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */
import { toast } from 'react-toastify';
import { getUnifiedSettings, saveUnifiedSettings } from '../utils/unifiedSettingsManager';

export class BaseApiService {
  constructor(config = {}) {
    this.config = {
      cacheEnabled: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      maxCacheSize: 100,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config,
    };

    this.state = {
      cache: new Map(),
      metrics: this._createMetrics(),
      settings: this._loadSettings(),
    };

    this._setupCacheCleanup();
  }

  // ===== CORE INITIALIZATION METHODS =====
  _createMetrics() {
    return {
      total: 0,
      cache: 0,
      success: 0,
      errors: 0,
      lastError: null,
      avgResponseTime: 0,
    };
  }

  _loadSettings() {
    try {
      // Use unified settings manager
      const settings = getUnifiedSettings();

      return settings.apiSettings || {};
    } catch (error) {
      console.warn('Failed to load API settings:', error.message);

      return {};
    }
  }

  _setupCacheCleanup() {
    if (this.config.cacheEnabled) {
      setInterval(() => this._cleanExpiredCache(), this.config.cacheDuration);
    }
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    try {
      // Use unified settings manager
      saveUnifiedSettings({ apiSettings: this.state.settings });
    } catch (error) {
      console.warn('Failed to save API settings:', error.message);
    }
  }

  // ===== PARAMETER HANDLING AND VALIDATION =====

  /**
   * Smart parameter validation and flattening
   * Handles Magento search criteria and prevents template variable issues
   */
  validateAndFlattenParams(params = {}) {
    const flattened = {};

    // Handle search criteria structure
    if (params.searchCriteria) {
      return this._buildSearchCriteriaParams(params.searchCriteria, params.fieldName);
    }

    // Handle nested params object
    if (params.params) {
      Object.assign(flattened, this._flattenObject(params.params));
    } else {
      Object.assign(flattened, this._flattenObject(params));
    }

    // Validate and clean template variables
    return this._validateParameterValues(flattened, params.fieldName);
  }

  _buildSearchCriteriaParams(criteria, fieldName) {
    const params = {};

    // Handle pagination
    if (criteria.pageSize) params['searchCriteria[pageSize]'] = criteria.pageSize;
    if (criteria.currentPage) params['searchCriteria[currentPage]'] = criteria.currentPage;

    // Handle sorting with validation
    if (criteria.sortOrders?.length) {
      criteria.sortOrders.forEach((sort, index) => {
        if (sort.field && this._isValidFieldName(sort.field)) {
          params[`searchCriteria[sortOrders][${index}][field]`] = sort.field;
          params[`searchCriteria[sortOrders][${index}][direction]`] = sort.direction || 'ASC';
        }
      });
    }

    // Handle filters with comprehensive validation
    if (criteria.filterGroups?.length) {
      criteria.filterGroups.forEach((group, groupIndex) => {
        if (group.filters?.length) {
          group.filters.forEach((filter, filterIndex) => {
            if (filter.field && this._isValidFieldName(filter.field)) {
              params[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][field]`] = filter.field;
              params[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][value]`] = filter.value;
              params[`searchCriteria[filterGroups][${groupIndex}][filters][${filterIndex}][conditionType]`] = filter.conditionType || 'eq';
            }
          });
        }
      });
    }

    // Add fieldName if provided and valid
    if (fieldName && this._isValidFieldName(fieldName)) {
      params.fieldName = fieldName;
    }

    return params;
  }

  _flattenObject(obj, prefix = '') {
    const flattened = {};

    if (!obj || typeof obj !== 'object') return flattened;

    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}[${key}]` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this._flattenObject(value, newKey));
      } else if (value !== undefined && value !== null) {
        flattened[newKey] = value;
      }
    });

    return flattened;
  }

  _validateParameterValues(params, defaultFieldName = 'name') {
    const validated = {};

    Object.keys(params).forEach(key => {
      const value = params[key];

      // Skip invalid template variables
      if (typeof value === 'string' && this._containsTemplateVariable(value)) {
        console.warn(`⚠️ Invalid template variable detected: ${key}=${value}`);

        // If it's a fieldName parameter, use default
        if (key === 'fieldName' || key.includes('field')) {
          validated[key] = defaultFieldName;
        }

        return;
      }

      validated[key] = value;
    });

    // Ensure fieldName exists for Magento API calls
    if (!validated.fieldName && !validated['searchCriteria[pageSize]']) {
      validated.fieldName = defaultFieldName;
    }

    return validated;
  }

  _isValidFieldName(fieldName) {
    return fieldName &&
           typeof fieldName === 'string' &&
           !this._containsTemplateVariable(fieldName) &&
           fieldName.trim().length > 0;
  }

  _containsTemplateVariable(value) {
    return value.includes('%fieldName') ||
           value.includes('${') ||
           value.includes('%{') ||
           value.includes('fieldName') && value.includes('%');
  }

  // ===== CACHE MANAGEMENT =====

  _getCacheKey(method, endpoint, params) {
    const paramStr = params ? JSON.stringify(params, Object.keys(params).sort()) : '';

    return `${method.toLowerCase()}_${endpoint}_${btoa(paramStr).substring(0, 50)}`;
  }

  _getCachedResponse(cacheKey) {
    if (!this.config.cacheEnabled) return null;

    const cached = this.state.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
      this.state.metrics.cache++;

      return cached.data;
    }

    return null;
  }

  _setCachedResponse(cacheKey, data) {
    if (!this.config.cacheEnabled) return;

    this.state.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });

    // Clean cache if too large
    if (this.state.cache.size > this.config.maxCacheSize) {
      this._cleanExpiredCache();
    }
  }

  _cleanExpiredCache() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.state.cache.entries()) {
      if (now - value.timestamp > this.config.cacheDuration) {
        this.state.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🗑️ Cleaned ${cleaned} expired cache entries`);
    }
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.state.cache.keys()) {
        if (key.includes(pattern)) {
          this.state.cache.delete(key);
        }
      }
    } else {
      this.state.cache.clear();
    }
    console.log(`🗑️ Cache cleared${pattern ? ` for pattern: ${pattern}` : ''}`);
  }

  // ===== ERROR HANDLING =====

  _handleError(error, method, endpoint) {
    const errorMessage = this._getErrorMessage(error);

    // Only show user-facing errors for non-404 status codes
    if (error.response?.status !== 404) {
      if (error.response?.status >= 500) {
        toast.error(`Server Error: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        toast.error('Authentication failed. Please check your credentials.');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Please check your permissions.');
      } else {
        toast.error(`API Error: ${errorMessage}`);
      }
    }

    // Always log for debugging
    console.error(`API Error [${method} ${endpoint}]:`, {
      status: error.response?.status,
      message: errorMessage,
      url: error.config?.url,
    });
  }

  _getErrorMessage(error) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }

    return 'Unknown error occurred';
  }

  _isRetryableError(error) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];

    return error.response?.status && retryableStatuses.includes(error.response.status);
  }

  // ===== RETRY LOGIC =====

  async _retryRequest(requestFn, attempts = 0, context = {}) {
    try {
      const startTime = Date.now();
      const result = await requestFn();

      // Update metrics
      this.state.metrics.success++;
      this.state.metrics.avgResponseTime =
        (this.state.metrics.avgResponseTime + (Date.now() - startTime)) / 2;

      return result;
    } catch (error) {
      if (attempts < this.config.retryAttempts && this._isRetryableError(error)) {
        const delay = this.config.retryDelay * Math.pow(2, attempts);

        console.log(`🔄 Retry ${attempts + 1}/${this.config.retryAttempts} in ${delay}ms`);

        await new Promise(resolve => setTimeout(resolve, delay));

        return this._retryRequest(requestFn, attempts + 1, context);
      }

      this._handleError(error, context);
      throw error;
    }
  }

  // ===== RESPONSE FORMATTING =====

  formatResponse(response, options = {}) {
    if (!response) {
      return {
        items: [],
        total_count: 0,
        search_criteria: {},
      };
    }

    // Handle different response structures
    const data = response.data || response;

    return {
      items: data.items || data || [],
      total_count: data.total_count || data.totalCount || (Array.isArray(data) ? data.length : 0),
      search_criteria: data.search_criteria || data.searchCriteria || {},
      ...options.additionalFields,
    };
  }

  // ===== UTILITY METHODS =====

  getMetrics() {
    return {
      ...this.state.metrics,
      cacheSize: this.state.cache.size,
      cacheHitRate: this.state.metrics.total > 0
        ? (this.state.metrics.cache / this.state.metrics.total * 100).toFixed(2) + '%'
        : '0%',
    };
  }

  resetMetrics() {
    this.state.metrics = this._createMetrics();
    console.log('📈 Metrics reset');
  }

  getSettings() {
    return { ...this.state.settings };
  }

  // Abstract method to be implemented by child classes
  async request(method, endpoint, data, config) {
    throw new Error('request method must be implemented by child class');
  }

  // Standard HTTP methods - to be used by child classes
  async get(endpoint, params = {}) {
    this.state.metrics.total++;

    const validatedParams = this.validateAndFlattenParams(params);
    const cacheKey = this._getCacheKey('get', endpoint, validatedParams);

    // Check cache first
    const cached = this._getCachedResponse(cacheKey);

    if (cached) {
      console.log('📦 Cache hit:', endpoint);

      return cached;
    }

    const response = await this.request('get', endpoint, null, { params: validatedParams });

    // Cache successful responses
    this._setCachedResponse(cacheKey, response);

    return response;
  }

  async post(endpoint, data = {}, config = {}) {
    this.state.metrics.total++;

    return this.request('post', endpoint, data, config);
  }

  async put(endpoint, data = {}, config = {}) {
    this.state.metrics.total++;

    return this.request('put', endpoint, data, config);
  }

  async delete(endpoint, config = {}) {
    this.state.metrics.total++;

    return this.request('delete', endpoint, null, config);
  }
}

export default BaseApiService;

