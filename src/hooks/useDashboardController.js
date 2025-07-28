/**
 * Dashboard Controller Hook
 * Manages dashboard data, sync operations, and state
 */

import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from './useDashboard';
import dashboardApi from '../services/dashboardApi';

export const useDashboardController = (startDate, endDate, refreshKey) => {
  // Use the main dashboard hook
  const {
    stats,
    chartData,
    recentOrders,
    bestSellers,
    customerData,
    countryData,
    productTypeData,
    loading,
    error,
    fetchAllData,
    syncPrices,
    syncInventory
  } = useDashboard();

  // Additional state for price sync
  const [priceData, setPriceData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);

  /**
   * Fetch price data for sync dialog
   */
  const getPrices = useCallback(async () => {
    try {
      setSyncLoading(true);
      
      // Mock price data for demonstration
      // In a real app, this would fetch from your backend
      const mockPriceData = [
        {
          id: 1,
          sku: 'PROD-001',
          name: 'Sample Product 1',
          currentPrice: 29.99,
          newPrice: 32.99,
          currency: 'USD',
          status: 'pending',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 2,
          sku: 'PROD-002',
          name: 'Sample Product 2',
          currentPrice: 49.99,
          newPrice: 45.99,
          currency: 'USD',
          status: 'pending',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 3,
          sku: 'PROD-003',
          name: 'Sample Product 3',
          currentPrice: 19.99,
          newPrice: 22.99,
          currency: 'USD',
          status: 'pending',
          lastUpdated: new Date().toISOString()
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPriceData(mockPriceData);
      return mockPriceData;
      
    } catch (error) {
      console.error('Error fetching price data:', error);
      throw error;
    } finally {
      setSyncLoading(false);
    }
  }, []);

  /**
   * Sync all stocks
   */
  const syncAllStocks = useCallback(async () => {
    try {
      setSyncLoading(true);
      
      // Mock stock sync operation
      // In a real app, this would call your backend API
      const mockStockData = [
        {
          id: 1,
          sku: 'PROD-001',
          name: 'Sample Product 1',
          currentStock: 100,
          newStock: 95,
          status: 'synced',
          lastUpdated: new Date().toISOString()
        },
        {
          id: 2,
          sku: 'PROD-002',
          name: 'Sample Product 2',
          currentStock: 50,
          newStock: 48,
          status: 'synced',
          lastUpdated: new Date().toISOString()
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStockData(mockStockData);
      
      // Use the syncInventory from useDashboard hook
      await syncInventory();
      
      return {
        success: true,
        message: 'Stock sync completed successfully',
        data: mockStockData
      };
      
    } catch (error) {
      console.error('Error syncing stocks:', error);
      throw error;
    } finally {
      setSyncLoading(false);
    }
  }, [syncInventory]);

  /**
   * Fetch dashboard data with date range
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      await fetchAllData();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }, [fetchAllData]);

  /**
   * Handle price sync operation
   */
  const handlePriceSync = useCallback(async () => {
    try {
      setSyncLoading(true);
      await syncPrices();
      return {
        success: true,
        message: 'Price sync completed successfully'
      };
    } catch (error) {
      console.error('Error syncing prices:', error);
      throw error;
    } finally {
      setSyncLoading(false);
    }
  }, [syncPrices]);

  /**
   * Refresh all data when dependencies change
   */
  useEffect(() => {
    if (refreshKey > 0) {
      fetchDashboardData();
    }
  }, [startDate, endDate, refreshKey, fetchDashboardData]);

  return {
    // Data
    stats,
    chartData,
    recentOrders,
    bestSellers,
    customerData,
    countryData,
    productTypeData,
    priceData,
    stockData,
    
    // Loading states
    loading: loading || syncLoading,
    syncLoading,
    error,
    
    // Actions
    getPrices,
    syncAllStocks,
    fetchDashboardData,
    handlePriceSync,
    
    // Sync operations
    syncPrices: handlePriceSync,
    syncInventory: syncAllStocks
  };
};

export default useDashboardController;
