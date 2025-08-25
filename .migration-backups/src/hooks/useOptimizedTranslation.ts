import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Optimized translation hook that prevents excessive re-renders and logging
 * Uses memoization and caching to improve performance
 */
export const useOptimizedTranslation = (enableI18n = true) => {
  const { t } = useTranslation();
  const translationCache = useRef(new Map());
  const errorCache = useRef(new Set());

  // Memoized translation function with caching
  const translate = useCallback((key, fallback = key) => {
    // Return fallback immediately if i18n is disabled
    if (!enableI18n) {
      return fallback;
    }

    // Check cache first
    const cacheKey = `${key}:${fallback}`;
    if (translationCache.current.has(cacheKey)) {
      return translationCache.current.get(cacheKey);
    }

    try {
      const result = t(key, fallback);
      // Cache successful translations
      translationCache.current.set(cacheKey, result);
      return result;
    } catch (error) {
      // Only log unique errors to prevent spam
      if (!errorCache.current.has(key as any)) {
        console.warn(`Translation failed for key: ${key}`, error);
        errorCache.current.add(key as any);
      }
      return fallback;
    }
  }, [t, enableI18n]);

  // Clear cache when language changes (detected by t function change)
  const clearCache = useCallback(() => {
    translationCache.current.clear();
    errorCache.current.clear();
  }, []);

  // Memoized return object to prevent unnecessary re-renders
  return useMemo(() => ({
    translate,
    clearCache,
    t // Original t function for direct use
  }), [translate, clearCache, t]);
};

/**
 * Optimized safe translate function for components
 * Prevents excessive logging and re-renders
 */
export const useSafeTranslate = (enableI18n = true) => {
  const { translate } = useOptimizedTranslation(enableI18n);
  
  // Return memoized translate function
  return useMemo(() => translate, [translate]);
};

export default useOptimizedTranslation;
