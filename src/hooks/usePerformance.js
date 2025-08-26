
/**
 * Performance Monitoring Hook
 * Track component performance and user interactions
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function usePerformance(componentName) {
    const [metrics, setMetrics] = useState({
        renderCount: 0,
        renderTime: 0,
        mountTime: null
    });
    
    const mountTimeRef = useRef(null);
    const renderStartRef = useRef(null);
    
    useEffect(() => {
        // Track mount time
        mountTimeRef.current = performance.now();
        setMetrics(prev => ({
            ...prev,
            mountTime: mountTimeRef.current
        }));
        
        return () => {
            // Log component unmount
            console.log(`📊 Component ${componentName} unmounted after ${performance.now() - mountTimeRef.current}ms`);
        };
    }, [componentName]);
    
    useEffect(() => {
        // Track render performance
        if (renderStartRef.current) {
            const renderTime = performance.now() - renderStartRef.current;
            setMetrics(prev => ({
                ...prev,
                renderCount: prev.renderCount + 1,
                renderTime: renderTime
            }));
            
            // Log slow renders
            if (renderTime > 16) { // More than one frame
                console.warn(`⚠️ Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
            }
        }
        
        renderStartRef.current = performance.now();
    });
    
    const trackUserAction = useCallback((action, data = {}) => {
        console.log(`👤 User action in ${componentName}:`, { action, data, timestamp: Date.now() });
    }, [componentName]);
    
    const trackError = useCallback((error, context = {}) => {
        console.error(`❌ Error in ${componentName}:`, { error: error.message, context, timestamp: Date.now() });
    }, [componentName]);
    
    return {
        metrics,
        trackUserAction,
        trackError
    };
}

// Performance utilities
export const PerformanceUtils = {
    // Measure component render time
    measureRender: (name, renderFn) => {
        const start = performance.now();
        const result = renderFn();
        const end = performance.now();
        console.log(`🎯 ${name} render time: ${(end - start).toFixed(2)}ms`);
        return result;
    },
    
    // Debounce function for performance optimization
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function for performance optimization
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Memory usage tracking
    trackMemoryUsage: (componentName) => {
        if (performance.memory) {
            const memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
            console.log(`💾 Memory usage in ${componentName}:`, memory);
        }
    }
};

export default usePerformance;
