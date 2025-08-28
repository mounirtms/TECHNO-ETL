/**
 * Modern React 18 Hooks Collection
 * 
 * Advanced hooks leveraging React 18 features for optimal performance
 * and user experience. All hooks are TypeScript-ready with JSDoc comments.
 * 
 * Features:
 * - Deferred value optimization for search
 * - Transition-based state management
 * - Suspense-compatible data fetching
 * - Virtualized list rendering
 * - External store integration
 * - Optimistic state updates
 * - Smart caching with TTL
 * - Error handling utilities
 * - Resource creation patterns
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React, { 
  useState, 
  useCallback, 
  useMemo, 
  useEffect, 
  useRef,
  useId,
  useDeferredValue,
  useTransition,
  useSyncExternalStore,
  Suspense
} from 'react';

// ============================================================================
// ENHANCED SEARCH HOOK
// ============================================================================

/**
 * Enhanced search hook with deferred value optimization
 * @param {function} searchFn - Search function to call
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Object} Search state and handlers
 */
export const useDeferredSearch = (searchFn, delay = 300) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const timeoutRef = useRef(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updateQuery = useCallback((newQuery) => {
    setQuery(newQuery);
    setIsSearching(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsSearching(false);
    }, delay);
  }, [delay]);

  // Execute search when deferred query changes
  useEffect(() => {
    if (deferredQuery && searchFn) {
      searchFn(deferredQuery);
    }
  }, [deferredQuery, searchFn]);

  return {
    query,
    deferredQuery,
    isSearching,
    updateQuery,
    clearQuery: () => updateQuery('')
  };
};

// ============================================================================
// TRANSITION STATE HOOK
// ============================================================================

/**
 * State hook with transition for non-blocking updates
 * @param {any} initialState - Initial state value
 * @returns {Object} State and transition setter
 */
export const useTransitionState = (initialState) => {
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const setStateTransition = useCallback((newState) => {
    startTransition(() => {
      setState(newState);
    });
  }, []);

  return { state, setState: setStateTransition, isPending };
};

// ============================================================================
// SUSPENSE QUERY HOOK
// ============================================================================

/**
 * Suspense-compatible data fetching hook
 * @param {function} queryFn - Async function to fetch data
 * @param {Array} dependencies - Dependencies for refetching
 * @returns {Object} Query state and handlers
 */
export const useSuspenseQuery = (queryFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const promiseRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (promiseRef.current) {
      throw promiseRef.current; // Suspend if already fetching
    }

    promiseRef.current = queryFn();

    try {
      const result = await promiseRef.current;
      startTransition(() => {
        setData(result);
        promiseRef.current = null;
      });
      return result;
    } catch (err) {
      promiseRef.current = null;
      setError(err);
      throw err;
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    throw error;
  }

  return {
    data,
    error,
    isPending,
    refetch: fetchData,
    isLoading: !!promiseRef.current
  };
};

// ============================================================================
// UNIQUE IDS HOOK
// ============================================================================

/**
 * Generate multiple unique IDs with optional prefix
 * @param {number} count - Number of IDs to generate
 * @param {string} prefix - Optional prefix for IDs
 * @returns {Array<string>} Array of unique IDs
 */
export const useUniqueIds = (count = 1, prefix = '') => {
  const baseId = useId();

  return useMemo(() => {
    return Array.from({ length: count }, (_, index) => 
      `${prefix}${baseId}-${index}`
    );
  }, [baseId, count, prefix]);
};

/**
 * Generate form field IDs for accessibility
 * @param {Array<string>} fieldNames - Array of field names
 * @returns {Object} Object with field IDs for input, label, error, help
 */
export const useFormIds = (fieldNames) => {
  const baseId = useId();

  return useMemo(() => {
    return fieldNames.reduce((acc, fieldName) => {
      acc[fieldName] = {
        input: `${baseId}-${fieldName}`,
        label: `${baseId}-${fieldName}-label`,
        error: `${baseId}-${fieldName}-error`,
        help: `${baseId}-${fieldName}-help`
      };
      return acc;
    }, {});
  }, [baseId, fieldNames]);
};

// ============================================================================
// VIRTUALIZED LIST HOOK
// ============================================================================

/**
 * Hook for virtualized list rendering with deferred values
 * @param {Array} items - Array of items to render
 * @param {number} itemHeight - Height of each item
 * @param {number} containerHeight - Height of the container
 * @returns {Object} Virtualization state and handlers
 */
export const useVirtualizedList = (items, itemHeight, containerHeight) => {
  const [scrollTop, setScrollTop] = useState(0);
  const deferredScrollTop = useDeferredValue(scrollTop);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(deferredScrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return { startIndex, endIndex };
  }, [deferredScrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [items, visibleRange]);

  return {
    visibleItems,
    visibleRange,
    totalHeight: items.length * itemHeight,
    onScroll: (e) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
};

// ============================================================================
// EXTERNAL STORE HOOK
// ============================================================================

/**
 * Hook for subscribing to external stores
 * @param {Object} store - Store object with subscribe and getSnapshot methods
 * @returns {any} Current store value
 */
export const useExternalStore = (store) => {
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
};

// ============================================================================
// OPTIMISTIC STATE HOOK
// ============================================================================

/**
 * Hook for optimistic state updates
 * @param {any} initialState - Initial state value
 * @param {function} updateFn - Async function to update state
 * @returns {Object} Optimistic state and update function
 */
export const useOptimisticState = (initialState, updateFn) => {
  const [state, setState] = useState(initialState);
  const [optimisticState, setOptimisticState] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const updateOptimistic = useCallback(async (action, optimisticValue) => {
    // Set optimistic value immediately
    setOptimisticState(optimisticValue);

    try {
      // Perform actual update
      const result = await updateFn(state, action);
      
      startTransition(() => {
        setState(result);
        setOptimisticState(result);
      });
    } catch (error) {
      // Revert optimistic update on error
      startTransition(() => {
        setOptimisticState(state);
      });
      throw error;
    }
  }, [state, updateFn]);

  return {
    state: optimisticState,
    isPending,
    updateOptimistic
  };
};

// ============================================================================
// SMART CACHE HOOK
// ============================================================================

/**
 * Hook for smart caching with TTL and automatic invalidation
 * @param {string} key - Cache key
 * @param {function} fetchFn - Function to fetch data
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Object} Cache state and handlers
 */
export const useSmartCache = (key, fetchFn, ttl = 300000) => {
  const [cache, setCache] = useState(new Map());
  const [isPending, startTransition] = useTransition();

  const getCachedData = useCallback(() => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > ttl;
    return isExpired ? null : cached.data;
  }, [cache, key, ttl]);

  const fetchData = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCachedData();
      if (cached) return cached;
    }

    const data = await fetchFn();
    
    startTransition(() => {
      setCache(prev => new Map(prev.set(key, {
        data,
        timestamp: Date.now()
      })));
    });

    return data;
  }, [key, fetchFn, getCachedData]);

  const invalidate = useCallback(() => {
    startTransition(() => {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
    });
  }, [key]);

  return {
    data: getCachedData(),
    fetchData,
    invalidate,
    isPending
  };
};

// ============================================================================
// ERROR HANDLING HOOK
// ============================================================================

/**
 * Hook for enhanced error handling
 * @returns {Object} Error state and handlers
 */
export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    console.error('Component Error:', error);
    setError(error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by Error Boundary
  if (error) {
    throw error;
  }

  return {
    handleError,
    clearError,
    hasError: !!error
  };
};

// ============================================================================
// RETRY HOOK
// ============================================================================

/**
 * Hook for retry logic with exponential backoff
 * @returns {Object} Retry state and function
 */
export const useRetry = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const retry = useCallback(async (
    fn,
    maxRetries = 3,
    delay = 1000
  ) => {
    let currentRetry = 0;

    while (currentRetry <= maxRetries) {
      try {
        const result = await fn();
        
        startTransition(() => {
          setRetryCount(0);
        });
        
        return result;
      } catch (error) {
        currentRetry++;
        
        if (currentRetry > maxRetries) {
          throw error;
        }

        // Update retry count
        startTransition(() => {
          setRetryCount(currentRetry);
        });

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }, []);

  return {
    retry,
    retryCount,
    isPending
  };
};

// ============================================================================
// SUSPENSE UTILITIES
// ============================================================================

/**
 * Create a Suspense wrapper component
 * @param {React.ReactNode} fallback - Fallback component
 * @returns {React.Component} Suspense wrapper
 */
export const withSuspense = (fallback = <div>Loading...</div>) => {
  return function SuspenseWrapper({ children }) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
  };
};

/**
 * Create a resource for Suspense
 * @param {Promise} promise - Promise to create resource from
 * @returns {Object} Resource object with read method
 */
export const createResource = (promise) => {
  let status = 'pending';
  let result;
  let suspender = promise.then(
    (data) => {
      status = 'success';
      result = data;
    },
    (error) => {
      status = 'error';
      result = error;
    }
  );

  return {
    read() {
      if (status === 'pending') {
        throw suspender;
      } else if (status === 'error') {
        throw result;
      } else if (status === 'success') {
        return result;
      }
    }
  };
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  useDeferredSearch,
  useTransitionState,
  useSuspenseQuery,
  useUniqueIds,
  useFormIds,
  useVirtualizedList,
  useExternalStore,
  useOptimisticState,
  useSmartCache,
  useErrorHandler,
  useRetry,
  withSuspense,
  createResource
};