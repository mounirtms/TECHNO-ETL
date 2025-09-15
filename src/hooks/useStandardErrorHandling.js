/**
 * Standardized Error Handling Hook
 * Provides consistent error handling across all components
 *
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { handleError, getFallbackData } from '../utils/errorHandler.js';

/**
 * Standard error handling hook for components
 * @param {string} componentName - Name of the component using this hook
 * @param {Object} options - Configuration options
 * @returns {Object} Error handling utilities
 */
export const useStandardErrorHandling = (componentName, options = {}) => {
  const {
    showToast = true,
    fallbackDataType = null,
    maxRetries = 3,
    retryDelay = 1000,
    onError = null,
    onRetry = null,
  } = options;

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastOperation, setLastOperation] = useState(null);

  /**
   * Handle error with standardized processing
   */
  const handleComponentError = useCallback((err, context = {}) => {
    const errorInfo = handleError(err, {
      componentName,
      ...context,
    });

    setError(errorInfo);

    // Call custom error handler if provided
    if (onError) {
      onError(errorInfo, err);
    }

    // Don't show toast if disabled or if it's a low severity error
    if (!showToast || errorInfo.severity === 'low') {
      return errorInfo;
    }

    return errorInfo;
  }, [componentName, showToast, onError]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  /**
   * Retry last operation
   */
  const retry = useCallback(async () => {
    if (!lastOperation || retryCount >= maxRetries) {
      return;
    }

    setRetryCount(prev => prev + 1);
    clearError();

    if (onRetry) {
      onRetry(retryCount + 1);
    }

    // Add delay before retry
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)));
    }

    try {
      return await lastOperation();
    } catch (err) {
      handleComponentError(err, { isRetry: true, retryCount: retryCount + 1 });
      throw err;
    }
  }, [lastOperation, retryCount, maxRetries, retryDelay, onRetry, clearError, handleComponentError]);

  /**
   * Execute async operation with error handling
   */
  const executeWithErrorHandling = useCallback(async (operation, context = {}) => {
    setLoading(true);
    setLastOperation(() => operation);
    clearError();

    try {
      const result = await operation();

      return result;
    } catch (err) {
      handleComponentError(err, context);

      // Return fallback data if specified
      if (fallbackDataType) {
        return getFallbackData(fallbackDataType);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleComponentError, clearError, fallbackDataType]);

  /**
   * Get fallback data for the component
   */
  const getFallback = useCallback(() => {
    return fallbackDataType ? getFallbackData(fallbackDataType) : null;
  }, [fallbackDataType]);

  /**
   * Check if can retry
   */
  const canRetry = retryCount < maxRetries && lastOperation !== null;

  /**
   * Get error message for display
   */
  const getErrorMessage = useCallback(() => {
    if (!error) return null;

    return error.message || 'An unexpected error occurred';
  }, [error]);

  /**
   * Check if error is critical
   */
  const isCriticalError = error?.severity === 'critical' || error?.severity === 'high';

  return {
    // State
    error,
    loading,
    retryCount,
    canRetry,
    isCriticalError,

    // Actions
    handleError: handleComponentError,
    clearError,
    retry,
    executeWithErrorHandling,
    getFallback,
    getErrorMessage,

    // Utilities
    isError: !!error,
    hasRetried: retryCount > 0,
    maxRetriesReached: retryCount >= maxRetries,
  };
};

/**
 * Hook for data fetching with error handling
 */
export const useDataFetching = (componentName, options = {}) => {
  const errorHandling = useStandardErrorHandling(componentName, options);
  const [data, setData] = useState(options.initialData || null);
  const [initialized, setInitialized] = useState(false);

  /**
   * Fetch data with error handling
   */
  const fetchData = useCallback(async (fetchFunction, context = {}) => {
    try {
      const result = await errorHandling.executeWithErrorHandling(fetchFunction, context);

      setData(result);
      setInitialized(true);

      return result;
    } catch (err) {
      // Error already handled by executeWithErrorHandling
      if (options.fallbackDataType) {
        const fallback = errorHandling.getFallback();

        setData(fallback);
        setInitialized(true);

        return fallback;
      }
      throw err;
    }
  }, [errorHandling, options.fallbackDataType]);

  /**
   * Refresh data
   */
  const refresh = useCallback(async () => {
    if (errorHandling.lastOperation) {
      return await fetchData(errorHandling.lastOperation);
    }
  }, [fetchData, errorHandling.lastOperation]);

  return {
    ...errorHandling,
    data,
    setData,
    fetchData,
    refresh,
    initialized,
    isEmpty: initialized && (!data || (Array.isArray(data) && data.length === 0)),
  };
};

/**
 * Hook for form handling with error handling
 */
export const useFormErrorHandling = (componentName, options = {}) => {
  const errorHandling = useStandardErrorHandling(componentName, {
    ...options,
    showToast: false, // Forms usually show inline errors
  });

  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Handle form submission with error handling
   */
  const handleSubmit = useCallback(async (submitFunction, formData, context = {}) => {
    setFieldErrors({});

    try {
      return await errorHandling.executeWithErrorHandling(
        () => submitFunction(formData),
        { ...context, formData },
      );
    } catch (err) {
      // Handle validation errors
      if (err.status === 400 && err.response?.data?.errors) {
        setFieldErrors(err.response.data.errors);
      }
      throw err;
    }
  }, [errorHandling]);

  /**
   * Clear field errors
   */
  const clearFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  /**
   * Set field error
   */
  const setFieldError = useCallback((field, message) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  return {
    ...errorHandling,
    fieldErrors,
    handleSubmit,
    clearFieldErrors,
    setFieldError,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
  };
};

export default useStandardErrorHandling;
