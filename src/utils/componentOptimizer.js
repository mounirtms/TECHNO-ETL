import { memo, lazy, Suspense } from 'react';
import { useEffect, useRef } from 'react';

/**
 * Higher-order component for performance optimization
 */
export const withOptimizations = (Component) => {
  // Add performance monitoring
  const OptimizedComponent = (props) => {
    const renderCount = useRef(0);
    
    useEffect(() => {
      renderCount.current += 1;
      
      if (renderCount.current > 2) {
        console.warn(
          `Component ${Component.displayName || Component.name} re-rendered ${renderCount.current} times. Consider memoization.`
        );
      }
    });

    return <Component {...props} />;
  };

  // Preserve display name for debugging
  OptimizedComponent.displayName = `Optimized(${Component.displayName || Component.name})`;

  // Apply memo
  return memo(OptimizedComponent);
};

/**
 * Create a lazy-loaded component with Suspense
 */
export const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = lazy(importFn);
  
  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Component performance measurement wrapper
 */
export const withPerformanceMonitoring = (Component) => {
  return (props) => {
    const componentName = Component.displayName || Component.name;
    const startTime = performance.now();
    
    useEffect(() => {
      const renderTime = performance.now() - startTime;
      if (renderTime > 16.67) { // 60fps threshold
        console.warn(
          `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    });

    return <Component {...props} />;
  };
};

/**
 * Grid component optimization utilities
 */
export const GridOptimizer = {
  // Optimize grid rendering
  optimizeGridRendering: (gridProps) => ({
    ...gridProps,
    rowBuffer: 10,
    rowHeight: 52,
    headerHeight: 56,
    rowsPerPage: 50,
  }),

  // Optimize column definitions
  optimizeColumns: (columns) => 
    columns.map(col => ({
      ...col,
      sortable: true,
      resizable: true,
      // Add flex by default for better column sizing
      flex: col.flex || 1,
    })),

  // Grid state management
  createOptimizedState: (initialState) => ({
    pageSize: 50,
    sortModel: [],
    filterModel: { items: [] },
    ...initialState,
  }),
};

/**
 * Layout component optimization utilities
 */
export const LayoutOptimizer = {
  // Optimize header height and layout
  headerHeight: window.innerHeight > 900 ? 64 : 56,
  
  // Optimize sidebar width based on screen size
  sidebarWidth: window.innerWidth > 1600 ? 280 : 240,
  
  // Calculate main content area dimensions
  getContentDimensions: () => ({
    height: window.innerHeight - (window.innerHeight > 900 ? 64 : 56),
    width: window.innerWidth - (window.innerWidth > 1600 ? 280 : 240),
  }),
};

/**
 * Apply standard component optimizations
 */
export const optimizeComponent = (Component) => {
  return withOptimizations(
    withPerformanceMonitoring(Component)
  );
};

// Export utility for tree-shakeable imports
export const ComponentOptimizer = {
  withOptimizations,
  createLazyComponent,
  withPerformanceMonitoring,
  GridOptimizer,
  LayoutOptimizer,
  optimizeComponent,
};

export default ComponentOptimizer;