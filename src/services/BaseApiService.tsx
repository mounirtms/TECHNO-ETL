import React from 'react';
/**
 * Base API Service - Foundation for all API services
 * Implements DRY principles, caching, parameter handling, and error management
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 */
import { toast } from 'react-toastify';

// Type definitions for BaseApiService
interface ApiConfig {
  cacheEnabled?: boolean;
  cacheDuration?: number;
  maxCacheSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

interface ApiMetrics {
  total: number;
  cache: number;
  success: number;
  errors: number;
  lastError: string | null;
  avgResponseTime: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  hits: number;
}

interface ApiState {
  cache: Map<string, CacheEntry>;
  metrics: ApiMetrics;
  settings: Record<string, any>;
}

interface SearchCriteria {
  pageSize?: number;
  currentPage?: number;
  sortOrders?: Array<{
    field: string;
    direction?: 'ASC' | 'DESC';
  }>;
  filterGroups?: Array<{
    filters: Array<{
      field: string;
      value: any;
      conditionType?: string;
    }>;
  }>;
}

interface ApiParams {
  searchCriteria?: SearchCriteria;
  params?: Record<string, any>;
  fieldName?: string;
  [key: string]: any;
}

interface ApiResponse {
  data?: any;
  items?: any[];
  total_count?: number;
  totalCount?: number;
  search_criteria?: any;
  searchCriteria?: any;
}

interface FormattedResponse {
  items: any[];
  total_count: number;
  search_criteria: any;
  [key: string]: any;
}

interface ApiError extends Error {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  config?: {
    url?: string;
  };
}

export class BaseApiService {
  protected config: Required<ApiConfig>;
  protected state: ApiState;

  constructor(config: ApiConfig = {}) {
    this.config = {
      cacheEnabled: true,
      cacheDuration: 10 * 60 * 1000, // 10 minutes for better caching
      maxCacheSize: 150,
      retryAttempts: 2, // Reduced retry attempts for faster failure
      retryDelay: 500, // Faster retry delay
      timeout: 15000, // Reduced from 30 seconds to 15 seconds
      ...config
    };

    this.state = {
      cache: new Map(),
      metrics: this._createMetrics(),
      settings: this._loadSettings()
    };

    this._setupCacheCleanup();
  }

  // ===== CORE INITIALIZATION METHODS =====
  private _createMetrics(): ApiMetrics {
    return {
      total: 0,
      cache: 0,
      success: 0,
      errors: 0,
      lastError: null,
      avgResponseTime: 0
    };
  }

  private _loadSettings(): Record<string, any> {
    try {
      const stored = localStorage.getItem('userApiSettings');
      return stored ? JSON.parse(stored) : {};
    } catch(error: any) {
      console.warn('Failed to load API settings:', error.message);
      return {};
    }
  }

  private _setupCacheCleanup(): void {
    if(this.config.cacheEnabled) {
      setInterval(() => this._cleanExpiredCache(), this.config.cacheDuration);
    }
  }

  updateSettings(newSettings: Record<string, any>): void {
    this.state.settings = { ...this.state.settings, ...newSettings };
    try {
      localStorage.setItem('userApiSettings', JSON.stringify(this.state.settings));
    } catch(error: any) {
      console.warn('Failed to save API settings:', error.message);
    }
  }

  // ===== PARAMETER HANDLING AND VALIDATION =====
  
  /**
   * Smart parameter validation and flattening
   * Handles Magento search criteria and prevents template variable issues
   */
  validateAndFlattenParams(params: ApiParams = {}): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    // Handle search criteria structure
    if(params.searchCriteria) {
      return this._buildSearchCriteriaParams(params.searchCriteria, params?.fieldName);
    }
    
    // Handle nested params object
    if(params.params) {
      Object.assign(flattened, this._flattenObject(params.params));
    } else {
      Object.assign(flattened, this._flattenObject(params));
    }
    
    // Validate and clean template variables
    return this._validateParameterValues(flattened, params?.fieldName);
  }

  private _buildSearchCriteriaParams(criteria: SearchCriteria, fieldName?: string): Record<string, any> {
    const params = {};
    
    // Handle pagination
    if (criteria.pageSize) params['searchCriteria[pageSize]'] = criteria.pageSize;
    if (criteria.currentPage) params['searchCriteria[currentPage]'] = criteria.currentPage;
    
    // Handle sorting with validation
    if(criteria.sortOrders?.length) {
      criteria.sortOrders.forEach((sort, index) => {
        if (sort.field && this._isValidFieldName(sort.field)) {
          params[`searchCriteria[sortOrders][${index}][field]`] = sort.field;
          params[`searchCriteria[sortOrders][${index}][direction]`] = sort.direction || 'ASC';
        }
      });
    }
    
    // Handle filters with comprehensive validation
    if(criteria.filterGroups?.length) {
      criteria.filterGroups.forEach((group, groupIndex) => {
        if(group.filters?.length) {
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

  private _flattenObject(obj, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    if (!obj || typeof obj !== 'object') return flattened;
    
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}[${key}]` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this._flattenObject(value, newKey));
      } else if(value !== undefined && value !== null) {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  }

  private _validateParameterValues(params: Record<string, any>, defaultFieldName = 'name'): Record<string, any> {
    const validated: Record<string, any> = {};
    
    Object.keys(params).forEach((key) => {
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
    if(!validated?.fieldName && !validated['searchCriteria[pageSize]']) {
      validated.fieldName = defaultFieldName;
    }
    
    return validated;
  }

  private _isValidFieldName(fieldName: string): boolean {
    return Boolean((fieldName && 
           typeof fieldName === 'string' && 
           !this._containsTemplateVariable(fieldName) &&
           fieldName.trim().length > 0))));
  }

  private _containsTemplateVariable(value: string): boolean {
    return value.includes('%fieldName') || 
           value.includes('${') || 
           value.includes('%{') ||
           value.includes('fieldName') && value.includes('%');
  }

  // ===== CACHE MANAGEMENT =====
  
  private _getCacheKey(method: string, endpoint: string, params?: Record<string, any>): string {
    const paramStr = params ? JSON.stringify(params, Object.keys(params).sort()) : '';
    return `${method.toLowerCase()}_${endpoint}_${btoa(paramStr).substring(0, 50)}`;
  }

  private _getCachedResponse(cacheKey: string): any {
    if (!this.config.cacheEnabled) return null;
    
    const cached = this.state.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheDuration) {
      this.state.metrics.cache++;
      return cached.data;
    }
    return null;
  }

  private _setCachedResponse(cacheKey: string, data): void {
    if (!this.config.cacheEnabled) return;
    
    this.state.cache.set(cacheKey, { 
      data, 
      timestamp: Date.now(),
      hits: 0
    });
    
    // Clean cache if too large
    if(this.state.cache.size > this.config.maxCacheSize) {
      this._cleanExpiredCache();
    }
  }

  private _cleanExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.state.cache.entries()) {
      if(now - value.timestamp > this.config.cacheDuration) {
        this.state.cache.delete(key);
        cleaned++;
      }
    }
    
    if(cleaned > 0) {
      console.log(`🗑️ Cleaned ${cleaned} expired cache entries`);
    }
  }

  clearCache(pattern: string | null = null): void {
    if(pattern) {
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
  
  private _handleError(error: ApiError, method?: string, endpoint?: string): void {
    const errorMessage = this._getErrorMessage(error);
    
    // Only show user-facing errors for non-404 status codes
    if(error.response?.status !== 404) {
        if(error.response?.status >= 500) {
            toast.error(`Server Error: ${errorMessage}`);
        } else if(error.response?.status ===401) {
            toast.error('Authentication failed. Please check your credentials.');
        } else if(error.response?.status ===403) {
            toast.error('Access denied. Please check your permissions.');
        } else {
            toast.error(`API Error: ${errorMessage}`);
        }
    }
    
    // Always log for debugging
    console.error(`API Error [${method} ${endpoint}]:`, {
        status: error.response?.status,
        message: errorMessage,
        url: error.config?.url
    });
  }
  
  private _getErrorMessage(error: ApiError): string {
    if(error.response?.data?.message) {
      return error.response.data.message;
    }
    if(error.response?.data?.error) {
      return error.response.data.error;
    }
    if(error.message) {
      return error.message;
    }
    return 'Unknown error occurred';
  }

  private _isRetryableError(error: ApiError): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return error.response?.status && retryableStatuses.includes(error.response.status);
  }

  // ===== RETRY LOGIC =====
  
  async _retryRequest(requestFn: () => Promise, attempts = 0, context = {}): Promise {
    try {
      const startTime = Date.now();
      const result = await requestFn();
      
      // Update metrics
      this.state.metrics.success++;
      this.state.metrics.avgResponseTime = (this.state.metrics.avgResponseTime + (Date.now() - startTime)) / 2;
      
      return result;
    } catch(error: any) {
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
  
  formatResponse(response: ApiResponse | null, options: { additionalFields?: Record<string, any> } = {}): FormattedResponse {
    if(!response) {
      return {
        items: [],
        total_count: 0,
        search_criteria: {}
      };
    }

    // Handle different response structures
    const data = response.data || response;
    
    return {
      items: data.items || data || [],
      total_count: data.total_count || data.totalCount || (Array.isArray(data) ? data.length : 0),
      search_criteria: data.search_criteria || data.searchCriteria || {},
      ...options.additionalFields
    };
  }

  // ===== UTILITY METHODS =====
  
  getMetrics(): ApiMetrics & { cacheSize: number; cacheHitRate: string } {
    return { ...this.state.metrics,
      cacheSize: this.state.cache.size,
      cacheHitRate: this.state.metrics.total > 0 
        ? (this.state.metrics.cache / this.state.metrics.total * 100).toFixed(2) + '%' 
        : '0%'
    };
  }

  resetMetrics(): void {
    this.state.metrics = this._createMetrics();
    console.log('📈 Metrics reset');
  }

  getSettings(): Record<string, any> {
    return { ...this.state.settings };
  }

  // Abstract method to be implemented by child classes
  async request(method: string, endpoint: string, data?: any, config? ): Promise {
    throw new Error('request method must be implemented by child class');
  }

  // Standard HTTP methods - to be used by child classes
  async get(endpoint: string, params: ApiParams = {}): Promise {
    this.state.metrics.total++;
    
    const validatedParams = this.validateAndFlattenParams(params);
    const cacheKey = this._getCacheKey('get', endpoint, validatedParams);
    
    // Check cache first
    const cached = this._getCachedResponse(cacheKey);
    if(cached) {
      console.log('📦 Cache hit:', endpoint);
      return cached;
    }
    
    const response = await this.request('get', endpoint, null, { params: validatedParams });
    
    // Cache successful responses
    this._setCachedResponse(cacheKey, response);
    return response;
  }

  async post(endpoint: string, data: any = {}, config = {}): Promise {
    this.state.metrics.total++;
    return this.request('post', endpoint, data, config);
  }

  async put(endpoint: string, data: any = {}, config = {}): Promise {
    this.state.metrics.total++;
    return this.request('put', endpoint, data, config);
  }

  async delete(endpoint: string, config: any = {}): Promise {
    this.state.metrics.total++;
    return this.request('delete', endpoint, null, config);
  }
}

export default BaseApiService;

