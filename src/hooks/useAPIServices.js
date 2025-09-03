import { useState, useEffect, useCallback, useRef } from 'react';
import apiServiceFactory from '../services/api/APIServiceFactory.js';
import { useSettings } from '../contexts/SettingsContext.jsx';

/**
 * Custom hook for using API services
 * Provides access to all configured API services with automatic configuration updates
 */
export const useAPIServices = () => {
  const { settings } = useSettings();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState({});
  const initializationRef = useRef(false);

  // Initialize API services when settings change
  useEffect(() => {
    const initializeServices = async () => {
      if (initializationRef.current) return;

      try {
        setLoading(true);
        setError(null);

        // Get API settings from user settings
        const apiSettings = settings?.apiSettings || {};

        if (Object.keys(apiSettings).length > 0) {
          initializationRef.current = true;
          apiServiceFactory.initialize(apiSettings);
          setInitialized(true);

          // Get initial health status
          const status = await apiServiceFactory.getHealthStatus();

          setHealthStatus(status);
        }
      } catch (err) {
        console.error('Failed to initialize API services:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (settings) {
      initializeServices();
    }
  }, [settings]);

  // Get specific service
  const getService = useCallback((serviceName) => {
    if (!initialized) {
      throw new Error('API services not initialized');
    }

    return apiServiceFactory.getService(serviceName);
  }, [initialized]);

  // Get MDM service
  const getMDMService = useCallback(() => {
    return getService('mdm');
  }, [getService]);

  // Get Magento service
  const getMagentoService = useCallback(() => {
    return getService('magento');
  }, [getService]);

  // Get CEGID service
  const getCegidService = useCallback(() => {
    return getService('cegid');
  }, [getService]);

  // Test all connections
  const testAllConnections = useCallback(async () => {
    if (!initialized) {
      throw new Error('API services not initialized');
    }

    try {
      setLoading(true);
      const results = await apiServiceFactory.testAllConnections();

      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // Test specific service connection
  const testConnection = useCallback(async (serviceName) => {
    if (!initialized) {
      throw new Error('API services not initialized');
    }

    try {
      const service = getService(serviceName);

      return await service.testConnection();
    } catch (err) {
      console.error(`Failed to test ${serviceName} connection:`, err);
      throw err;
    }
  }, [initialized, getService]);

  // Refresh health status
  const refreshHealthStatus = useCallback(async () => {
    if (!initialized) return;

    try {
      const status = await apiServiceFactory.getHealthStatus();

      setHealthStatus(status);

      return status;
    } catch (err) {
      console.error('Failed to refresh health status:', err);
      setError(err.message);
    }
  }, [initialized]);

  // Update service configuration
  const updateServiceConfig = useCallback((serviceName, config) => {
    if (!initialized) {
      throw new Error('API services not initialized');
    }

    apiServiceFactory.updateServiceConfig(serviceName, config);
  }, [initialized]);

  // Clear all caches
  const clearAllCaches = useCallback(() => {
    if (!initialized) return;

    apiServiceFactory.clearAllCaches();
  }, [initialized]);

  // Get service status
  const getServiceStatus = useCallback((serviceName) => {
    return healthStatus[serviceName] || { status: 'unknown' };
  }, [healthStatus]);

  // Check if service is available and healthy
  const isServiceHealthy = useCallback((serviceName) => {
    const status = getServiceStatus(serviceName);

    return status.status === 'healthy';
  }, [getServiceStatus]);

  // Get available services
  const getAvailableServices = useCallback(() => {
    if (!initialized) return [];

    return apiServiceFactory.getAvailableServices();
  }, [initialized]);

  // Check if service is enabled
  const isServiceEnabled = useCallback((serviceName) => {
    if (!initialized) return false;

    return apiServiceFactory.isServiceEnabled(serviceName);
  }, [initialized]);

  return {
    // State
    initialized,
    loading,
    error,
    healthStatus,

    // Service getters
    getService,
    getMDMService,
    getMagentoService,
    getCegidService,

    // Connection testing
    testConnection,
    testAllConnections,

    // Health monitoring
    refreshHealthStatus,
    getServiceStatus,
    isServiceHealthy,

    // Configuration
    updateServiceConfig,
    getAvailableServices,
    isServiceEnabled,

    // Utilities
    clearAllCaches,
  };
};

/**
 * Hook for using a specific API service
 */
export const useAPIService = (serviceName) => {
  const {
    initialized,
    loading,
    error,
    getService,
    testConnection,
    getServiceStatus,
    isServiceHealthy,
    isServiceEnabled,
  } = useAPIServices();

  const [service, setService] = useState(null);

  useEffect(() => {
    if (initialized && isServiceEnabled(serviceName)) {
      try {
        const serviceInstance = getService(serviceName);

        setService(serviceInstance);
      } catch (err) {
        console.error(`Failed to get ${serviceName} service:`, err);
      }
    }
  }, [initialized, serviceName, getService, isServiceEnabled]);

  const testServiceConnection = useCallback(async () => {
    return await testConnection(serviceName);
  }, [testConnection, serviceName]);

  return {
    service,
    initialized,
    loading,
    error,
    enabled: isServiceEnabled(serviceName),
    healthy: isServiceHealthy(serviceName),
    status: getServiceStatus(serviceName),
    testConnection: testServiceConnection,
  };
};

/**
 * Hook for MDM service specifically
 */
export const useMDMService = () => {
  return useAPIService('mdm');
};

/**
 * Hook for Magento service specifically
 */
export const useMagentoService = () => {
  return useAPIService('magento');
};

/**
 * Hook for CEGID service specifically
 */
export const useCegidService = () => {
  return useAPIService('cegid');
};
