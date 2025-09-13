/**
 * Magento Grid Components Barrel Export
 * 
 * Optimized exports for all Magento-related grid components
 * Enables efficient code splitting and lazy loading
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React from 'react';

// ============================================================================
// LAZY LOADED COMPONENTS
// ============================================================================

// Main product management grids
export const ProductsGrid = React.lazy(() => import('./ProductsGrid'));
export const ProductManagementGrid = React.lazy(() => import('./ProductManagementGrid'));

// Customer management
export const CustomersGrid = React.lazy(() => import('./CustomersGrid'));

// Order management
export const OrdersGrid = React.lazy(() => import('./OrdersGrid'));
export const InvoicesGrid = React.lazy(() => import('./InvoicesGrid'));

// Product attribute and category management
export const ProductAttributesGrid = React.lazy(() => import('./ProductAttributesGrid'));
export const ProductCategoriesGrid = React.lazy(() => import('./ProductCategoriesGrid'));

// Content management
export const EnhancedCmsPagesGrid = React.lazy(() => import('./EnhancedCmsPagesGrid'));
export const CmsBlocksGrid = React.lazy(() => import('./CmsBlocksGrid'));

// Inventory management
export const SourcesGrid = React.lazy(() => import('./SourcesGrid'));
export const StocksGrid = React.lazy(() => import('./StocksGrid'));

// ============================================================================
// COMPONENT MAP
// ============================================================================

/**
 * Component mapping for dynamic resolution
 */
export const MAGENTO_COMPONENTS = {
  'products': ProductsGrid,
  'product-management': ProductManagementGrid,
  'customers': CustomersGrid,
  'orders': OrdersGrid,
  'invoices': InvoicesGrid,
  'product-attributes': ProductAttributesGrid,
  'product-categories': ProductCategoriesGrid,
  'cms-pages': EnhancedCmsPagesGrid,
  'cms-blocks': CmsBlocksGrid,
  'sources': SourcesGrid,
  'stocks': StocksGrid
};

// ============================================================================
// COMPONENT GROUPS
// ============================================================================

/**
 * Logical grouping of components
 */
export const COMPONENT_GROUPS = {
  products: [ProductsGrid, ProductManagementGrid, ProductAttributesGrid, ProductCategoriesGrid],
  customers: [CustomersGrid],
  orders: [OrdersGrid, InvoicesGrid],
  content: [EnhancedCmsPagesGrid, CmsBlocksGrid],
  inventory: [SourcesGrid, StocksGrid]
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get Magento component by name
 * @param {string} name - Component name
 * @returns {React.LazyExoticComponent} Component
 */
export const getMagentoComponent = (name) => {
  const component = MAGENTO_COMPONENTS[name];
  if (!component) {
    throw new Error(`Magento component "${name}" not found`);
  }
  return component;
};

/**
 * Get components by group
 * @param {string} group - Component group name
 * @returns {Array} Components array
 */
export const getComponentGroup = (group) => {
  const components = COMPONENT_GROUPS[group];
  if (!components) {
    throw new Error(`Component group "${group}" not found`);
  }
  return components;
};

/**
 * Load all components in a group
 * @param {string} group - Component group name
 * @returns {Promise<Array>} Promise resolving to components
 */
export const loadComponentGroup = async (group) => {
  const components = getComponentGroup(group);
  return Promise.all(components.map(component => component));
};

// ============================================================================
// SUSPENSE WRAPPERS
// ============================================================================

/**
 * Create Suspense wrapper for component
 * @param {React.LazyExoticComponent} Component - Component to wrap
 * @param {React.ReactNode} fallback - Fallback component
 * @returns {React.Component} Wrapped component
 */
export const withSuspense = (
  Component,
  fallback = <div>Loading...</div>
) => {
  return React.memo((props) => (
    <React.Suspense fallback={fallback}>
      <Component {...props} />
    </React.Suspense>
  ));
};

/**
 * Create error boundary wrapper for component
 * @param {React.ComponentType} Component - Component to wrap
 * @param {React.ComponentType} [fallback] - Error fallback component
 * @returns {React.Component} Wrapped component
 */
export const withErrorBoundary = (
  Component,
  fallback
) => {
  return React.memo((props) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  ));
};

/**
 * Create full wrapper with Suspense and Error Boundary
 * @param {React.LazyExoticComponent} Component - Component to wrap
 * @param {Object} options - Wrapper options
 * @param {React.ReactNode} [options.suspenseFallback] - Suspense fallback
 * @param {React.ComponentType} [options.errorFallback] - Error fallback
 * @returns {React.Component} Wrapped component
 */
export const withSafeLoading = (
  Component,
  options = {}
) => {
  const {
    suspenseFallback = <div>Loading...</div>,
    errorFallback
  } = options;
  
  return React.memo((props) => (
    <ErrorBoundary fallback={errorFallback}>
      <React.Suspense fallback={suspenseFallback}>
        <Component {...props} />
      </React.Suspense>
    </ErrorBoundary>
  ));
};

// ============================================================================
// PRE-WRAPPED COMPONENTS
// ============================================================================

/**
 * Pre-wrapped components with Suspense and Error Boundary
 */
export const SafeProductsGrid = withSafeLoading(ProductsGrid);
export const SafeCustomersGrid = withSafeLoading(CustomersGrid);
export const SafeOrdersGrid = withSafeLoading(OrdersGrid);
export const SafeProductManagementGrid = withSafeLoading(ProductManagementGrid);

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

import { ErrorBoundary } from 'react-error-boundary';

export default {
  // Components
  ProductsGrid,
  ProductManagementGrid,
  CustomersGrid,
  OrdersGrid,
  InvoicesGrid,
  ProductAttributesGrid,
  ProductCategoriesGrid,
  EnhancedCmsPagesGrid,
  CmsBlocksGrid,
  SourcesGrid,
  StocksGrid,
  
  // Safe components
  SafeProductsGrid,
  SafeCustomersGrid,
  SafeOrdersGrid,
  SafeProductManagementGrid,
  
  // Utilities
  getMagentoComponent,
  getComponentGroup,
  loadComponentGroup,
  withSuspense,
  withErrorBoundary,
  withSafeLoading,
  
  // Maps
  MAGENTO_COMPONENTS,
  COMPONENT_GROUPS
};