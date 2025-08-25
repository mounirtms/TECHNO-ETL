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
import { handleError, getFallbackData } from '../utils/errorHandler';

/**
 * Error info interface
 */
interface ErrorInfo {
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type?: string;
  originalError?: any;
  code?: string;
  details?: any;
  timestamp?: number;
  [key: string]: any;
}

/**
 * Error handling options interface
 */
interface ErrorHandlingOptions {
  showToast?: boolean;
  fallbackDataType?: string | null;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (errorInfo: ErrorInfo, originalError: any) => void;
  onRetry?: (retryCount: number) => void;
  initialData?: any;
}

/**
 * Standard error handling result interface
 */
interface ErrorHandlingResult {
  // State
  error: ErrorInfo | null;
  loading: boolean;
  retryCount: number;
  canRetry: boolean;
  isCriticalError: boolean;
  lastOperation: (() => Promise<any>) | null;

  // Actions
  handleError: (err: any, context?: Record<string, any>) => ErrorInfo;
  clearError: () => void;
  retry: () => Promise<any>;
  executeWithErrorHandling: (operation: () => Promise<any>, context?: Record<string, any>) => Promise<any>;
  getFallback: () => any;
  getErrorMessage: () => string | null;

  // Utilities
  isError: boolean;
  hasRetried: boolean;
  maxRetriesReached: boolean;
}

/**
 * Data fetching result interface
 */
interface DataFetchingResult<T> extends ErrorHandlingResult {
  data: T | null;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  fetchData: (fetchFunction: () => Promise<T>, context?: Record<string, any>) => Promise<T | null>;
  refresh: () => Promise<T | null>;
  initialized: boolean;
  isEmpty: boolean;
}

/**
 * Form error handling result interface
 */
interface FormErrorHandlingResult extends ErrorHandlingResult {
  fieldErrors: Record<string, string>;
  handleSubmit: (submitFunction: (formData: any) => Promise<any>, formData: any, context?: Record<string, any>) => Promise<any>;
  clearFieldErrors: () => void;
  setFieldError: (field: string, message: string) => void;
  hasFieldErrors: boolean;
}

/**
 * Standard error handling hook for components
 * @param componentName - Name of the component using this hook
 * @param options - Configuration options
 * @returns Error handling utilities
 */
export const useStandardErrorHandling = (
  componentName: string, 
  options: ErrorHandlingOptions = {}
): ErrorHandlingResult => {
  const {
    showToast = true,
    fallbackDataType = null,
    maxRetries = 3,
    retryDelay = 1000,
    onError = null,
    onRetry = null
  } = options;

  const [error, setError] = useState<ErrorInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [lastOperation, setLastOperation] = useState<(() => Promise<any>) | null>(null);

  /**
   * Handle error with standardized processing
   */
  const handleComponentError = useCallback((err: any, context: Record<string, any> = {}): ErrorInfo => {
    // Type assertion for handleError result
    const errorInfo = handleError(err, {
      componentName,
      ...context
    }) as ErrorInfo;

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
  const executeWithErrorHandling = useCallback(async (operation: () => Promise<any>, context: Record<string, any> = {}) => {
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
    lastOperation,

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
    maxRetriesReached: retryCount >= maxRetries
  };
};

/**
 * Hook for data fetching with error handling
 */
export const useDataFetching = <T = any>(
  componentName: string, 
  options: ErrorHandlingOptions = {}
): DataFetchingResult<T> => {
  const errorHandling = useStandardErrorHandling(componentName, options);
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [initialized, setInitialized] = useState<boolean>(false);

  /**
   * Fetch data with error handling
   */
  const fetchData = useCallback(async (fetchFunction: () => Promise<T>, context: Record<string, any> = {}): Promise<T | null> => {
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
  const refresh = useCallback(async (): Promise<T | null> => {
    if (errorHandling.lastOperation) {
      return await fetchData(errorHandling.lastOperation);
    }
    return null;
  }, [fetchData, errorHandling.lastOperation]);

  return {
    ...errorHandling,
    data,
    setData,
    fetchData,
    refresh,
    initialized,
    isEmpty: initialized && (!data || (Array.isArray(data) && data.length === 0))
  };
};

/**
 * Hook for form handling with error handling
 */
export const useFormErrorHandling = (
  componentName: string, 
  options: ErrorHandlingOptions = {}
): FormErrorHandlingResult => {
  const errorHandling = useStandardErrorHandling(componentName, {
    ...options,
    showToast: false // Forms usually show inline errors
  });
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /**
   * Handle form submission with error handling
   */
  const handleSubmit = useCallback(async (submitFunction: (formData as any) => Promise<any>, formData: any, context: Record<string, any> = {}) => {
    setFieldErrors({});
    
    try {
      return await errorHandling.executeWithErrorHandling(
        () => submitFunction(formData),
        { ...context, formData }
      );
    } catch (err) { // Type assertion for error
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
  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  return {
    ...errorHandling,
    fieldErrors,
    handleSubmit,
    clearFieldErrors,
    setFieldError,
    hasFieldErrors: Object.keys(fieldErrors).length > 0
  };
};

export default useStandardErrorHandling;
