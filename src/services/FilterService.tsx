import React from 'react';
/**
 * FilterService - Unified filtering service for product grids
 * Provides caching, debouncing, and Magento 2 integration
 */

import { debounce } from 'lodash';
import magentoApi from './magentoApi';

class FilterService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    // Debounced functions
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300);
    this.debouncedFilter = debounce(this.performFilter.bind(this), 150);
  }

  // ===== CACHE MANAGEMENT =====
  
  setCacheData(key, data) {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
    console.log(`📦 Cached data for key: ${key}`);
  }

  getCacheData(key: any) {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      console.log(`✅ Using cached data for key: ${key}`);
      return this.cache.get(key);
    }
    
    // Clean expired cache
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  clearCache(pattern = null) {
    if(pattern) {
      // Clear specific pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          this.cacheExpiry.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
      this.cacheExpiry.clear();
    }
    console.log(`🗑️ Cache cleared${pattern ? ` for pattern: ${pattern}` : ''}`);
  }

  // ===== FILTER OPTIONS FETCHING =====

  async getBrands(useCache = true) {
    const cacheKey = 'filter_brands';
    
    if(useCache) {
      const cached = this.getCacheData(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await magentoApi.getBrands();
      const brands = response?.items || [];
      
      const processedBrands = brands.map((brand: any: any: any: any) => ({
        value: brand.value,
        label: brand.label,
        count: brand.product_count || 0
      })).sort((a, b) => a.label.localeCompare(b.label));

      this.setCacheData(cacheKey, processedBrands);
      return processedBrands;
    } catch(error: any) {
      console.error('❌ Error fetching brands:', error);
      return this.getMockBrands();
    }
  }

  async getCategories(useCache = true) {
    const cacheKey = 'filter_categories';
    
    if(useCache) {
      const cached = this.getCacheData(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await magentoApi.getCategories();
      const categories = response?.data?.items || response?.items || [];
      
      const processedCategories = this.flattenCategories(categories);
      this.setCacheData(cacheKey, processedCategories);
      return processedCategories;
    } catch(error: any) {
      console.error('❌ Error fetching categories:', error);
      return this.getMockCategories();
    }
  }

  async getAttributeOptions(attributeCode, useCache: any = true ) {
    const cacheKey = `filter_attribute_${attributeCode}`;
    
    if(useCache) {
      const cached = this.getCacheData(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await magentoApi.getProductAttribute(attributeCode);
      const options = response?.options || [];
      
      const processedOptions = options.map((option: any: any: any: any) => ({
        value: option.value,
        label: option.label,
        count: option.product_count || 0
      })).sort((a, b) => a.label.localeCompare(b.label));

      this.setCacheData(cacheKey, processedOptions);
      return processedOptions;
    } catch(error: any) {
      console.error(`❌ Error fetching attribute options for ${attributeCode}:`, error);
      return [];
    }
  }

  // ===== FILTER PROCESSING =====

  buildMagentoSearchCriteria(filters) {
    const searchCriteria = {
      filterGroups: [],
      pageSize: filters.pageSize || 25,
      currentPage: filters.page || 1,
      sortOrders: []
    };

    // Brand filter
    if(filters.brand) {
      searchCriteria.filterGroups.push({
        filters: [{
          field: 'mgs_brand',
          value: filters.brand,
          condition_type: 'eq'
        }]
      });
    }

    // Category filter
    if(filters.category) {
      searchCriteria.filterGroups.push({
        filters: [{
          field: 'category_id',
          value: filters.category,
          condition_type: 'eq'
        }]
      });
    }

    // Status filter
    if(filters.status !== undefined && filters.status !== '') {
      searchCriteria.filterGroups.push({
        filters: [{
          field: 'status',
          value: filters.status,
          condition_type: 'eq'
        }]
      });
    }

    // Price range filter
    if(filters.priceMin || filters.priceMax) {
      const priceFilters = [];
      if(filters.priceMin) {
        priceFilters.push({
          field: 'price',
          value: filters.priceMin,
          condition_type: 'gteq'
        });
      }
      if(filters.priceMax) {
        priceFilters.push({
          field: 'price',
          value: filters.priceMax,
          condition_type: 'lteq'
        });
      }
      searchCriteria.filterGroups.push({ filters: priceFilters });
    }

    // Text search
    if(filters.search) {
      searchCriteria.filterGroups.push({
        filters: [{
          field: 'name',
          value: `%${filters.search}%`,
          condition_type: 'like'
        }]
      });
    }

    // Sorting
    if(filters.sortField) {
      searchCriteria.sortOrders.push({
        field: filters.sortField,
        direction: filters.sortDirection || 'ASC'
      });
    }

    return searchCriteria;
  }

  performSearch(searchTerm, callback: any) {
    console.log('🔍 Performing search:', searchTerm);
    callback(searchTerm);
  }

  performFilter(filters, callback: any) {
    console.log('🔄 Performing filter:', filters);
    callback(filters);
  }

  // ===== CLIENT-SIDE FILTERING =====

  applyClientFilters(products, filters) {
    return products.filter((product: any: any: any: any) => {
      // Brand filter
      if(filters.brand && product.brand !== filters.brand) {
        return false;
      }

      // Category filter
      if(filters.category) {
        const productCategories = product.categories || [];
        if (!productCategories.some(cat => cat.id.toString() ===filters.category.toString())) {
          return false;
        }
      }

      // Status filter
      if (filters.status !== undefined && filters.status !== '' && 
          product.status.toString() !== filters.status.toString()) {
        return false;
      }

      // Price range filter
      if (filters.priceMin && product.price < parseFloat(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && product.price > parseFloat(filters.priceMax)) {
        return false;
      }

      // Text search
      if(filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchFields = [
          product.name,
          product.sku,
          product.description,
          product.brand
        ].filter(Boolean);
        
        if (!searchFields.some(field => 
          field.toLowerCase().includes(searchLower)
        )) {
          return false;
        }
      }

      return true;
    });
  }

  // ===== UTILITY METHODS =====

  flattenCategories(categories, level = 0, result = [] ) {
    categories.forEach((category) => {
      result.push({
        value: category.id,
        label: category.name,
        level: level,
        count: category.product_count || 0
      });

      if(category.children_data && category.children_data.length > 0) {
        this.flattenCategories(category.children_data, level + 1, result);
      }
    });

    return result;
  }

  getMockBrands() {
    return [
      { value: 'nike', label: 'Nike', count: 25 },
      { value: 'adidas', label: 'Adidas', count: 18 },
      { value: 'puma', label: 'Puma', count: 12 },
      { value: 'under_armour', label: 'Under Armour', count: 8 },
      { value: 'reebok', label: 'Reebok', count: 15 }
    ];
  }

  getMockCategories() {
    return [
      { value: '1', label: 'Electronics', level: 0, count: 45 },
      { value: '2', label: 'Smartphones', level: 1, count: 20 },
      { value: '3', label: 'Laptops', level: 1, count: 15 },
      { value: '4', label: 'Clothing', level: 0, count: 35 },
      { value: '5', label: 'Men\'s Clothing', level: 1, count: 18 },
      { value: '6', label: 'Women\'s Clothing', level: 1, count: 17 }
    ];
  }

  // ===== FILTER PRESETS =====

  getFilterPresets() {
    return [
      {
        id: 'active_products',
        name: 'Active Products',
        filters: { status: '1' }
      },
      {
        id: 'inactive_products',
        name: 'Inactive Products',
        filters: { status: '0' }
      },
      {
        id: 'nike_products',
        name: 'Nike Products',
        filters: { brand: 'nike' }
      },
      {
        id: 'electronics',
        name: 'Electronics',
        filters: { category: '1' }
      },
      {
        id: 'high_value',
        name: 'High Value (>$100)',
        filters: { priceMin: '100' }
      }
    ];
  }
}

// Export singleton instance
export default new FilterService();
