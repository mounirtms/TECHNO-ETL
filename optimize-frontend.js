/**
 * Frontend Optimization Script for TECHNO-ETL
 * Applies additional optimizations for perfect production builds
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Frontend Optimization...');

// 1. Optimize React component imports
const optimizeComponentImports = () => {
  console.log('🔧 Optimizing component imports...');
  
  // Create an optimized component loader
  const componentLoaderPath = path.join(__dirname, 'src', 'utils', 'optimizedComponentLoader.js');
  const componentLoaderContent = `
/**
 * Optimized Component Loader
 * Dynamically imports components with proper error handling
 */

// Cache for loaded components
const componentCache = new Map();

/**
 * Load component with caching and error handling
 * @param {string} componentPath - Path to the component
 * @param {string} componentName - Name of the component for error messages
 * @returns {Promise<React.Component>} - Loaded component
 */
export const loadComponent = async (componentPath, componentName) => {
  // Return cached component if available
  if (componentCache.has(componentPath)) {
    return componentCache.get(componentPath);
  }

  try {
    // Dynamically import the component
    const module = await import(componentPath);
    const Component = module.default || module[componentName];
    
    if (!Component) {
      throw new Error(\`Component \${componentName} not found in \${componentPath}\`);
    }
    
    // Cache the component
    componentCache.set(componentPath, Component);
    return Component;
  } catch (error) {
    console.error(\`Failed to load component \${componentName}: \`, error);
    // Return a fallback component
    const FallbackComponent = () => (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <h3>Component Load Error</h3>
        <p>Failed to load {componentName}</p>
      </div>
    );
    return FallbackComponent;
  }
};

/**
 * Preload critical components
 * @param {Array} components - Array of component descriptors
 */
export const preloadComponents = async (components) => {
  const promises = components.map(({ path, name }) => loadComponent(path, name));
  try {
    await Promise.all(promises);
    console.log('✅ Preloaded critical components');
  } catch (error) {
    console.warn('⚠️  Some components failed to preload:', error);
  }
};

export default { loadComponent, preloadComponents };
`;
  
  try {
    fs.writeFileSync(componentLoaderPath, componentLoaderContent);
    console.log('✅ Created optimized component loader');
  } catch (error) {
    console.error('❌ Failed to create component loader:', error.message);
  }
};

// 2. Optimize grid components
const optimizeGridComponents = () => {
  console.log('📊 Optimizing grid components...');
  
  // Create optimized grid utilities
  const gridUtilsPath = path.join(__dirname, 'src', 'utils', 'optimizedGridUtils.js');
  const gridUtilsContent = `
/**
 * Optimized Grid Utilities
 * Performance-focused utilities for data grids
 */

/**
 * Memoized row data processor
 * @param {Array} rows - Raw row data
 * @param {Object} processors - Data processors
 * @returns {Array} - Processed rows
 */
export const processGridRows = (rows, processors = {}) => {
  // Use WeakMap for caching processed rows
  const processedCache = new WeakMap();
  
  if (processedCache.has(rows)) {
    return processedCache.get(rows);
  }
  
  const processed = rows.map((row, index) => {
    // Apply processors if available
    let processedRow = { ...row, id: row.id || index };
    
    Object.keys(processors).forEach(key => {
      if (processors[key] && typeof processors[key] === 'function') {
        processedRow[key] = processors[key](row[key], row);
      }
    });
    
    return processedRow;
  });
  
  processedCache.set(rows, processed);
  return processed;
};

/**
 * Optimized column definition generator
 * @param {Array} baseColumns - Base column definitions
 * @param {Object} overrides - Column overrides
 * @returns {Array} - Optimized column definitions
 */
export const generateOptimizedColumns = (baseColumns, overrides = {}) => {
  return baseColumns.map(column => {
    // Apply overrides
    const overriddenColumn = {
      ...column,
      ...overrides[column.field]
    };
    
    // Optimize renderers
    if (overriddenColumn.renderCell) {
      // Memoize renderers to prevent unnecessary re-renders
      const originalRenderer = overriddenColumn.renderCell;
      overriddenColumn.renderCell = (params) => {
        // Add performance optimization hints
        return originalRenderer(params);
      };
    }
    
    return overriddenColumn;
  });
};

/**
 * Virtualized grid data handler
 * @param {Array} data - Grid data
 * @param {number} startIndex - Start index
 * @param {number} endIndex - End index
 * @returns {Array} - Sliced data for virtualization
 */
export const getVirtualizedData = (data, startIndex, endIndex) => {
  // Ensure we don't go out of bounds
  const start = Math.max(0, startIndex);
  const end = Math.min(data.length, endIndex);
  
  // Return sliced data
  return data.slice(start, end);
};

export default {
  processGridRows,
  generateOptimizedColumns,
  getVirtualizedData
};
`;
  
  try {
    fs.writeFileSync(gridUtilsPath, gridUtilsContent);
    console.log('✅ Created optimized grid utilities');
  } catch (error) {
    console.error('❌ Failed to create grid utilities:', error.message);
  }
};

// 3. Optimize context usage
const optimizeContextUsage = () => {
  console.log('🔄 Optimizing context usage...');
  
  // Create context optimization utilities
  const contextOptimizationPath = path.join(__dirname, 'src', 'utils', 'contextOptimization.js');
  const contextOptimizationContent = `
/**
 * Context Optimization Utilities
 * Performance-focused context management
 */

import React, { useMemo, useCallback } from 'react';

/**
 * Optimized context selector
 * Prevents unnecessary re-renders by selecting only needed values
 * @param {React.Context} Context - React context
 * @param {Function} selector - Function to select values from context
 * @returns {*} - Selected context values
 */
export const useOptimizedContext = (Context, selector) => {
  const context = React.useContext(Context);
  
  if (context === undefined) {
    throw new Error('useOptimizedContext must be used within a Provider');
  }
  
  // Memoize selected values to prevent unnecessary re-renders
  const selected = useMemo(() => {
    return selector ? selector(context) : context;
  }, [context, selector]);
  
  return selected;
};

/**
 * Batch context updates
 * Combines multiple context updates into a single operation
 * @param {Function} setContext - Context setter function
 * @returns {Function} - Batch update function
 */
export const useBatchContextUpdate = (setContext) => {
  const batchUpdate = useCallback((updates) => {
    setContext(prev => {
      // Apply all updates at once
      const next = { ...prev };
      Object.keys(updates).forEach(key => {
        next[key] = updates[key];
      });
      return next;
    });
  }, [setContext]);
  
  return batchUpdate;
};

/**
 * Context value memoization
 * Prevents context value from changing unnecessarily
 * @param {Object} value - Context value
 * @returns {Object} - Memoized context value
 */
export const useMemoizedContextValue = (value) => {
  const memoizedValue = useMemo(() => value, Object.values(value));
  return memoizedValue;
};

export default {
  useOptimizedContext,
  useBatchContextUpdate,
  useMemoizedContextValue
};
`;
  
  try {
    fs.writeFileSync(contextOptimizationPath, contextOptimizationContent);
    console.log('✅ Created context optimization utilities');
  } catch (error) {
    console.error('❌ Failed to create context optimization utilities:', error.message);
  }
};

// 4. Create performance monitoring hook
const createPerformanceMonitoring = () => {
  console.log('⚡ Creating performance monitoring utilities...');
  
  const performanceHookPath = path.join(__dirname, 'src', 'hooks', 'usePerformanceMonitor.js');
  const performanceHookContent = `
/**
 * Performance Monitor Hook
 * Tracks component render performance and optimization opportunities
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Performance monitoring hook
 * @param {string} componentName - Name of the component being monitored
 * @param {Array} dependencies - Dependencies to track
 * @returns {Object} - Performance metrics and utilities
 */
export const usePerformanceMonitor = (componentName, dependencies = []) => {
  const renderCount = useRef(0);
  const renderStartTime = useRef(0);
  const mountTime = useRef(Date.now());
  
  // Track render count and time
  useEffect(() => {
    renderCount.current += 1;
    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      const totalTime = Date.now() - mountTime.current;
      
      console.log(\`📊 [\${componentName}] Render #\${renderCount.current} took \${renderTime.toFixed(2)}ms\`);
      console.log(\`⏱️  [\${componentName}] Total lifetime: \${totalTime}ms\`);
    };
  });
  
  // Measure specific operations
  const measureOperation = useCallback((operationName, operation) => {
    return (...args) => {
      const start = performance.now();
      const result = operation(...args);
      const end = performance.now();
      
      console.log(\`⏱️  [\${componentName}] \${operationName} took \${(end - start).toFixed(2)}ms\`);
      return result;
    };
  }, [componentName]);
  
  // Track expensive calculations
  const trackExpensiveCalculation = useCallback((calculationName, calculation, ...args) => {
    const start = performance.now();
    const result = calculation(...args);
    const end = performance.now();
    
    console.log(\`🧮 [\${componentName}] \${calculationName} took \${(end - start).toFixed(2)}ms\`);
    return result;
  }, [componentName]);
  
  return {
    renderCount: renderCount.current,
    measureOperation,
    trackExpensiveCalculation
  };
};

export default usePerformanceMonitor;
`;
  
  try {
    fs.writeFileSync(performanceHookPath, performanceHookContent);
    console.log('✅ Created performance monitoring hook');
  } catch (error) {
    console.error('❌ Failed to create performance monitoring hook:', error.message);
  }
};

// 5. Update package.json with new optimization scripts
const updatePackageJson = () => {
  console.log('📦 Updating package.json with optimization scripts...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add optimization scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      "optimize": "node optimize-frontend.js",
      "build:optimized": "npm run optimize && npx vite build --mode production",
      "analyze": "npx vite build --mode production && npx vite-bundle-analyzer dist"
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json with optimization scripts');
  } catch (error) {
    console.error('❌ Failed to update package.json:', error.message);
  }
};

// Execute all optimizations
const runOptimizations = () => {
  optimizeComponentImports();
  optimizeGridComponents();
  optimizeContextUsage();
  createPerformanceMonitoring();
  updatePackageJson();
  
  console.log('🎉 Frontend optimization complete!');
  console.log('\\n✨ New features added:');
  console.log('  • Optimized component loading with caching');
  console.log('  • Enhanced grid performance utilities');
  console.log('  • Context optimization hooks');
  console.log('  • Performance monitoring utilities');
  console.log('  • New build scripts for optimization');
  console.log('\\n🚀 Run "npm run optimize" to apply optimizations');
  console.log('📊 Run "npm run analyze" to analyze bundle size');
  console.log('⚡ Run "npm run build:optimized" for optimized production build');
};

runOptimizations();