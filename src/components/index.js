/**
 * Main Components Barrel Export
 * 
 * Centralized export point for all components
 * Optimized for tree shaking and bundle size
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

// ============================================================================
// BASE COMPONENTS
// ============================================================================

// Core base components with default and named exports
export { default as BaseGrid } from './base/BaseGrid';
export { default as BaseToolbar } from './base/BaseToolbar';
export { default as BaseDialog } from './base/BaseDialog';
export { default as BaseCard } from './base/BaseCard';

// Base component factory functions
export {
  createDataGrid,
  createToolbar,
  createFormDialog,
  createStatsCards,
  createGridPage,
  applyGridPreset,
  GRID_PRESETS
} from './base';

// ============================================================================
// COMMON COMPONENTS
// ============================================================================

// Common utilities and shared components
export { default as UnifiedGrid } from './common/UnifiedGrid';
export { default as UnifiedGridToolbar } from './common/UnifiedGridToolbar';
export { default as TooltipWrapper } from './common/TooltipWrapper';
export { default as GridErrorBoundary } from './common/GridErrorBoundary';
export { default as StatsCards } from './common/StatsCards';
export { default as GridCardView } from './common/GridCardView';
export { default as RecordDetailsDialog } from './common/RecordDetailsDialog';

// ============================================================================
// GRID COMPONENTS (LAZY LOADED)
// ============================================================================

// Magento Grids - Lazy loaded for better code splitting
export const ProductsGrid = React.lazy(() => import('./grids/magento/ProductsGrid'));
export const ProductManagementGrid = React.lazy(() => import('./grids/magento/ProductManagementGrid'));
export const CustomersGrid = React.lazy(() => import('./grids/magento/CustomersGrid'));
export const OrdersGrid = React.lazy(() => import('./grids/magento/OrdersGrid'));
export const InvoicesGrid = React.lazy(() => import('./grids/magento/InvoicesGrid'));
export const ProductAttributesGrid = React.lazy(() => import('./grids/magento/ProductAttributesGrid'));
export const ProductCategoriesGrid = React.lazy(() => import('./grids/magento/ProductCategoriesGrid'));
export const EnhancedCmsPagesGrid = React.lazy(() => import('./grids/magento/EnhancedCmsPagesGrid'));
export const CmsBlocksGrid = React.lazy(() => import('./grids/magento/CmsBlocksGrid'));
export const SourcesGrid = React.lazy(() => import('./grids/magento/SourcesGrid'));
export const StocksGrid = React.lazy(() => import('./grids/magento/StocksGrid'));

// MDM Grids
export const MDMProductsGrid = React.lazy(() => import('./grids/MDMProductsGrid/MDMProductsGrid'));

// ============================================================================
// DIALOG COMPONENTS
// ============================================================================

// Dialog components for various operations
export const CSVImportDialog = React.lazy(() => import('./dialogs/CSVImportDialog'));
export const CatalogProcessorDialog = React.lazy(() => import('./dialogs/CatalogProcessorDialog'));
export const ProductInfoDialog = React.lazy(() => import('./common/ProductInfoDialog'));
export const BrandManagementDialog = React.lazy(() => import('./dialogs/BrandManagementDialog'));

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

// Layout and navigation components
export { default as Layout } from './Layout';
export { default as Navigation } from './Navigation';
export { default as UserProfile } from './UserProfile';

// ============================================================================
// SPECIALIZED COMPONENTS
// ============================================================================

// Analysis and chart components
export const AnalysisComponents = React.lazy(() => import('./analysis'));
export const ChartComponents = React.lazy(() => import('./charts'));
export const DashboardComponents = React.lazy(() => import('./dashboard'));

// Filter components
export const FilterComponents = React.lazy(() => import('./filters'));

// Media components
export const MediaComponents = React.lazy(() => import('./media'));

// ============================================================================
// COMPONENT GROUPS (FOR DYNAMIC IMPORTS)
// ============================================================================

/**
 * Component groups for dynamic loading
 */
export const COMPONENT_GROUPS = {
  // Grid components
  grids: {
    magento: () => import('./grids/magento'),
    mdm: () => import('./grids/MDMProductsGrid'),
    templates: () => import('./grids/templates')
  },
  
  // Dialog components
  dialogs: () => import('./dialogs'),
  
  // Analysis components
  analysis: () => import('./analysis'),
  
  // Chart components
  charts: () => import('./charts'),
  
  // Dashboard components
  dashboard: () => import('./dashboard'),
  
  // Filter components
  filters: () => import('./filters'),
  
  // Media components
  media: () => import('./media')
};

// ============================================================================
// DYNAMIC COMPONENT LOADER
// ============================================================================

/**
 * Dynamic component loader utility
 * @param {string} group - Component group name
 * @param {string} [component] - Specific component name
 * @returns {Promise<any>} Component or component group
 */
export const loadComponent = async (group, component) => {
  try {
    if (component) {
      // Load specific component from group
      const groupModule = await COMPONENT_GROUPS[group]();
      return groupModule[component];
    } else {
      // Load entire group
      return await COMPONENT_GROUPS[group]();
    }
  } catch (error) {
    console.error(`Failed to load component group: ${group}`, error);
    throw error;
  }
};

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

/**
 * Component registry for runtime component resolution
 */
export const COMPONENT_REGISTRY = {
  // Base components
  'BaseGrid': BaseGrid,
  'BaseToolbar': BaseToolbar,
  'BaseDialog': BaseDialog,
  'BaseCard': BaseCard,
  
  // Common components
  'UnifiedGrid': UnifiedGrid,
  'UnifiedGridToolbar': UnifiedGridToolbar,
  'TooltipWrapper': TooltipWrapper,
  
  // Lazy components (resolved at runtime)
  'ProductsGrid': () => import('./grids/magento/ProductsGrid'),
  'CustomersGrid': () => import('./grids/magento/CustomersGrid'),
  'OrdersGrid': () => import('./grids/magento/OrdersGrid'),
  'MDMProductsGrid': () => import('./grids/MDMProductsGrid/MDMProductsGrid')
};

/**
 * Get component from registry
 * @param {string} name - Component name
 * @returns {any} Component or import function
 */
export const getComponent = (name) => {
  const component = COMPONENT_REGISTRY[name];
  
  if (!component) {
    throw new Error(`Component "${name}" not found in registry`);
  }
  
  // If it's a function (lazy component), return the import
  if (typeof component === 'function') {
    return component();
  }
  
  // Return the component directly
  return component;
};

// ============================================================================
// TREE-SHAKING OPTIMIZED EXPORTS
// ============================================================================

/**
 * Individual component exports for better tree shaking
 * These can be imported directly to avoid loading unnecessary code
 */

// Base components (always loaded)
export { BaseGrid, BaseToolbar, BaseDialog, BaseCard };

// Common utilities (lightweight)
export { UnifiedGrid, TooltipWrapper };

/**
 * Create lazy-loaded grid component
 * @param {Function} importFn - Import function
 * @param {React.ComponentType} [fallback] - Fallback component
 * @returns {React.LazyExoticComponent} Lazy component
 */
export const createLazyGrid = (importFn, fallback) => {
  return React.lazy(importFn);
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

import React from 'react';

export default {
  // Base components
  BaseGrid,
  BaseToolbar,
  BaseDialog,
  BaseCard,
  
  // Common components
  UnifiedGrid,
  UnifiedGridToolbar,
  TooltipWrapper,
  
  // Utilities
  loadComponent,
  getComponent,
  createLazyGrid,
  
  // Registry
  COMPONENT_REGISTRY,
  COMPONENT_GROUPS
};