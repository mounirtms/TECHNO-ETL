/**
 * useMagentoGridSettings Hook
 * Provides settings-aware configuration and utilities for Magento grids
 */

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import {
  getMagentoGridConfig,
  getMagentoApiParams,
  applySettingsToGridProps,
  handleMagentoGridError,
  saveMagentoGridPreferences,
  getMagentoGridPreferences
} from '../utils/magentoGridSettingsManager';

/**
 * Hook for Magento grid settings integration
 * @param {string} gridType - Type of Magento grid (e.g., 'magentoProducts')
 * @param {object} baseProps - Base grid props
 * @returns {object} Settings-aware grid configuration and utilities
 */
export const useMagentoGridSettings = (gridType, baseProps = {}) => {
  const { settings, updateSettings } = useSettings();
  const [localPreferences, setLocalPreferences] = useState({});

  // Get grid configuration based on user settings
  const gridConfig = useMemo(() => {
    return getMagentoGridConfig(gridType, settings);
  }, [gridType, settings]);

  // Get enhanced grid props with user settings applied
  const enhancedGridProps = useMemo(() => {
    return applySettingsToGridProps(baseProps, gridType, settings);
  }, [baseProps, gridType, settings]);

  // Get API parameters with user settings
  const getApiParams = useCallback((additionalParams = {}) => {
    return getMagentoApiParams(gridType, settings, additionalParams);
  }, [gridType, settings]);

  // Error handler with user-configured error handling
  const handleError = useCallback((error, operation) => {
    handleMagentoGridError(error, operation, settings);
  }, [settings]);

  // Save grid preferences
  const savePreferences = useCallback((preferences) => {
    saveMagentoGridPreferences(gridType, preferences, updateSettings);
    setLocalPreferences(prev => ({ ...prev, ...preferences }));
  }, [gridType, updateSettings]);

  // Get saved preferences
  const savedPreferences = useMemo(() => {
    const saved = getMagentoGridPreferences(gridType, settings);
    return { ...saved, ...localPreferences };
  }, [gridType, settings, localPreferences]);

  // Pagination settings
  const paginationSettings = useMemo(() => ({
    defaultPageSize: gridConfig.pagination.defaultPageSize,
    pageSizeOptions: gridConfig.pagination.pageSizeOptions,
    enableServerSidePagination: gridConfig.pagination.enableServerSidePagination
  }), [gridConfig.pagination]);

  // Density settings
  const densitySettings = useMemo(() => ({
    density: gridConfig.density,
    rowHeight: gridConfig.density === 'compact' ? 36 : 
               gridConfig.density === 'comfortable' ? 56 : 46
  }), [gridConfig.density]);

  // Performance settings
  const performanceSettings = useMemo(() => ({
    enableVirtualization: gridConfig.display.enableVirtualization,
    virtualizationThreshold: gridConfig.display.virtualizationThreshold,
    cacheEnabled: gridConfig.performance.cacheEnabled,
    autoRefresh: gridConfig.performance.autoRefresh,
    refreshInterval: gridConfig.performance.refreshInterval
  }), [gridConfig.display, gridConfig.performance]);

  // Filter settings
  const filterSettings = useMemo(() => ({
    enableQuickFilter: gridConfig.filtering.enableQuickFilter,
    enableAdvancedFilter: gridConfig.filtering.enableAdvancedFilter,
    persistFilters: gridConfig.filtering.persistFilters
  }), [gridConfig.filtering]);

  // Display settings
  const displaySettings = useMemo(() => ({
    showStatsCards: gridConfig.display.showStatsCards,
    theme: settings?.preferences?.theme || 'system',
    language: settings?.preferences?.language || 'en',
    animations: settings?.preferences?.animations !== false
  }), [gridConfig.display, settings?.preferences]);

  // Auto-refresh effect
  useEffect(() => {
    if (performanceSettings.autoRefresh && performanceSettings.refreshInterval > 0) {
      const interval = setInterval(() => {
        // Trigger refresh event
        window.dispatchEvent(new CustomEvent('magentoGridAutoRefresh', {
          detail: { gridType }
        }));
      }, performanceSettings.refreshInterval);

      return () => clearInterval(interval);
    }
  }, [performanceSettings.autoRefresh, performanceSettings.refreshInterval, gridType]);

  return {
    // Configuration objects
    gridConfig,
    enhancedGridProps,
    savedPreferences,
    
    // Specific settings categories
    paginationSettings,
    densitySettings,
    performanceSettings,
    filterSettings,
    displaySettings,
    
    // Utility functions
    getApiParams,
    handleError,
    savePreferences,
    
    // Raw settings for advanced usage
    userSettings: settings
  };
};

/**
 * Hook for managing Magento grid state with settings integration
 * @param {string} gridType - Type of Magento grid
 * @param {object} initialState - Initial grid state
 * @returns {object} Grid state management with settings integration
 */
export const useMagentoGridState = (gridType, initialState = {}) => {
  const { savedPreferences, paginationSettings, savePreferences } = useMagentoGridSettings(gridType);
  
  // Initialize state with saved preferences
  const [paginationModel, setPaginationModel] = useState(() => ({
    page: savedPreferences.currentPage || 0,
    pageSize: savedPreferences.pageSize || paginationSettings.defaultPageSize
  }));
  
  const [sortModel, setSortModel] = useState(() => 
    savedPreferences.sortModel || initialState.sortModel || []
  );
  
  const [filterModel, setFilterModel] = useState(() => 
    savedPreferences.filterModel || initialState.filterModel || { items: [] }
  );
  
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(() => 
    savedPreferences.columnVisibilityModel || initialState.columnVisibilityModel || {}
  );

  // Save pagination changes
  const handlePaginationModelChange = useCallback((newModel) => {
    setPaginationModel(newModel);
    savePreferences({
      currentPage: newModel.page,
      pageSize: newModel.pageSize
    });
  }, [savePreferences]);

  // Save sort changes
  const handleSortModelChange = useCallback((newModel) => {
    setSortModel(newModel);
    savePreferences({ sortModel: newModel });
  }, [savePreferences]);

  // Save filter changes
  const handleFilterModelChange = useCallback((newModel) => {
    setFilterModel(newModel);
    if (savedPreferences.persistFilters !== false) {
      savePreferences({ filterModel: newModel });
    }
  }, [savePreferences, savedPreferences.persistFilters]);

  // Save column visibility changes
  const handleColumnVisibilityModelChange = useCallback((newModel) => {
    setColumnVisibilityModel(newModel);
    savePreferences({ columnVisibilityModel: newModel });
  }, [savePreferences]);

  return {
    // State values
    paginationModel,
    sortModel,
    filterModel,
    columnVisibilityModel,
    
    // State setters with persistence
    setPaginationModel: handlePaginationModelChange,
    setSortModel: handleSortModelChange,
    setFilterModel: handleFilterModelChange,
    setColumnVisibilityModel: handleColumnVisibilityModelChange,
    
    // Direct setters (without persistence)
    setPaginationModelDirect: setPaginationModel,
    setSortModelDirect: setSortModel,
    setFilterModelDirect: setFilterModel,
    setColumnVisibilityModelDirect: setColumnVisibilityModel
  };
};

export default useMagentoGridSettings;