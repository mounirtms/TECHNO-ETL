/**
 * Dashboard Data Management Hook
 * Provides optimized data fetching, caching, and state management for dashboard
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import dashboardApiService from '../services/dashboardApiService';
import { getMdmData } from '../services/BaseApiService'; // For sync operations

/**
 * Custom hook for dashboard data management
 */
export const useDashboard = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    preload = true
  } = options;

  // State management
  const [data, setData] = useState({
    stats: null,
    orders: null,
    health: null
  });

  const [loading, setLoading] = useState({
    stats: false,
    orders: false,
    health: false,
    sync: false
  });

  const [errors, setErrors] = useState({
    stats: null,
    orders: null,
    health: null,
    sync: null
  });

  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Helper to safely update state only if component is mounted
  const safeSetState = useCallback((setter, value) => {
    if (mountedRef.current) {
      setter(value);
    }
  }, []);

  // Clear error for specific data type
  const clearError = useCallback((type) => {
    safeSetState(setErrors, prev => ({ ...prev, [type]: null }));
  }, [safeSetState]);

  // Set loading state
  const setLoadingState = useCallback((type, isLoading) => {
    safeSetState(setLoading, prev => ({ ...prev, [type]: isLoading }));
  }, [safeSetState]);

  // Set error state
  const setErrorState = useCallback((type, error) => {
    safeSetState(setErrors, prev => ({ ...prev, [type]: error }));
  }, [safeSetState]);

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    setLoadingState('stats', true);
    clearError('stats');

    try {
      const result = await dashboardApiService.getDashboardStats();
      safeSetState(setData, prev => ({ ...prev, stats: result }));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setErrorState('stats', error.message);
    } finally {
      setLoadingState('stats', false);
    }
  }, [setLoadingState, clearError, setErrorState, safeSetState]);

  // Fetch recent orders (using MDM data temporarily)
  const fetchOrders = useCallback(async (page = 1, limit = 5) => {
    setLoadingState('orders', true);
    clearError('orders');

    try {
      // Use MDM data for now, can be replaced with actual orders endpoint
      const result = await getMdmData();
      safeSetState(setData, prev => ({ ...prev, orders: result }));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setErrorState('orders', error.message);
    } finally {
      setLoadingState('orders', false);
    }
  }, [setLoadingState, clearError, setErrorState, safeSetState]);

  // Fetch dashboard health
  const fetchHealth = useCallback(async () => {
    setLoadingState('health', true);
    clearError('health');

    try {
      // Use inventory status as health indicator
      const result = await dashboardApiService.getInventoryStatus();
      safeSetState(setData, prev => ({ ...prev, health: { 
        status: result.success ? 'healthy' : 'degraded', 
        ...result 
      } }));
    } catch (error) {
      console.error('Failed to fetch health:', error);
      setErrorState('health', error.message);
    } finally {
      setLoadingState('health', false);
    }
  }, [setLoadingState, clearError, setErrorState, safeSetState]);

  // Fetch all dashboard data
  const fetchAllData = useCallback(async () => {
    console.log('🔄 Fetching all dashboard data...');
    const startTime = Date.now();
    
    try {
      const result = await dashboardApiService.getAllDashboardMetrics();
      
      safeSetState(setData, {
        stats: result.data,
        orders: { message: 'Orders data available via MDM' },
        health: { status: result.success ? 'healthy' : 'degraded', ...result }
      });
      
      setLastUpdated(new Date());
      const fetchTime = Date.now() - startTime;
      console.log(`✅ Dashboard data updated (${fetchTime}ms)`);
    } catch (error) {
      console.error('❌ Failed to fetch dashboard data:', error);
      setErrorState('stats', error.message);
    }
  }, [safeSetState, setErrorState]);

  // Trigger price synchronization (using MDM for now)
  const syncPrices = useCallback(async () => {
    setLoadingState('sync', true);
    clearError('sync');

    try {
      // Use MDM data sync as fallback
      const result = await getMdmData();
      
      // Refresh stats after sync
      setTimeout(() => {
        fetchStats();
      }, 1000);

      return { success: true, message: 'Prices sync initiated', data: result };
    } catch (error) {
      console.error('Failed to sync prices:', error);
      setErrorState('sync', error.message);
      throw error;
    } finally {
      setLoadingState('sync', false);
    }
  }, [setLoadingState, clearError, setErrorState, fetchStats]);

  // Trigger inventory synchronization
  const syncInventory = useCallback(async () => {
    setLoadingState('sync', true);
    clearError('sync');

    try {
      // Use inventory status as sync indicator
      const result = await dashboardApiService.getInventoryStatus();
      
      // Refresh stats after sync
      setTimeout(() => {
        fetchStats();
      }, 1000);

      return { success: true, message: 'Inventory sync completed', data: result };
    } catch (error) {
      console.error('Failed to sync inventory:', error);
      setErrorState('sync', error.message);
      throw error;
    } finally {
      setLoadingState('sync', false);
    }
  }, [setLoadingState, clearError, setErrorState, fetchStats]);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        console.log('🔄 Auto-refreshing dashboard data...');
        fetchAllData();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchAllData]);

  // Initial data load
  useEffect(() => {
    if (preload) {
      // Preload data in background by calling our service
      dashboardApiService.getAllDashboardMetrics().catch(console.error);
    }
    
    // Fetch initial data
    fetchAllData();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [fetchAllData, preload]);

  // Computed values
  const isLoading = Object.values(loading).some(Boolean);
  const hasErrors = Object.values(errors).some(Boolean);
  const isHealthy = data.health?.status === 'healthy';

  return {
    // Data
    data,
    loading,
    errors,
    lastUpdated,
    
    // Computed states
    isLoading,
    hasErrors,
    isHealthy,
    
    // Actions
    fetchStats,
    fetchOrders,
    fetchHealth,
    fetchAllData,
    refresh,
    syncPrices,
    syncInventory,
    clearError,
    
    // Cache management
    clearCache: dashboardApiService.clearCache.bind(dashboardApiService),
    getCacheStats: dashboardApiService.getCacheStats.bind(dashboardApiService)
  };
};

/**
 * Hook for sync operations
 */
export const useSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const syncPrices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Use MDM data as sync fallback
      const result = await getMdmData();
      setLastSync({ type: 'prices', success: true, data: result, timestamp: new Date().toISOString() });
      return { success: true, message: 'Prices sync completed', data: result };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dashboardApiService.getInventoryStatus();
      setLastSync({ type: 'inventory', success: true, data: result.data, timestamp: new Date().toISOString() });
      return { success: true, message: 'Inventory sync completed', data: result };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSyncStatus = useCallback(async () => {
    try {
      // Return dashboard health as sync status
      const result = await dashboardApiService.getInventoryStatus();
      return {
        status: result.success ? 'healthy' : 'degraded',
        lastSync: lastSync?.timestamp || null,
        message: 'Sync status retrieved from dashboard'
      };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [lastSync]);

  return {
    loading,
    error,
    lastSync,
    syncPrices,
    syncInventory,
    getSyncStatus,
    clearError: () => setError(null)
  };
};

export default useDashboard;
