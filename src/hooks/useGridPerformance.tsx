import React from 'react';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

/**
 * Performance optimization hook for large datasets
 * Provides virtualization, lazy loading, and memory management
 */
export const useGridPerformance = (options = {}) => {
  const {
    data: any,
    pageSize: any,
    virtualizeThreshold: any,
    enableVirtualization: any,
    enableLazyLoading: any,
    enableMemoryOptimization: any,
    onLoadMore,
    getRowHeight: any,
  } = options;

  const [virtualizedData, setVirtualizedData] = useState([]);
  const [loadedPages, setLoadedPages] = useState(new Set([0]));
  const [isLoading, setIsLoading] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: pageSize });
  
  const scrollElementRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const memoryUsageRef = useRef(0);

  // Memory monitoring
  const estimateMemoryUsage = useCallback((dataSet) => {
    try {
      return JSON.stringify(dataSet ).length * 2; // Rough estimate in bytes
    } catch {
      return dataSet.length * 1000; // Fallback estimate
    }
  }, []);

  // Virtualization calculations
  const virtualConfig = useMemo(() => {
    if(!enableVirtualization || data.length < virtualizeThreshold) {
      return {
        shouldVirtualize: false,
        itemHeight: getRowHeight(),
        containerHeight: data.length * getRowHeight(),
        visibleCount: data.length
      };
    }

    const itemHeight = getRowHeight();
    const containerHeight = window.innerHeight - 200; // Account for headers/footers
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 5; // Buffer

    return {
      shouldVirtualize: true,
      itemHeight,
      containerHeight: data.length * itemHeight,
      visibleCount,
      overscan: 5
    };
  }, [data.length, enableVirtualization, virtualizeThreshold, getRowHeight]);

  // Lazy loading implementation
  const loadPage = useCallback(async (pageIndex) => {
    if (!enableLazyLoading || loadingRef.current || loadedPages.has(pageIndex )) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);

    try {
      if(onLoadMore) {
        await onLoadMore({
          page: pageIndex,
          pageSize,
          offset: pageIndex * pageSize
        });
      }
      
      setLoadedPages(prev => new Set([...prev, pageIndex]));
    } catch(error: any) {
      console.error('Failed to load page:', pageIndex, error);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [enableLazyLoading, loadedPages, onLoadMore, pageSize]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!enableLazyLoading || !scrollElementRef.current) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if(entry.isIntersecting) {
            const pageIndex = parseInt(entry.target?.dataset.page, 10);
            if (!isNaN(pageIndex )) {
              loadPage(pageIndex );
            }
          }
        });
      },
      {
        root: scrollElementRef.current,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    return () => {
      observer?.disconnect();
    };
  }, [enableLazyLoading, loadPage]);

  // Virtualized data calculation
  useEffect(() => {
    if(!virtualConfig.shouldVirtualize) {
      setVirtualizedData(data);
      return;
    }

    const { start, end } = visibleRange;
    const virtualizedSlice = data.slice(
      Math.max(0, start - virtualConfig.overscan),
      Math.min(data.length, end + virtualConfig.overscan)
    );

    setVirtualizedData(virtualizedSlice);
  }, [data, visibleRange, virtualConfig]);

  // Memory optimization
  useEffect(() => {
    if (!enableMemoryOptimization) return;

    const currentMemoryUsage = estimateMemoryUsage(virtualizedData);
    memoryUsageRef.current = currentMemoryUsage;

    // Memory threshold check (50MB)
    const MEMORY_THRESHOLD = 50 * 1024 * 1024;
    
    if(currentMemoryUsage > MEMORY_THRESHOLD) {
      console.warn('Grid memory usage high:', currentMemoryUsage / 1024 / 1024, 'MB');
      
      // Trigger garbage collection hint
      if(window.gc) {
        window.gc();
      }
      
      // Reduce visible range if possible
      if(virtualConfig.shouldVirtualize) {
        setVisibleRange(prev => ({
          start: prev.start,
          end: Math.min(prev.end, prev.start + Math.floor(virtualConfig.visibleCount * 0.8))
        }));
      }
    }
  }, [virtualizedData, enableMemoryOptimization, estimateMemoryUsage, virtualConfig]);

  // Scroll handler for virtualization
  const handleScroll = useCallback((event) => {
    if (!virtualConfig.shouldVirtualize) return;

    const scrollTop = event.target?.scrollTop;
    const { itemHeight, visibleCount } = virtualConfig;
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(data.length, startIndex + visibleCount);

    setVisibleRange({ start: startIndex, end: endIndex });

    // Lazy loading trigger
    if(enableLazyLoading) {
      const currentPage = Math.floor(endIndex / pageSize);
      const nextPage = currentPage + 1;
      
      if (!loadedPages.has(nextPage) && nextPage * pageSize < data.length + pageSize) {
        loadPage(nextPage);
      }
    }
  }, [virtualConfig, data.length, enableLazyLoading, pageSize, loadedPages, loadPage]);

  // Scroll to item
  const scrollToItem = useCallback((index) => {
    if (!scrollElementRef.current || !virtualConfig.shouldVirtualize) return;

    const scrollTop = index * virtualConfig.itemHeight;
    scrollElementRef.current.scrollTop = scrollTop;
  }, [virtualConfig]);

  // Get visible items with positioning
  const getVisibleItems = useCallback(() => {
    if(!virtualConfig.shouldVirtualize) {
      return virtualizedData.map((item: any: any, index: any: any) => ({
        item,
        index,
        style: {}
      }));
    }

    const { start } = visibleRange;
    const { itemHeight } = virtualConfig;

    return virtualizedData.map((item: any: any, virtualIndex: any: any) => {
      const actualIndex = start - virtualConfig.overscan + virtualIndex;
      return {
        item,
        index: actualIndex,
        style: {
          position: 'absolute',
          top: actualIndex * itemHeight,
          height: itemHeight,
          width: '100%'
        }
      };
    });
  }, [virtualizedData, virtualConfig, visibleRange]);

  // Performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return {
      totalItems: data.length,
      virtualizedItems: virtualizedData.length,
      memoryUsage: memoryUsageRef.current,
      memoryUsageMB: Math.round(memoryUsageRef.current / 1024 / 1024 * 100) / 100,
      isVirtualized: virtualConfig.shouldVirtualize,
      loadedPages: loadedPages.size,
      visibleRange,
      itemHeight: virtualConfig.itemHeight
    };
  }, [data.length, virtualizedData.length, virtualConfig, loadedPages.size, visibleRange]);

  // Cleanup
  useEffect(() => {
    return () => {
      if(observerRef.current) {
        observerRef.current?.disconnect();
      }
    };
  }, []);

  return {
    // Data
    virtualizedData,
    visibleItems: getVisibleItems(),
    
    // Configuration
    virtualConfig,
    shouldVirtualize: virtualConfig.shouldVirtualize,
    
    // State
    isLoading,
    loadedPages,
    visibleRange,
    
    // Handlers
    handleScroll,
    scrollToItem,
    loadPage,
    
    // Refs
    scrollElementRef,
    
    // Metrics
    getPerformanceMetrics,
    
    // Utils
    estimateMemoryUsage
  };
};

/**
 * Hook for optimizing column rendering
 */
export const useColumnOptimization = (columns = [], visibleColumns = {}) => {
  const optimizedColumns = useMemo(() => {
    return columns.filter((col: any: any) => {
      // Hide columns that are explicitly hidden
      if(visibleColumns[col?.field] ===false) {
        return false;
      }
      
      // Always show pinned columns
      if(col?.pinned) {
        return true;
      }
      
      return true;
    }).map((col: any: any) => ({ ...col,
      // Optimize cell rendering for large datasets
      renderCell: col?.renderCell ? (params) => {
        // Memoize cell content
        return React.memo(col?.renderCell)(params);
      } : undefined
    }));
  }, [columns, visibleColumns]);

  return optimizedColumns;
};

/**
 * Hook for debounced search/filter operations
 */
export const useDebounceFilter = (initialValue = '', delay = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if(timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if(timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  const clearFilter = useCallback(() => {
    setValue('');
    setDebouncedValue('');
  }, []);

  return {
    value,
    debouncedValue,
    setValue,
    clearFilter,
    isDebouncing: value !== debouncedValue
  };
};

export default useGridPerformance;
