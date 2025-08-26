
/**
 * Performance Monitor Hook
 * Tracks component render performance and optimization opportunities
 */

import { useEffect, useRef, useCallback, DependencyList } from 'react';

/**
 * Interface for operation function
 */
type OperationFunction<T extends any[], R> = (...args: T) => R;

/**
 * Interface for calculation function
 */
type CalculationFunction<T extends any[], R> = (...args: T) => R;

/**
 * Interface for the return value of usePerformanceMonitor
 */
interface PerformanceMonitorResult {
  renderCount: number;
  measureOperation: <T extends any[], R>(operationName: string, operation: OperationFunction<T, R>) => OperationFunction<T, R>;
  trackExpensiveCalculation: <T extends any[], R>(calculationName: string, calculation: CalculationFunction<T, R>, ...args: T) => R;
/**
 * Performance monitoring hook
 * @param componentName - Name of the component being monitored
 * @param dependencies - Dependencies to track
 * @returns Performance metrics and utilities
 */
export const usePerformanceMonitor = (componentName: string, dependencies: DependencyList = []): PerformanceMonitorResult => {
  const renderCount = useRef<number>(0);
  const renderStartTime = useRef<number>(0);
  const mountTime = useRef<number>(Date.now());
  
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
  const measureOperation = useCallback(<T extends any[], R>(operationName: string, operation: OperationFunction<T, R>): OperationFunction<T, R> => {
    return (...args: T): R => {
      const start = performance.now();
      const result = operation(...args);
      const end = performance.now();
      
      console.log(`⏱️  [${componentName}] ${operationName} took ${(end - start).toFixed(2)}ms`);
      return result;
    };
  }, [componentName]);
  
  // Track expensive calculations
  const trackExpensiveCalculation = useCallback(<T extends any[], R>(calculationName: string, calculation: CalculationFunction<T, R>, ...args: T): R => {
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
