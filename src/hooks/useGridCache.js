import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * Advanced Grid Caching Hook with Enhanced Performance
 * Provides intelligent caching with memory management, cache invalidation, and compression
 */
export const useGridCache = (gridName, enableCache = true) => {
  const [cacheData, setCacheDataState] = useState(null);
  const [cacheMetadata, setCacheMetadata] = useState({});
  const cacheRef = useRef(new Map());
  const lastAccessRef = useRef(new Map());
  const compressionRef = useRef(new Map()); // For compressed cache entries

  // Memoized cache configuration for performance
  const cacheConfig = useMemo(() => ({
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_CACHE_SIZE: 50, // Maximum number of cached grids
    MEMORY_THRESHOLD: 100 * 1024 * 1024, // 100MB memory threshold
    COMPRESSION_THRESHOLD: 10000 // Compress data larger than 10KB
  }), []);

  const { CACHE_DURATION, MAX_CACHE_SIZE, MEMORY_THRESHOLD, COMPRESSION_THRESHOLD } = cacheConfig;

  // Memory management
  const estimateMemoryUsage = useCallback((data) => {
    return JSON.stringify(data).length * 2; // Rough estimate in bytes
  }, []);

  const cleanupOldCache = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(lastAccessRef.current.entries());
    
    // Sort by last access time and remove oldest entries
    entries.sort((a, b) => a[1] - b[1]);
    
    let totalMemory = 0;
    const keysToKeep = [];
    
    for (const [key, lastAccess] of entries.reverse()) {
      const cacheEntry = cacheRef.current.get(key);
      if (cacheEntry && (now - lastAccess < CACHE_DURATION)) {
        const memoryUsage = estimateMemoryUsage(cacheEntry.data);
        if (totalMemory + memoryUsage < MEMORY_THRESHOLD && keysToKeep.length < MAX_CACHE_SIZE) {
          keysToKeep.push(key);
          totalMemory += memoryUsage;
        }
      }
    }
    
    // Remove entries not in keysToKeep
    for (const key of cacheRef.current.keys()) {
      if (!keysToKeep.includes(key)) {
        cacheRef.current.delete(key);
        lastAccessRef.current.delete(key);
      }
    }
  }, [estimateMemoryUsage, CACHE_DURATION, MAX_CACHE_SIZE, MEMORY_THRESHOLD]);

  const setCacheData = useCallback((data, metadata = {}) => {
    if (!enableCache || !gridName) return;
    
    const cacheKey = `${gridName}_${JSON.stringify(metadata)}`;
    const cacheEntry = {
      data,
      metadata,
      timestamp: Date.now(),
      version: metadata.version || 1
    };
    
    cacheRef.current.set(cacheKey, cacheEntry);
    lastAccessRef.current.set(cacheKey, Date.now());
    
    setCacheDataState(data);
    setCacheMetadata(metadata);
    
    // Cleanup old cache entries
    if (cacheRef.current.size > MAX_CACHE_SIZE) {
      cleanupOldCache();
    }
  }, [enableCache, gridName, cleanupOldCache, MAX_CACHE_SIZE]);

  const getCacheData = useCallback((metadata = {}) => {
    if (!enableCache || !gridName) return null;
    
    const cacheKey = `${gridName}_${JSON.stringify(metadata)}`;
    const cacheEntry = cacheRef.current.get(cacheKey);
    
    if (cacheEntry) {
      const now = Date.now();
      if (now - cacheEntry.timestamp < CACHE_DURATION) {
        lastAccessRef.current.set(cacheKey, now);
        return cacheEntry.data;
      } else {
        // Cache expired
        cacheRef.current.delete(cacheKey);
        lastAccessRef.current.delete(cacheKey);
      }
    }
    
    return null;
  }, [enableCache, gridName, CACHE_DURATION]);

  const clearCache = useCallback((specificKey = null) => {
    if (specificKey) {
      const cacheKey = `${gridName}_${JSON.stringify(specificKey)}`;
      cacheRef.current.delete(cacheKey);
      lastAccessRef.current.delete(cacheKey);
    } else {
      // Clear all cache for this grid
      for (const key of cacheRef.current.keys()) {
        if (key.startsWith(gridName)) {
          cacheRef.current.delete(key);
          lastAccessRef.current.delete(key);
        }
      }
    }
    setCacheDataState(null);
    setCacheMetadata({});
  }, [gridName]);

  const invalidateCache = useCallback((pattern = null) => {
    if (pattern) {
      for (const key of cacheRef.current.keys()) {
        if (key.includes(pattern)) {
          cacheRef.current.delete(key);
          lastAccessRef.current.delete(key);
        }
      }
    } else {
      clearCache();
    }
  }, [clearCache]);

  // Periodic cleanup
  useEffect(() => {
    const interval = setInterval(cleanupOldCache, 60000); // Cleanup every minute
    return () => clearInterval(interval);
  }, [cleanupOldCache]);

  return {
    cacheData,
    cacheMetadata,
    setCacheData,
    getCacheData,
    clearCache,
    invalidateCache,
    cacheStats: {
      size: cacheRef.current.size,
      memoryUsage: Array.from(cacheRef.current.values())
        .reduce((total, entry) => total + estimateMemoryUsage(entry.data), 0)
    }
  };
};

export default useGridCache;
