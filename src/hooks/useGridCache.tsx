import React from 'react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

/**
 * Grid cache entry metadata interface
 */
interface CacheMetadata {
  version?: number;
  [key: string]: any;
/**
 * Grid cache entry interface
 */
interface CacheEntry<T> {
  data: T;
  metadata: CacheMetadata;
  timestamp: number;
  version: number;
/**
 * Cache stats interface
 */
interface CacheStats {
  size: number;
  memoryUsage: number;
/**
 * Grid cache hook result interface
 */
interface GridCacheResult<T> {
  cacheData: T | null;
  cacheMetadata: CacheMetadata;
  setCacheData: (data: T, metadata?: CacheMetadata) => void;
  getCacheData: (metadata?: CacheMetadata) => T | null;
  clearCache: (specificKey?: CacheMetadata | null) => void;
  invalidateCache: (pattern?: string | null) => void;
  cacheStats: CacheStats;
/**
 * Advanced Grid Caching Hook with Enhanced Performance
 * Provides intelligent caching with memory management, cache invalidation, and compression
 * 
 * @param gridName - Unique identifier for the grid
 * @param enableCache - Flag to enable/disable caching
 * @returns Grid cache operations and state
 */
export const useGridCache = <T extends any>(gridName: string, enableCache: boolean = true): GridCacheResult<T> => {
  const [cacheData, setCacheDataState] = useState<T | null>(null);
  const [cacheMetadata, setCacheMetadata] = useState<CacheMetadata>({});
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const lastAccessRef = useRef<Map<string, number>>(new Map());
  const compressionRef = useRef<Map<string, any>>(new Map()); // For compressed cache entries

  // Memoized cache configuration for performance
  const cacheConfig = useMemo(() => ({
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_CACHE_SIZE: 50, // Maximum number of cached grids
    MEMORY_THRESHOLD: 100 * 1024 * 1024, // 100MB memory threshold
    COMPRESSION_THRESHOLD: 10000 // Compress data larger than 10KB
  }), []);

  const { CACHE_DURATION, MAX_CACHE_SIZE, MEMORY_THRESHOLD, COMPRESSION_THRESHOLD } = cacheConfig;

  // Memory management
  const estimateMemoryUsage = useCallback((data ): number => {
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
        if(totalMemory + memoryUsage < MEMORY_THRESHOLD && keysToKeep.length < MAX_CACHE_SIZE) {
          keysToKeep.push(key);
          totalMemory += memoryUsage;
    // Remove entries not in keysToKeep
    for (const key of cacheRef.current.keys()) {
      if (!keysToKeep.includes(key)) {
        cacheRef.current.delete(key);
        lastAccessRef.current.delete(key);
  }, [estimateMemoryUsage, CACHE_DURATION, MAX_CACHE_SIZE, MEMORY_THRESHOLD]);

  const setCacheData = useCallback((data: T, metadata: CacheMetadata = {}) => {
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
    if(cacheRef.current.size > MAX_CACHE_SIZE) {
      cleanupOldCache();
  }, [enableCache, gridName, cleanupOldCache, MAX_CACHE_SIZE]);

  const getCacheData = useCallback((metadata: CacheMetadata = {}): T | null => {
    if (!enableCache || !gridName) return null;
    
    const cacheKey = `${gridName}_${JSON.stringify(metadata)}`;
    const cacheEntry = cacheRef.current.get(cacheKey);
    
    if(cacheEntry) {
      const now = Date.now();
      if(now - cacheEntry.timestamp < CACHE_DURATION) {
        lastAccessRef.current.set(cacheKey, now);
        return cacheEntry.data;
      } else {
        // Cache expired
        cacheRef.current.delete(cacheKey);
        lastAccessRef.current.delete(cacheKey);
    return null;
  }, [enableCache, gridName, CACHE_DURATION]);

  const clearCache = useCallback((specificKey: CacheMetadata | null = null) => {
    if(specificKey) {
      const cacheKey = `${gridName}_${JSON.stringify(specificKey)}`;
      cacheRef.current.delete(cacheKey);
      lastAccessRef.current.delete(cacheKey);
    } else {
      // Clear all cache for this grid
      for (const key of cacheRef.current.keys()) {
        if (key.startsWith(gridName)) {
          cacheRef.current.delete(key);
          lastAccessRef.current.delete(key);
    setCacheDataState(null);
    setCacheMetadata({});
  }, [gridName]);

  const invalidateCache = useCallback((pattern: string | null = null) => {
    if(pattern) {
      for (const key of cacheRef.current.keys()) {
        if (key.includes(pattern)) {
          cacheRef.current.delete(key);
          lastAccessRef.current.delete(key);
    } else {
      clearCache();
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
        .reduce((total: any entry: any) => total + estimateMemoryUsage(entry.data), 0)
  };
};

export default useGridCache;
