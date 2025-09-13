/**
 * Modern Suspense Wrapper Components
 * 
 * Enhanced Suspense components with React 18 features
 * Includes smart loading states, error handling, and performance optimizations
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useTransition,
  useDeferredValue,
  ReactNode,
  ComponentType,
  lazy
} from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Skeleton,
  Typography,
  Card,
  CardContent,
  Fade,
  useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// PROP TYPES AND JSDOC DOCUMENTATION
// ============================================================================

/**
 * @typedef {Object} SuspenseWrapperProps
 * @property {ReactNode} children - Child components to wrap
 * @property {ReactNode} [fallback] - Fallback component during loading
 * @property {number} [delay] - Delay before showing fallback
 * @property {number} [timeout] - Timeout for loading
 * @property {function} [onTimeout] - Callback when timeout occurs
 * @property {boolean} [showProgress] - Whether to show progress indicator
 * @property {'circular'|'linear'|'skeleton'} [progressVariant] - Type of progress indicator
 * @property {boolean} [errorBoundary] - Whether to wrap with error boundary
 */

/**
 * @typedef {Object} LazyLoadProps
 * @property {function} loader - Function that returns a Promise resolving to component
 * @property {Object} [componentProps] - Props to pass to loaded component
 * @property {boolean} [preload] - Whether to preload the component
 */

/**
 * @typedef {Object} ProgressiveLoadingProps
 * @property {Array} stages - Array of loading stages with components
 * @property {function} [onStageChange] - Callback when stage changes
 */

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

/**
 * Circular loading indicator
 */
const CircularLoader = ({ message }) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    p={4}
  >
    <CircularProgress size={40} />
    {message && (
      <Typography variant="body2" color="text.secondary" mt={2}>
        {message}
      </Typography>
    )}
  </Box>
);

/**
 * Linear loading indicator
 */
const LinearLoader = ({ message }) => (
  <Box p={2}>
    {message && (
      <Typography variant="body2" color="text.secondary" mb={1}>
        {message}
      </Typography>
    )}
    <LinearProgress />
  </Box>
);

/**
 * Skeleton loading placeholder
 */
const SkeletonLoader = ({ variant = 'card' }) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'grid':
        return (
          <Box p={2}>
            <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap={2}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} variant="rectangular" height={120} />
              ))}
            </Box>
          </Box>
        );
      
      case 'list':
        return (
          <Box p={2}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box ml={2} flex={1}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            ))}
          </Box>
        );
      
      default: // card
        return (
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {renderSkeleton()}
    </motion.div>
  );
};

// ============================================================================
// ENHANCED SUSPENSE WRAPPER
// ============================================================================

/**
 * Enhanced Suspense wrapper with timeout and progress indication
 */
export const EnhancedSuspense = ({
  children,
  fallback,
  delay = 0,
  timeout = 10000,
  onTimeout,
  showProgress = true,
  progressVariant = 'circular'
}) => {
  const [isDelayed, setIsDelayed] = useState(delay > 0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isPending, startTransition] = useTransition();
  const theme = useTheme();

  // Handle delay
  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        startTransition(() => {
          setIsDelayed(false);
        });
      }, delay);

      return () => clearTimeout(delayTimer);
    }
  }, [delay]);

  // Handle timeout
  useEffect(() => {
    if (timeout > 0) {
      const timeoutTimer = setTimeout(() => {
        setIsTimedOut(true);
        onTimeout?.();
      }, timeout);

      return () => clearTimeout(timeoutTimer);
    }
  }, [timeout, onTimeout]);

  // Default fallback based on progress variant
  const defaultFallback = useMemo(() => {
    if (!showProgress) return null;

    switch (progressVariant) {
      case 'linear':
        return <LinearLoader message="Loading component..." />;
      case 'skeleton':
        return <SkeletonLoader />;
      default:
        return <CircularLoader message="Loading..." />;
    }
  }, [showProgress, progressVariant]);

  // Don't render anything during delay period
  if (isDelayed) {
    return null;
  }

  // Show timeout message
  if (isTimedOut) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        color="error.main"
      >
        <Typography variant="h6" gutterBottom>
          Loading timeout
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The component is taking longer than expected to load.
        </Typography>
      </Box>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={fallback || defaultFallback}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </Suspense>
    </AnimatePresence>
  );
};

// ============================================================================
// LAZY COMPONENT LOADER
// ============================================================================

/**
 * Smart lazy component loader with preloading
 */
export const LazyComponent = ({
  loader,
  componentProps = {},
  preload = false,
  ...suspenseProps
}) => {
  const [LazyComp, setLazyComp] = useState(null);
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Preload component if requested
  useEffect(() => {
    if (preload && !isPreloaded) {
      loader().then(module => {
        setLazyComp(() => module.default);
        setIsPreloaded(true);
      });
    }
  }, [preload, loader, isPreloaded]);

  // Create lazy component
  const Component = useMemo(() => {
    if (LazyComp) {
      return LazyComp;
    }
    return lazy(loader);
  }, [LazyComp, loader]);

  return (
    <EnhancedSuspense {...suspenseProps}>
      <Component {...componentProps} />
    </EnhancedSuspense>
  );
};

// ============================================================================
// PROGRESSIVE LOADING
// ============================================================================

/**
 * Progressive loading for multi-stage components
 */
export const ProgressiveLoader = ({
  stages,
  onStageChange
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleStageComplete = useCallback(() => {
    if (currentStage < stages.length - 1) {
      startTransition(() => {
        const nextStage = currentStage + 1;
        setCurrentStage(nextStage);
        onStageChange?.(nextStage);
      });
    }
  }, [currentStage, stages.length, onStageChange]);

  const currentStageConfig = stages[currentStage];

  if (!currentStageConfig) {
    return null;
  }

  const Component = lazy(currentStageConfig.component);

  return (
    <EnhancedSuspense
      fallback={currentStageConfig.fallback || <CircularLoader />}
      delay={currentStageConfig.delay}
    >
      <Component onLoadComplete={handleStageComplete} />
    </EnhancedSuspense>
  );
};

// ============================================================================
// SMART SUSPENSE WITH RETRY
// ============================================================================

/**
 * Suspense wrapper with retry capability
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @param {ReactNode} [props.fallback] - Fallback component
 * @param {number} [props.maxRetries=3] - Maximum retry attempts
 * @param {number} [props.retryDelay=1000] - Delay between retries
 * @param {function} [props.onRetry] - Retry callback
 * @returns {React.Component} RetryableSuspense component
 */
export const RetryableSuspense = ({
  children,
  fallback,
  maxRetries = 3,
  retryDelay = 1000,
  onRetry
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [key, setKey] = useState(0);

  const handleRetry = useCallback(() => {
    if (retryCount < maxRetries) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setKey(prev => prev + 1);
      onRetry?.(newRetryCount);
      
      // Delay before retry
      setTimeout(() => {
        // Retry logic here
      }, retryDelay * newRetryCount);
    }
  }, [retryCount, maxRetries, retryDelay, onRetry]);

  return (
    <EnhancedSuspense
      key={key}
      fallback={fallback}
      onTimeout={handleRetry}
    >
      {children}
    </EnhancedSuspense>
  );
};

// ============================================================================
// PRELOADER
// ============================================================================

/**
 * Component preloader utility
 */
export class ComponentPreloader {
  static cache = new Map();

  static preload(key, loader) {
    if (!this.cache.has(key)) {
      this.cache.set(key, loader());
    }
    return this.cache.get(key);
  }

  static get(key) {
    return this.cache.get(key) || null;
  }

  static clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for managing component preloading
 */
export const usePreloader = () => {
  const preload = useCallback((key, loader) => {
    return ComponentPreloader.preload(key, loader);
  }, []);

  const getPreloaded = useCallback((key) => {
    return ComponentPreloader.get(key);
  }, []);

  const clearPreloaded = useCallback((key) => {
    ComponentPreloader.clear(key);
  }, []);

  return {
    preload,
    getPreloaded,
    clearPreloaded
  };
};

/**
 * Hook for creating smart lazy components
 * @param {function} loader - Component loader function
 * @param {Object} options - Configuration options
 * @returns {React.LazyExoticComponent} Lazy component
 */
export const useLazyComponent = (
  loader,
  options = {}
) => {
  const { preload = false, key } = options;
  const { preload: preloadFn, getPreloaded } = usePreloader();

  const Component = useMemo(() => {
    if (key && preload) {
      preloadFn(key, loader);
    }
    return lazy(loader);
  }, [loader, key, preload, preloadFn]);

  return Component;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default EnhancedSuspense;
export { EnhancedSuspense as SuspenseWrapper };