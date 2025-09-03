import { memo, lazy } from 'react';

/**
 * Import optimization utility for better tree-shaking
 */
export const optimizeImports = {
  // Material UI optimization helpers
  mui: {
    components: (components) => {
      // Return only requested components for better tree shaking
      const requested = {};

      components.forEach(name => {
        requested[name] = true;
      });

      return requested;
    },
    
    icons: (icons) => {
      // Return only requested icons for better tree shaking
      const requested = {};

      icons.forEach(name => {
        requested[name] = true;
      });

      return requested;
    },
  },

  // React optimization helpers
  react: {
    memoize: (component) => {
      // Only memoize if props are expensive to compare
      if (component.props && Object.keys(component.props).length > 3) {
        return memo(component);
      }

      return component;
    },
    
    lazyLoad: (importFn) => {
      // Lazy load component with Suspense boundary
      return lazy(() => {
        return importFn().catch(err => {
          console.error('Error lazy loading component:', err);

          return { default: () => null };
        });
      });
    },
  },
};

// Lazy loading helper for routes
export const lazyRoute = (importFn) => {
  return {
    component: lazy(() => importFn()),
    loading: () => <div>Loading...</div>,
  };
};

// Tree-shakeable exports
export const optimizeExports = (exports) => {
  const optimized = {};

  Object.keys(exports).forEach(key => {
    if (exports[key] !== undefined) {
      optimized[key] = exports[key];
    }
  });

  return optimized;
};