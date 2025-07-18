import { useRef, useEffect } from 'react';

/**
 * Performance monitoring hook to track component re-renders
 * Helps identify performance bottlenecks in development
 */
export const usePerformanceMonitor = (componentName, props = {}) => {
  const renderCount = useRef(0);
  const prevProps = useRef(props);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      const now = Date.now();
      const timeSinceLastRender = now - startTime.current;
      
      // Log excessive re-renders (more than 10 in 5 seconds)
      if (renderCount.current > 10 && timeSinceLastRender < 5000) {
        console.warn(
          `🚨 Performance Warning: ${componentName} has re-rendered ${renderCount.current} times in ${timeSinceLastRender}ms`,
          {
            component: componentName,
            renderCount: renderCount.current,
            timeSinceStart: timeSinceLastRender,
            currentProps: props,
            previousProps: prevProps.current
          }
        );
      }
      
      // Reset counter every 10 seconds
      if (timeSinceLastRender > 10000) {
        renderCount.current = 1;
        startTime.current = now;
      }
    }
    
    prevProps.current = props;
  });

  return {
    renderCount: renderCount.current,
    resetCounter: () => {
      renderCount.current = 0;
      startTime.current = Date.now();
    }
  };
};

/**
 * Hook to track specific prop changes that cause re-renders
 */
export const usePropChangeTracker = (componentName, props) => {
  const prevProps = useRef(props);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const changedProps = {};
      
      Object.keys(props).forEach(key => {
        if (prevProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log(`🔄 ${componentName} re-rendered due to prop changes:`, changedProps);
      }
    }
    
    prevProps.current = props;
  });
};

/**
 * Hook to measure component render time
 */
export const useRenderTime = (componentName) => {
  const startTime = useRef(0);
  
  // Mark start of render
  startTime.current = performance.now();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const endTime = performance.now();
      const renderTime = endTime - startTime.current;
      
      // Log slow renders (> 16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`⏱️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    }
  });
};

/**
 * Debounced logging to prevent console spam
 */
const createDebouncedLogger = (delay = 1000) => {
  const logQueue = new Map();
  
  return (key, message, data) => {
    if (logQueue.has(key)) {
      clearTimeout(logQueue.get(key));
    }
    
    logQueue.set(key, setTimeout(() => {
      console.log(message, data);
      logQueue.delete(key);
    }, delay));
  };
};

export const debouncedLog = createDebouncedLogger();

/**
 * Hook to track memory usage (Chrome DevTools only)
 */
export const useMemoryMonitor = (componentName) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        
        // Log high memory usage
        if (usedMB > 100) {
          debouncedLog(
            `memory-${componentName}`,
            `💾 High memory usage in ${componentName}:`,
            { usedMB, totalMB, percentage: Math.round((usedMB / totalMB) * 100) }
          );
        }
      };
      
      const interval = setInterval(checkMemory, 5000);
      return () => clearInterval(interval);
    }
  }, [componentName]);
};

export default usePerformanceMonitor;
