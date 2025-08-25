/**
 * Type Assertion Test for Hooks
 * 
 * This file contains type assertions that verify our hook types
 * are working correctly at compile-time.
 */

import { assertType, assertAssignable, assertNotAssignable, Parameters, ReturnType } from './typeUtils';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useGridCache } from '../hooks/useGridCache';
import { useStandardErrorHandling, useDataFetching, useFormErrorHandling } from '../hooks/useStandardErrorHandling';
import { useUserSettings } from '../hooks/useUserSettings';
import { useHashParams } from '../hooks/useHashParams';

describe('Hook Type Definitions', () => {
  it('usePerformanceMonitor has correct parameter and return types', () => {
    // These tests are only checked at compile-time, not runtime
    type PerformanceMonitorParams = Parameters<typeof usePerformanceMonitor>;
    type PerformanceMonitorReturn = ReturnType<typeof usePerformanceMonitor>;

    // First parameter should be a string (component name)
    const componentNameParam: PerformanceMonitorParams[0] = 'TestComponent';
    assertType<string>(componentNameParam, '');

    // Return type should have renderCount, measureOperation, and trackExpensiveCalculation
    const mockReturn: PerformanceMonitorReturn = {
      renderCount: 1,
      measureOperation: (operationName, operation) => (...args) => {
        return operation(...args);
      },
      trackExpensiveCalculation: (calculationName, calculation, ...args) => {
        return calculation(...args);
      }
    };

    // Make sure the mock return value is assignable to the actual return type
    assertType(mockReturn, {} as PerformanceMonitorReturn);
  });

  it('useGridCache has correct parameter and return types', () => {
    type GridCacheParams = Parameters<typeof useGridCache>;
    type GridCacheReturn = ReturnType<typeof useGridCache>;

    // First parameter should be a string (grid name)
    const gridNameParam: GridCacheParams[0] = 'TestGrid';
    assertType<string>(gridNameParam, '');

    // Second parameter should be a boolean (enable cache)
    const enableCacheParam: GridCacheParams[1] = true;
    assertType<boolean>(enableCacheParam, true);

    // Return type should have expected methods
    const mockReturn: GridCacheReturn = {
      cacheData: null,
      cacheMetadata: {},
      setCacheData: (data, metadata) => {},
      getCacheData: (metadata) => null,
      clearCache: (specificKey) => {},
      invalidateCache: (pattern) => {},
      cacheStats: {
        size: 0,
        memoryUsage: 0
      }
    };

    assertAssignable(mockReturn, {} as GridCacheReturn);
  });

  it('useStandardErrorHandling has correct parameter and return types', () => {
    type ErrorHandlingParams = Parameters<typeof useStandardErrorHandling>;
    type ErrorHandlingReturn = ReturnType<typeof useStandardErrorHandling>;

    // First parameter should be a string (component name)
    const componentNameParam: ErrorHandlingParams[0] = 'TestComponent';
    assertType<string>(componentNameParam, '');

    // Return type should have error-related properties and methods
    const mockReturn: ErrorHandlingReturn = {
      error: null,
      loading: false,
      retryCount: 0,
      canRetry: false,
      isCriticalError: false,
      lastOperation: null,
      handleError: (err, context) => ({
        message: 'Error',
        severity: 'medium',
        type: 'error'
      }),
      clearError: () => {},
      retry: async () => {},
      executeWithErrorHandling: async (operation, context) => await operation(),
      getFallback: () => null,
      getErrorMessage: () => null,
      isError: false,
      hasRetried: false,
      maxRetriesReached: false
    };

    assertAssignable(mockReturn, {} as ErrorHandlingReturn);
  });

  it('useDataFetching extends useStandardErrorHandling', () => {
    type DataFetchingReturn = ReturnType<typeof useDataFetching>;
    type ErrorHandlingReturn = ReturnType<typeof useStandardErrorHandling>;

    // Create a mock data fetching return value
    const mockDataFetchingReturn: DataFetchingReturn = {
      // Include all properties from useStandardErrorHandling
      error: null,
      loading: false,
      retryCount: 0,
      canRetry: false,
      isCriticalError: false,
      lastOperation: null,
      handleError: (err, context) => ({
        message: 'Error',
        severity: 'medium',
        type: 'error'
      }),
      clearError: () => {},
      retry: async () => {},
      executeWithErrorHandling: async (operation, context) => await operation(),
      getFallback: () => null,
      getErrorMessage: () => null,
      isError: false,
      hasRetried: false,
      maxRetriesReached: false,
      
      // Additional properties from useDataFetching
      data: null,
      setData: () => {},
      fetchData: async (fetchFunction, context) => null,
      refresh: async () => null,
      initialized: false,
      isEmpty: false
    };

    // DataFetchingReturn should be assignable to ErrorHandlingReturn
    assertAssignable<ErrorHandlingReturn>(mockDataFetchingReturn, {} as ErrorHandlingReturn);
    
    // But ErrorHandlingReturn should not be assignable to DataFetchingReturn
    const mockErrorHandlingReturn: ErrorHandlingReturn = {
      error: null,
      loading: false,
      retryCount: 0,
      canRetry: false,
      isCriticalError: false,
      lastOperation: null,
      handleError: (err) => ({
        message: 'Error',
        severity: 'medium',
        type: 'error'
      }),
      clearError: () => {},
      retry: async () => {},
      executeWithErrorHandling: async (operation) => await operation(),
      getFallback: () => null,
      getErrorMessage: () => null,
      isError: false,
      hasRetried: false,
      maxRetriesReached: false
    };
    
    assertNotAssignable<DataFetchingReturn>(mockErrorHandlingReturn, {} as DataFetchingReturn);
  });
});

export {}; // This export is needed to make the file a module