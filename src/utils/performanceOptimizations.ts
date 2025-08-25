/**
 * Performance Optimization Utilities for TECHNO-ETL
 * Provides caching, debouncing, memoization, and other performance enhancements
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';

/**
 * Smart caching utility with TTL and memory management
 */
class SmartCache {
  private cache = new Map();
  private timers = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxSize = 100;

  set(key: string, value ttl?: number): void {
    // Clear old timer if exists
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.delete(firstKey);
    }

    // Set new value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl || this.defaultTTL);

    this.timers.set(key, timer);
  }

  get(key: string): any {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  delete(key: string): boolean {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.cache.delete(key);
  }

  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instance
export const globalCache = new SmartCache();

/**
 * Debounced function hook
 */
export const useDebounce = (callback: Function, delay: number) => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: any[]) => {
    if(debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

/**
 * Throttled function hook
 */
export const useThrottle = (callback: Function, delay: number) => {
  const lastRun = useRef(Date.now());

  return useCallback((...args: any[]) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args);
      lastRun.current = Date.now();
    }
  }, [callback, delay]);
};

/**
 * Memoized async function hook with cache
 */
export const useMemoizedAsync: any = <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  deps: any[],
  cacheKey?: string
) => {
  return useMemo(() => {
    const key = cacheKey || `async-${JSON.stringify(deps)}`;
    const cached = globalCache.get(key);
    
    if(cached) {
      return Promise.resolve(cached);
    }

    return asyncFunction(...deps).then(result => {
      globalCache.set(key, result, 2 * 60 * 1000); // 2 minutes TTL
      return result;
    });
  }, deps);
};

/**
 * Smart lazy loading hook
 */
export const useLazyLoad = (callback: Function, options = { threshold: 0.1 }) => {
  const elementRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if(entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          callback();
        }
      },
      { threshold: options.threshold }
    );

    if(elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if(elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [callback, hasLoaded, options.threshold]);

  return { elementRef, isVisible, hasLoaded };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if(renderTime > 100) {
      console.warn(`🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    } else if(renderTime > 50) {
      console.log(`⚡ ${componentName} rendered in ${renderTime.toFixed(2)}ms`);
    }
  });

  return startTime.current;
};

/**
 * Memory usage optimization
 */
export const optimizeMemory = () => {
  // Clear cache if memory usage is high
  if (globalCache.size() > 50) {
    const stats = globalCache.getStats();
    console.log('📊 Cache stats before cleanup:', stats);
    globalCache.clear();
    console.log('🧹 Cache cleared due to memory optimization');
  }

  // Run garbage collection if available
  if(window.gc && typeof window.gc === 'function') {
    window.gc();
    console.log('🗑️ Manual garbage collection triggered');
  }
};

/**
 * Batch operations for better performance
 */
export class BatchProcessor<T> {
  private batch: T[] = [];
  private batchSize: number;
  private timeout: number;
  private timer?: NodeJS.Timeout;
  private processor: (items: T[]) => Promise<void> | void;

  constructor(
    processor: (items: T[]) => Promise<void> | void,
    batchSize
    timeout
  }

  add(item: T): void {
    this.batch.push(item);

    if(this.batch.length >= this.batchSize) {
      this.processBatch();
    } else if(!this.timer) {
      this.timer = setTimeout(() => {
        this.processBatch();
      }, this.timeout);
    }
  }

  private async processBatch(): Promise<void> {
    if(this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }

    if (this.batch.length ===0) return;

    const items = [...this.batch];
    this.batch = [];

    try {
      await this.processor(items);
    } catch(error: any) {
      console.error('❌ Batch processing error:', error);
    }
  }

  flush(): Promise<void> {
    return this.processBatch();
  }
}

/**
 * Image optimization utilities
 */
export const optimizeImage = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if(!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const { width = img.width, height = img.height, quality = 0.8 } = options;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const format = options.format === 'webp' ? 'image/webp' : 
                    options.format = == "png" ? 'image/png' : 'image/jpeg';
      
      const optimizedUrl = canvas.toDataURL(format, quality);
      resolve(optimizedUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
};

/**
 * Resource preloader
 */
export const preloadResources = (resources: string[]): Promise<void[]> => {
  const loadResource = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (url.match(/\.(css)$/i)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = url;
        link.onload = () => resolve();
        link.onerror = reject;
        document.head.appendChild(link);
      } else if (url.match(/\.(js)$/i)) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      } else if (url.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
      } else {
        // Generic fetch for other resources
        fetch(url)
          .then(() => resolve())
          .catch(reject);
      }
    });
  };

  return Promise.all(resources.map(loadResource));
};

/**
 * Bundle analyzer helper
 */
export const analyzeBundleSize = () => {
  if(process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    console.log('📦 Bundle Analysis:');
    console.log('Scripts:', scripts.length);
    console.log('Stylesheets:', styles.length);
    
    // Estimate total size (rough approximation)
    let totalEstimated = 0;
    scripts.forEach((script) => {
      if((script as HTMLScriptElement)?.src) {
        // This is a rough estimation
        totalEstimated += 100; // Assume 100KB per script (very rough)
      }
    });
    
    console.log(`📊 Estimated bundle size: ${totalEstimated}KB`);
  }
};

export default {
  globalCache,
  useDebounce,
  useThrottle,
  useMemoizedAsync,
  useLazyLoad,
  usePerformanceMonitor,
  optimizeMemory,
  BatchProcessor,
  optimizeImage,
  preloadResources,
  analyzeBundleSize
};
