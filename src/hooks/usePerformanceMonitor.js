
/**
 * Performance Monitor Hook
 * Tracks component render performance and optimization opportunities
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Performance monitoring hook
 * @param {string} componentName - Name of the component being monitored
 * @param {Array} dependencies - Dependencies to track
 * @returns {Object} - Performance metrics and utilities
 */
export const usePerformanceMonitor = (componentName, dependencies = []) => {
  const renderCount = useRef(0);
  const renderStartTime = useRef(0);
  const mountTime = useRef(Date.now());
  
  // Track render count and time
  useEffect(() => {
    renderCount.current += 1;
    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      const totalTime = Date.now() - mountTime.current;
      
      console.log(`📊 [${componentName}] Render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
      console.log(`⏱️  [${componentName}] Total lifetime: ${totalTime}ms`);
    };
  });
  
  // Measure specific operations
  const measureOperation = useCallback((operationName, operation) => {
    return (...args) => {
      const start = performance.now();
      const result = operation(...args);
      const end = performance.now();
      
      console.log(`⏱️  [${componentName}] ${operationName} took ${(end - start).toFixed(2)}ms`);
      return result;
    };
  }, [componentName]);
  
  // Track expensive calculations
  const trackExpensiveCalculation = useCallback((calculationName, calculation, ...args) => {
    const start = performance.now();
    const result = calculation(...args);
    const end = performance.now();
    
    console.log(`🧮 [${componentName}] ${calculationName} took ${(end - start).toFixed(2)}ms`);
    return result;
  }, [componentName]);
  
  return {
    renderCount: renderCount.current,
    measureOperation,
    trackExpensiveCalculation
  };
};

export default usePerformanceMonitor;
