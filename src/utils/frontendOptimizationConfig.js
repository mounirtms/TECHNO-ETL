/**
 * Frontend Optimization Configuration
 * Centralized configuration for frontend performance optimizations
 */

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  // Maximum acceptable render time in milliseconds
  MAX_RENDER_TIME: 16, // 60fps target

  // Maximum acceptable bundle size in KB
  MAX_BUNDLE_SIZE: 200,

  // Maximum number of re-renders per second
  MAX_RENDERS_PER_SECOND: 60,

  // Memory usage warning threshold in MB
  MEMORY_WARNING_THRESHOLD: 100,
};

// Component optimization settings
export const COMPONENT_OPTIMIZATION = {
  // Enable/disable component memoization
  ENABLE_MEMOIZATION: true,

  // Enable/disable lazy loading
  ENABLE_LAZY_LOADING: true,

  // Suspense fallback timeout in ms
  SUSPENSE_TIMEOUT: 5000,

  // Component cache size
  COMPONENT_CACHE_SIZE: 50,
};

// Grid optimization settings
export const GRID_OPTIMIZATION = {
  // Enable virtualization for grids with more than this many rows
  VIRTUALIZATION_THRESHOLD: 100,

  // Number of rows to render outside viewport
  OVERSCAN_COUNT: 5,

  // Enable column virtualization
  ENABLE_COLUMN_VIRTUALIZATION: false,

  // Debounce time for grid updates in ms
  UPDATE_DEBOUNCE_TIME: 100,
};

// Context optimization settings
export const CONTEXT_OPTIMIZATION = {
  // Enable context selector optimization
  ENABLE_CONTEXT_SELECTORS: true,

  // Enable context value memoization
  ENABLE_CONTEXT_MEMOIZATION: true,

  // Batch context updates
  ENABLE_BATCH_UPDATES: true,
};

// Caching strategies
export const CACHING_STRATEGIES = {
  // Enable HTTP caching
  ENABLE_HTTP_CACHING: true,

  // Enable component caching
  ENABLE_COMPONENT_CACHING: true,

  // Enable data caching
  ENABLE_DATA_CACHING: true,

  // Cache expiration time in ms
  CACHE_EXPIRATION_TIME: 300000, // 5 minutes

  // Maximum cache size
  MAX_CACHE_SIZE: 100,
};

// Lazy loading configuration
export const LAZY_LOADING_CONFIG = {
  // Intersection observer root margin
  ROOT_MARGIN: '100px',

  // Intersection observer threshold
  THRESHOLD: 0.1,

  // Preload components when idle
  PRELOAD_WHEN_IDLE: true,
};

// Bundle optimization settings
export const BUNDLE_OPTIMIZATION = {
  // Split chunks by component type
  SPLIT_BY_COMPONENT_TYPE: true,

  // Split chunks by route
  SPLIT_BY_ROUTE: true,

  // Enable code splitting
  ENABLE_CODE_SPLITTING: true,

  // Minify CSS
  MINIFY_CSS: true,

  // Remove console logs in production
  REMOVE_CONSOLE_LOGS: true,
};

// Monitoring settings
export const MONITORING_CONFIG = {
  // Enable performance monitoring
  ENABLE_PERFORMANCE_MONITORING: true,

  // Enable error tracking
  ENABLE_ERROR_TRACKING: true,

  // Enable user behavior tracking
  ENABLE_USER_BEHAVIOR_TRACKING: false,

  // Report interval in ms
  REPORT_INTERVAL: 30000,
};

// Export all configurations as a single object
export default {
  PERFORMANCE_THRESHOLDS,
  COMPONENT_OPTIMIZATION,
  GRID_OPTIMIZATION,
  CONTEXT_OPTIMIZATION,
  CACHING_STRATEGIES,
  LAZY_LOADING_CONFIG,
  BUNDLE_OPTIMIZATION,
  MONITORING_CONFIG,
};
