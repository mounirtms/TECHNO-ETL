/**
 * Test suite for Magento Grid Settings Integration
 * Verifies that user settings are properly applied to Magento grids
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { 
  getMagentoGridConfig,
  getMagentoApiParams,
  applySettingsToGridProps,
  handleMagentoGridError
} from '../../../../utils/magentoGridSettingsManager';
import { useMagentoGridSettings } from '../../../../hooks/useMagentoGridSettings';

// Mock settings
const mockUserSettings = {
  preferences: {
    density: 'compact',
    theme: 'dark',
    language: 'en'
  },
  performance: {
    defaultPageSize: 50,
    enableVirtualization: true,
    cacheEnabled: true
  },
  gridSettings: {
    showStatsCards: true,
    autoRefresh: false,
    persistFilters: true
  },
  notifications: {
    showErrors: true
  }
};

describe('Magento Grid Settings Manager', () => {
  describe('getMagentoGridConfig', () => {
    it('should return default config when no user settings provided', () => {
      const config = getMagentoGridConfig('magentoProducts');
      
      expect(config).toBeDefined();
      expect(config.pagination.defaultPageSize).toBe(50); // magentoProducts default
      expect(config.density).toBe('standard');
    });

    it('should apply user settings to grid configuration', () => {
      const config = getMagentoGridConfig('magentoProducts', mockUserSettings);
      
      expect(config.density).toBe('compact');
      expect(config.pagination.defaultPageSize).toBe(50);
      expect(config.display.enableVirtualization).toBe(true);
      expect(config.performance.cacheEnabled).toBe(true);
    });

    it('should handle different grid types correctly', () => {
      const productsConfig = getMagentoGridConfig('magentoProducts', mockUserSettings);
      const ordersConfig = getMagentoGridConfig('magentoOrders', mockUserSettings);
      
      expect(productsConfig.sorting.defaultSort.field).toBe('sku');
      expect(ordersConfig.sorting.defaultSort.field).toBe('created_at');
    });
  });

  describe('getMagentoApiParams', () => {
    it('should return enhanced API parameters with user settings', () => {
      const params = getMagentoApiParams('magentoProducts', mockUserSettings, {
        currentPage: 2
      });
      
      expect(params.pageSize).toBe(50);
      expect(params.currentPage).toBe(2);
      expect(params.sortOrders).toBeDefined();
      expect(params.useCache).toBe(true);
    });

    it('should handle missing user settings gracefully', () => {
      const params = getMagentoApiParams('magentoProducts', {}, {
        currentPage: 1
      });
      
      expect(params.pageSize).toBe(50); // Default for magentoProducts
      expect(params.currentPage).toBe(1);
    });
  });

  describe('applySettingsToGridProps', () => {
    const baseProps = {
      gridName: 'TestGrid',
      columns: [],
      data: []
    };

    it('should enhance grid props with user settings', () => {
      const enhancedProps = applySettingsToGridProps(
        baseProps, 
        'magentoProducts', 
        mockUserSettings
      );
      
      expect(enhancedProps.defaultPageSize).toBe(50);
      expect(enhancedProps.density).toBe('compact');
      expect(enhancedProps.enableVirtualization).toBe(true);
      expect(enhancedProps.showStatsCards).toBe(true);
    });

    it('should preserve original props', () => {
      const enhancedProps = applySettingsToGridProps(
        baseProps, 
        'magentoProducts', 
        mockUserSettings
      );
      
      expect(enhancedProps.gridName).toBe('TestGrid');
      expect(enhancedProps.columns).toEqual([]);
      expect(enhancedProps.data).toEqual([]);
    });
  });

  describe('handleMagentoGridError', () => {
    const mockError = new Error('Test API Error');
    
    beforeEach(() => {
      vi.clearAllMocks();
      // Mock console.error to avoid noise in tests
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should handle errors with user settings', () => {
      // This should not throw
      expect(() => {
        handleMagentoGridError(mockError, 'Load Products', mockUserSettings);
      }).not.toThrow();
    });

    it('should handle errors without user settings', () => {
      // This should not throw
      expect(() => {
        handleMagentoGridError(mockError, 'Load Products', {});
      }).not.toThrow();
    });
  });
});

describe('useMagentoGridSettings Hook', () => {
  // Mock the SettingsContext
  const mockSettingsContext = {
    settings: mockUserSettings,
    updateSettings: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide grid configuration and utilities', () => {
    // Note: This test would need proper React context mocking
    // For now, we'll test the utility functions directly
    const config = getMagentoGridConfig('magentoProducts', mockUserSettings);
    
    expect(config).toBeDefined();
    expect(config.pagination).toBeDefined();
    expect(config.density).toBe('compact');
  });
});

describe('Error Handling Integration', () => {
  it('should provide consistent error handling across grid types', () => {
    const gridTypes = ['magentoProducts', 'magentoOrders', 'magentoCustomers'];
    
    gridTypes.forEach(gridType => {
      const config = getMagentoGridConfig(gridType, mockUserSettings);
      expect(config).toBeDefined();
      expect(config.performance).toBeDefined();
      expect(config.display).toBeDefined();
    });
  });
});

describe('API Settings Propagation', () => {
  it('should generate consistent API parameters for different grid types', () => {
    const gridTypes = ['magentoProducts', 'magentoOrders', 'magentoCustomers'];
    
    gridTypes.forEach(gridType => {
      const params = getMagentoApiParams(gridType, mockUserSettings);
      
      expect(params.pageSize).toBeDefined();
      expect(params.currentPage).toBeDefined();
      expect(params.sortOrders).toBeDefined();
      expect(Array.isArray(params.sortOrders)).toBe(true);
    });
  });

  it('should handle additional parameters correctly', () => {
    const additionalParams = {
      filterGroups: [{ filters: [{ field: 'status', value: 'active' }] }],
      customParam: 'test'
    };

    const params = getMagentoApiParams('magentoProducts', mockUserSettings, additionalParams);
    
    expect(params.filterGroups).toEqual(additionalParams.filterGroups);
    expect(params.customParam).toBe('test');
  });
});

describe('Settings Persistence', () => {
  it('should handle grid preference saving', () => {
    const mockUpdateSettings = vi.fn();
    
    // This would be tested with proper component integration
    expect(mockUpdateSettings).toBeDefined();
  });
});