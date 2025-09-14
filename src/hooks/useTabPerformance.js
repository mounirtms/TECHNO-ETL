/**
 * useTabPerformance Hook
 * Performance optimization system for tab management
 * 
 * Features:
 * - Tab virtualization for large numbers of tabs
 * - Efficient tab rendering and cleanup
 * - Performance monitoring and metrics
 * - Memory management and garbage collection
 * - Lazy loading and preloading strategies
 * - Frame rate monitoring
 * 
 * @author Techno-ETL Team
 * @version 1.0.0
 */

import { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  useLayoutEffect
} from 'react';
import { debounce, throttle } from 'lodash';

// ===== CONSTANTS =====

const PERFORMANCE_CONSTANTS = {
  // Virtualization thresholds
  VIRTUALIZATION_THRESHOLD: 20,
  VISIBLE_TAB_BUFFER: 5,
  
  // Performance monitoring
  FPS_SAMPLE_SIZE: 60,
  MEMORY_CHECK_INTERVAL: 30000, // 30 seconds
  PERFORMANCE_CHECK_INTERVAL: 1000, // 1 second
  
  // Cleanup thresholds
  INACTIVE_TAB_CLEANUP_DELAY: 300000, // 5 minutes
  MAX_CACHED_TABS: 50,
  
  // Frame rate targets
  TARGET_FPS: 60,
  MIN_ACCEPTABLE_FPS: 30,
  
  // Debounce delays
  RESIZE_DEBOUNCE: 150,
  SCROLL_THROTTLE: 16, // ~60fps
  
  // Memory thresholds (in MB)
  MEMORY_WARNING_THRESHOLD: 100,
  MEMORY_CRITICAL_THRESHOLD: 200
};

// ===== UTILITY FUNCTIONS =====

/**
 * Get memory usage information
 */
const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }
  return null;
};

/**
 * Calculate frame rate
 */
const createFPSMonitor = () => {
  let frames = [];
  let lastTime = performance.now();
  
  const updateFPS = () => {
    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;
    
    frames.push(1000 / delta);
    if (frames.length > PERFORMANCE_CONSTANTS.FPS_SAMPLE_SIZE) {
      frames.shift();
    }
    
    requestAnimationFrame(updateFPS);
  };
  
  const getFPS = () => {
    if (frames.length === 0) return 0;
    return Math.round(frames.reduce((a, b) => a + b) / frames.length);
  };
  
  const getMinFPS = () => {
    if (frames.length === 0) return 0;
    return Math.round(Math.min(...frames));
  };
  
  const getMaxFPS = () => {
    if (frames.length === 0) return 0;
    return Math.round(Math.max(...frames));
  };
  
  updateFPS();
  
  return { getFPS, getMinFPS, getMaxFPS };
};

/**
 * Check if device is low-performance
 */
const isLowPerformanceDevice = () => {
  // Check hardware concurrency
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    return true;
  }
  
  // Check memory
  if (navigator.deviceMemory && navigator.deviceMemory <= 2) {
    return true;
  }
  
  // Check connection
  if (navigator.connection && navigator.connection.effectiveType === 'slow-2g') {
    return true;
  }
  
  return false;
};

// ===== MAIN HOOK =====

/**
 * useTabPerformance Hook
 * 
 * Provides comprehensive tab performance optimization
 */
export const useTabPerformance = (options = {}) => {
  const {
    enableVirtualization = true,
    enablePerformanceMonitoring = true,
    enableMemoryManagement = true,
    enableLazyLoading = true,
    maxCachedTabs = PERFORMANCE_CONSTANTS.MAX_CACHED_TABS,
    virtualizationThreshold = PERFORMANCE_CONSTANTS.VIRTUALIZATION_THRESHOLD,
    onPerformanceWarning = null,
    onMemoryWarning = null
  } = options;

  // State
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    minFPS: 0,
    maxFPS: 0,
    memory: null,
    isLowPerformance: isLowPerformanceDevice(),
    renderTime: 0,
    tabCount: 0,
    activeTabsCount: 0
  });

  const [virtualizedTabs, setVirtualizedTabs] = useState({
    startIndex: 0,
    endIndex: 0,
    visibleTabs: [],
    totalTabs: 0
  });

  const [tabCache, setTabCache] = useState(new Map());
  const [inactiveTabs, setInactiveTabs] = useState(new Set());

  // Refs
  const fpsMonitorRef = useRef(null);
  const performanceIntervalRef = useRef(null);
  const memoryIntervalRef = useRef(null);
  const cleanupTimeoutRef = useRef(null);
  const renderStartTimeRef = useRef(null);

  // Initialize FPS monitor
  useEffect(() => {
    if (enablePerformanceMonitoring) {
      fpsMonitorRef.current = createFPSMonitor();
    }
  }, [enablePerformanceMonitoring]);

  // Performance monitoring
  useEffect(() => {
    if (!enablePerformanceMonitoring) return;

    performanceIntervalRef.current = setInterval(() => {
      const fps = fpsMonitorRef.current?.getFPS() || 0;
      const minFPS = fpsMonitorRef.current?.getMinFPS() || 0;
      const maxFPS = fpsMonitorRef.current?.getMaxFPS() || 0;
      const memory = getMemoryUsage();

      setPerformanceMetrics(prev => ({
        ...prev,
        fps,
        minFPS,
        maxFPS,
        memory
      }));

      // Performance warnings
      if (fps < PERFORMANCE_CONSTANTS.MIN_ACCEPTABLE_FPS) {
        onPerformanceWarning?.({
          type: 'low_fps',
          value: fps,
          threshold: PERFORMANCE_CONSTANTS.MIN_ACCEPTABLE_FPS
        });
      }

      // Memory warnings
      if (memory && memory.used > PERFORMANCE_CONSTANTS.MEMORY_WARNING_THRESHOLD) {
        onMemoryWarning?.({
          type: memory.used > PERFORMANCE_CONSTANTS.MEMORY_CRITICAL_THRESHOLD ? 'critical' : 'warning',
          used: memory.used,
          total: memory.total,
          limit: memory.limit
        });
      }
    }, PERFORMANCE_CONSTANTS.PERFORMANCE_CHECK_INTERVAL);

    return () => {
      if (performanceIntervalRef.current) {
        clearInterval(performanceIntervalRef.current);
      }
    };
  }, [enablePerformanceMonitoring, onPerformanceWarning, onMemoryWarning]);

  // Memory management
  useEffect(() => {
    if (!enableMemoryManagement) return;

    memoryIntervalRef.current = setInterval(() => {
      // Clean up inactive tabs
      const now = Date.now();
      const tabsToRemove = [];

      tabCache.forEach((tabData, tabId) => {
        if (inactiveTabs.has(tabId) && 
            now - tabData.lastAccessed > PERFORMANCE_CONSTANTS.INACTIVE_TAB_CLEANUP_DELAY) {
          tabsToRemove.push(tabId);
        }
      });

      if (tabsToRemove.length > 0) {
        setTabCache(prev => {
          const newCache = new Map(prev);
          tabsToRemove.forEach(tabId => {
            newCache.delete(tabId);
          });
          return newCache;
        });

        setInactiveTabs(prev => {
          const newInactive = new Set(prev);
          tabsToRemove.forEach(tabId => {
            newInactive.delete(tabId);
          });
          return newInactive;
        });
      }

      // Limit cache size
      if (tabCache.size > maxCachedTabs) {
        const sortedTabs = Array.from(tabCache.entries())
          .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
          .slice(0, tabCache.size - maxCachedTabs);

        setTabCache(prev => {
          const newCache = new Map(prev);
          sortedTabs.forEach(([tabId]) => {
            newCache.delete(tabId);
          });
          return newCache;
        });
      }
    }, PERFORMANCE_CONSTANTS.MEMORY_CHECK_INTERVAL);

    return () => {
      if (memoryIntervalRef.current) {
        clearInterval(memoryIntervalRef.current);
      }
    };
  }, [enableMemoryManagement, tabCache, inactiveTabs, maxCachedTabs]);

  // Tab virtualization
  const calculateVirtualizedTabs = useCallback((tabs, containerWidth, tabWidth, scrollPosition) => {
    if (!enableVirtualization || tabs.length < virtualizationThreshold) {
      return {
        startIndex: 0,
        endIndex: tabs.length - 1,
        visibleTabs: tabs,
        totalTabs: tabs.length
      };
    }

    const visibleCount = Math.ceil(containerWidth / tabWidth);
    const startIndex = Math.floor(scrollPosition / tabWidth);
    const endIndex = Math.min(
      tabs.length - 1,
      startIndex + visibleCount + PERFORMANCE_CONSTANTS.VISIBLE_TAB_BUFFER
    );

    const actualStartIndex = Math.max(0, startIndex - PERFORMANCE_CONSTANTS.VISIBLE_TAB_BUFFER);

    return {
      startIndex: actualStartIndex,
      endIndex,
      visibleTabs: tabs.slice(actualStartIndex, endIndex + 1),
      totalTabs: tabs.length
    };
  }, [enableVirtualization, virtualizationThreshold]);

  // Update virtualized tabs
  const updateVirtualizedTabs = useCallback((tabs, containerWidth, tabWidth, scrollPosition) => {
    const newVirtualization = calculateVirtualizedTabs(tabs, containerWidth, tabWidth, scrollPosition);
    setVirtualizedTabs(newVirtualization);
    
    setPerformanceMetrics(prev => ({
      ...prev,
      tabCount: tabs.length,
      activeTabsCount: newVirtualization.visibleTabs.length
    }));
  }, [calculateVirtualizedTabs]);

  // Tab caching
  const cacheTab = useCallback((tabId, tabData) => {
    if (!enableMemoryManagement) return;

    setTabCache(prev => new Map(prev).set(tabId, {
      ...tabData,
      lastAccessed: Date.now(),
      cached: true
    }));

    setInactiveTabs(prev => {
      const newInactive = new Set(prev);
      newInactive.delete(tabId);
      return newInactive;
    });
  }, [enableMemoryManagement]);

  // Mark tab as inactive
  const markTabInactive = useCallback((tabId) => {
    if (!enableMemoryManagement) return;

    setInactiveTabs(prev => new Set(prev).add(tabId));
  }, [enableMemoryManagement]);

  // Get cached tab
  const getCachedTab = useCallback((tabId) => {
    if (!enableMemoryManagement) return null;

    const cachedData = tabCache.get(tabId);
    if (cachedData) {
      // Update last accessed time
      setTabCache(prev => new Map(prev).set(tabId, {
        ...cachedData,
        lastAccessed: Date.now()
      }));
      return cachedData;
    }
    return null;
  }, [enableMemoryManagement, tabCache]);

  // Performance-aware rendering
  const startRender = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  const endRender = useCallback(() => {
    if (renderStartTimeRef.current) {
      const renderTime = performance.now() - renderStartTimeRef.current;
      setPerformanceMetrics(prev => ({
        ...prev,
        renderTime
      }));
      renderStartTimeRef.current = null;
    }
  }, []);

  // Optimized scroll handler
  const createOptimizedScrollHandler = useCallback((handler) => {
    return throttle(handler, PERFORMANCE_CONSTANTS.SCROLL_THROTTLE);
  }, []);

  // Optimized resize handler
  const createOptimizedResizeHandler = useCallback((handler) => {
    return debounce(handler, PERFORMANCE_CONSTANTS.RESIZE_DEBOUNCE);
  }, []);

  // Preload strategy
  const preloadTabs = useCallback((tabIds, priority = 'low') => {
    if (!enableLazyLoading) return;

    const preloadPromises = tabIds.map(tabId => {
      return new Promise((resolve) => {
        const scheduler = priority === 'high' ? requestAnimationFrame : requestIdleCallback;
        scheduler(() => {
          // Simulate tab preloading
          resolve(tabId);
        });
      });
    });

    return Promise.all(preloadPromises);
  }, [enableLazyLoading]);

  // Performance recommendations
  const getPerformanceRecommendations = useCallback(() => {
    const recommendations = [];

    if (performanceMetrics.fps < PERFORMANCE_CONSTANTS.MIN_ACCEPTABLE_FPS) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Low frame rate detected. Consider reducing the number of active tabs.',
        action: 'reduce_tabs'
      });
    }

    if (performanceMetrics.memory && performanceMetrics.memory.used > PERFORMANCE_CONSTANTS.MEMORY_WARNING_THRESHOLD) {
      recommendations.push({
        type: 'memory',
        severity: performanceMetrics.memory.used > PERFORMANCE_CONSTANTS.MEMORY_CRITICAL_THRESHOLD ? 'critical' : 'medium',
        message: 'High memory usage detected. Consider closing unused tabs.',
        action: 'cleanup_tabs'
      });
    }

    if (performanceMetrics.tabCount > virtualizationThreshold && !enableVirtualization) {
      recommendations.push({
        type: 'optimization',
        severity: 'medium',
        message: 'Large number of tabs detected. Enable virtualization for better performance.',
        action: 'enable_virtualization'
      });
    }

    return recommendations;
  }, [performanceMetrics, virtualizationThreshold, enableVirtualization]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (performanceIntervalRef.current) {
        clearInterval(performanceIntervalRef.current);
      }
      if (memoryIntervalRef.current) {
        clearInterval(memoryIntervalRef.current);
      }
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Performance metrics
    performanceMetrics,
    
    // Virtualization
    virtualizedTabs,
    updateVirtualizedTabs,
    
    // Caching
    cacheTab,
    getCachedTab,
    markTabInactive,
    
    // Rendering optimization
    startRender,
    endRender,
    
    // Event handlers
    createOptimizedScrollHandler,
    createOptimizedResizeHandler,
    
    // Preloading
    preloadTabs,
    
    // Recommendations
    getPerformanceRecommendations,
    
    // Configuration
    isVirtualizationEnabled: enableVirtualization && performanceMetrics.tabCount >= virtualizationThreshold,
    shouldUseVirtualization: performanceMetrics.tabCount >= virtualizationThreshold,
    isLowPerformanceMode: performanceMetrics.isLowPerformance || performanceMetrics.fps < PERFORMANCE_CONSTANTS.MIN_ACCEPTABLE_FPS,
    
    // Cache stats
    cacheSize: tabCache.size,
    inactiveTabsCount: inactiveTabs.size
  };
};

export default useTabPerformance;