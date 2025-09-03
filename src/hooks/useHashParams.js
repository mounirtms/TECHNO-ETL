/**
 * Hash Parameters Hook for TECHNO-ETL
 * Handles hash-based routing parameters for dashboard navigation
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle hash-based parameters
 * @returns {Object} { params, setParams, clearParams, updateParams }
 */
export const useHashParams = () => {
  const location = useLocation();
  const [params, setParams] = useState({});

  // Parse hash parameters from URL
  const parseHashParams = useCallback((hash) => {
    if (!hash || hash === '#') return {};

    try {
      // Remove the # symbol and decode
      const encodedParams = hash.substring(1);
      const decodedParams = atob(encodedParams);

      return JSON.parse(decodedParams);
    } catch (error) {
      console.warn('Failed to parse hash parameters:', error);

      return {};
    }
  }, []);

  // Encode parameters to hash
  const encodeToHash = useCallback((params) => {
    if (!params || Object.keys(params).length === 0) return '';

    try {
      const encodedParams = btoa(JSON.stringify(params));

      return '#' + encodedParams;
    } catch (error) {
      console.warn('Failed to encode hash parameters:', error);

      return '';
    }
  }, []);

  // Update URL hash without navigation
  const updateUrlHash = useCallback((newParams) => {
    const hash = encodeToHash(newParams);
    const newUrl = window.location.pathname + window.location.search + hash;

    window.history.replaceState(null, '', newUrl);
  }, [encodeToHash]);

  // Parse parameters on location change and initial load
  useEffect(() => {
    const parsedParams = parseHashParams(location.hash);

    console.log('Hash params parsed:', location.hash, parsedParams); // Debug log
    setParams(parsedParams);
  }, [location.hash, parseHashParams]);

  // Initial load - parse hash immediately
  useEffect(() => {
    const initialHash = window.location.hash;

    if (initialHash) {
      const parsedParams = parseHashParams(initialHash);

      console.log('Initial hash params:', initialHash, parsedParams); // Debug log
      setParams(parsedParams);
    }
  }, [parseHashParams]);

  // Update parameters and URL
  const updateParams = useCallback((newParams, replace = false) => {
    const updatedParams = replace ? newParams : { ...params, ...newParams };

    setParams(updatedParams);
    updateUrlHash(updatedParams);
  }, [params, updateUrlHash]);

  // Clear all parameters
  const clearParams = useCallback(() => {
    setParams({});
    updateUrlHash({});
  }, [updateUrlHash]);

  // Get specific parameter with default value
  const getParam = useCallback((key, defaultValue = null) => {
    return params[key] !== undefined ? params[key] : defaultValue;
  }, [params]);

  // Check if parameter exists
  const hasParam = useCallback((key) => {
    return params.hasOwnProperty(key);
  }, [params]);

  // Remove specific parameter
  const removeParam = useCallback((key) => {
    const newParams = { ...params };

    delete newParams[key];
    setParams(newParams);
    updateUrlHash(newParams);
  }, [params, updateUrlHash]);

  return {
    params,
    setParams: updateParams,
    clearParams,
    updateParams,
    getParam,
    hasParam,
    removeParam,
    encodeToHash,
    parseHashParams,
  };
};

/**
 * Hook for dashboard-specific parameters
 * @returns {Object} Dashboard-specific parameter handlers
 */
export const useDashboardParams = () => {
  const { params, getParam, updateParams, hasParam } = useHashParams();

  // Dashboard-specific parameter getters
  const getView = () => getParam('view', 'grid');
  const getFilter = () => getParam('filter', 'all');
  const getStatus = () => getParam('status', 'all');
  const getSortBy = () => getParam('sortBy', 'date');
  const getPeriod = () => getParam('period', 'monthly');
  const getCategory = () => getParam('category', 'all');
  const getPriority = () => getParam('priority', 'normal');
  const isAlert = () => getParam('alert', 'false') === 'true';

  // Dashboard-specific parameter setters
  const setView = (view) => updateParams({ view });
  const setFilter = (filter) => updateParams({ filter });
  const setStatus = (status) => updateParams({ status });
  const setSortBy = (sortBy) => updateParams({ sortBy });
  const setPeriod = (period) => updateParams({ period });
  const setCategory = (category) => updateParams({ category });
  const setPriority = (priority) => updateParams({ priority });
  const setAlert = (alert) => updateParams({ alert: alert.toString() });

  // Check for specific dashboard states
  const isLowStockView = () => getFilter() === 'low-stock';
  const isPendingOrdersView = () => getStatus() === 'pending';
  const isCategoriesView = () => getView() === 'categories';
  const isBrandsView = () => getView() === 'brands';
  const isRevenueView = () => getView() === 'revenue';

  return {
    // All base functionality
    params,
    updateParams,
    hasParam,

    // Getters
    getView,
    getFilter,
    getStatus,
    getSortBy,
    getPeriod,
    getCategory,
    getPriority,
    isAlert,

    // Setters
    setView,
    setFilter,
    setStatus,
    setSortBy,
    setPeriod,
    setCategory,
    setPriority,
    setAlert,

    // State checkers
    isLowStockView,
    isPendingOrdersView,
    isCategoriesView,
    isBrandsView,
    isRevenueView,
  };
};

/**
 * Hook for grid-specific parameters
 * @returns {Object} Grid-specific parameter handlers
 */
export const useGridParams = () => {
  const { params, getParam, updateParams } = useHashParams();

  // Grid-specific parameters
  const getPage = () => parseInt(getParam('page', '1'));
  const getPageSize = () => parseInt(getParam('pageSize', '25'));
  const getSearchQuery = () => getParam('search', '');
  const getSelectedIds = () => {
    const selected = getParam('selected', '[]');

    try {
      return JSON.parse(selected);
    } catch {
      return [];
    }
  };

  // Grid-specific setters
  const setPage = (page) => updateParams({ page: page.toString() });
  const setPageSize = (pageSize) => updateParams({ pageSize: pageSize.toString() });
  const setSearchQuery = (search) => updateParams({ search });
  const setSelectedIds = (ids) => updateParams({ selected: JSON.stringify(ids) });

  return {
    params,
    updateParams,

    // Grid getters
    getPage,
    getPageSize,
    getSearchQuery,
    getSelectedIds,

    // Grid setters
    setPage,
    setPageSize,
    setSearchQuery,
    setSelectedIds,
  };
};

export default useHashParams;
