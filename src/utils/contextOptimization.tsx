
/**
 * Context Optimization Utilities
 * Performance-focused context management
 */

import React, { useMemo, useCallback } from 'react';

/**
 * Optimized context selector
 * Prevents unnecessary re-renders by selecting only needed values
 * @param {React.Context} Context - React context
 * @param {Function} selector - Function to select values from context
 * @returns {*} - Selected context values
 */
export const useOptimizedContext = (Context, selector) => {
  const context = React.useContext(Context);
  
  if (context === undefined) {
    throw new Error('useOptimizedContext must be used within a Provider');
  }
  
  // Memoize selected values to prevent unnecessary re-renders
  const selected = useMemo(() => {
    return selector ? selector(context) : context;
  }, [context, selector]);
  
  return selected;
};

/**
 * Batch context updates
 * Combines multiple context updates into a single operation
 * @param {Function} setContext - Context setter function
 * @returns {Function} - Batch update function
 */
export const useBatchContextUpdate = (setContext) => {
  const batchUpdate = useCallback((updates) => {
    setContext(prev => {
      // Apply all updates at once
      const next = { ...prev };
      Object.keys(updates).forEach(key => {
        next[key] = updates[key];
      });
      return next;
    });
  }, [setContext]);
  
  return batchUpdate;
};

/**
 * Context value memoization
 * Prevents context value from changing unnecessarily
 * @param {Object} value - Context value
 * @returns {Object} - Memoized context value
 */
export const useMemoizedContextValue = (value) => {
  const memoizedValue = useMemo(() => value, Object.values(value));
  return memoizedValue;
};

export default {
  useOptimizedContext,
  useBatchContextUpdate,
  useMemoizedContextValue
};
