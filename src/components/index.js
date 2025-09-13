/**
 * Components Index - Centralized Component Exports
 * Provides clean barrel exports for optimized imports and bundle size
 * Organized by component categories for better tree-shaking
 */

// ===== BASE COMPONENTS =====
export {
  default as BaseGrid,
  BaseGrid as EnhancedBaseGrid
} from './base/BaseGrid';

export {
  default as BaseToolbar,
  BaseToolbar as EnhancedBaseToolbar
} from './base/BaseToolbar';

export {
  default as BaseDialog
} from './base/BaseDialog';

export {
  default as BaseCard
} from './base/BaseCard';

// Base components as a group
export * as BaseComponents from './base';

// ===== COMMON COMPONENTS =====
export { default as TooltipWrapper } from './common/TooltipWrapper';
export { default as ErrorBoundary } from './common/ErrorBoundary';
export { default as LoadingSpinner } from './common/LoadingSpinner';
export { default as GridCardView } from './common/GridCardView';
export { default as RecordDetailsDialog } from './common/RecordDetailsDialog';

// Deprecated - use BaseGrid instead
export { default as UnifiedGrid } from './common/UnifiedGrid';
export { default as UnifiedGridToolbar } from './common/UnifiedGridToolbar';

// Common components as a group
export const CommonComponents = {
  TooltipWrapper: () => import('./common/TooltipWrapper'),
  ErrorBoundary: () => import('./common/ErrorBoundary'),
  LoadingSpinner: () => import('./common/LoadingSpinner'),
  GridCardView: () => import('./common/GridCardView'),
  RecordDetailsDialog: () => import('./common/RecordDetailsDialog')
};

// ===== GRID COMPONENTS =====

// Magento Grids
export { default as ProductManagementGrid } from './grids/magento/ProductManagementGrid';
export { default as ProductsGrid } from './grids/magento/ProductsGrid';
export { default as ProductAttributesGrid } from './grids/magento/ProductAttributesGrid';
export { default as ProductCategoriesGrid } from './grids/magento/ProductCategoriesGrid';
export { default as OrdersGrid } from './grids/magento/OrdersGrid';
export { default as CustomersGrid } from './grids/magento/CustomersGrid';
export { default as CategoriesGrid } from './grids/magento/CategoryGrid';
export { default as StocksGrid } from './grids/magento/StocksGrid';
export { default as SourcesGrid } from './grids/magento/SourcesGrid';
export { default as InvoicesGrid } from './grids/magento/InvoicesGrid';

// MDM Grids
export { default as MDMProductsGrid } from './grids/MDMProductsGrid/MDMProductsGrid';
export { default as MDMStockGrid } from './grids/MDMStockGrid';

// Other Grids
export { default as CegidGrid } from './grids/CegidGrid';

// Grid components as groups for lazy loading
export const MagentoGrids = {
  ProductManagementGrid: () => import('./grids/magento/ProductManagementGrid'),
  ProductsGrid: () => import('./grids/magento/ProductsGrid'),
  ProductAttributesGrid: () => import('./grids/magento/ProductAttributesGrid'),
  ProductCategoriesGrid: () => import('./grids/magento/ProductCategoriesGrid'),
  OrdersGrid: () => import('./grids/magento/OrdersGrid'),
  CustomersGrid: () => import('./grids/magento/CustomersGrid'),
  CategoriesGrid: () => import('./grids/magento/CategoryGrid'),
  StocksGrid: () => import('./grids/magento/StocksGrid'),
  SourcesGrid: () => import('./grids/magento/SourcesGrid'),
  InvoicesGrid: () => import('./grids/magento/InvoicesGrid')
};

export const MDMGrids = {
  MDMProductsGrid: () => import('./grids/MDMProductsGrid/MDMProductsGrid'),
  MDMStockGrid: () => import('./grids/MDMStockGrid')
};

export const OtherGrids = {
  CegidGrid: () => import('./grids/CegidGrid')
};

// ===== DIALOG COMPONENTS =====
export { default as BrandManagementDialog } from './dialogs/BrandManagementDialog';

// Dialog components for lazy loading
export const DialogComponents = {
  BrandManagementDialog: () => import('./dialogs/BrandManagementDialog'),
  BaseDialog: () => import('./base/BaseDialog')
};

// ===== LAYOUT COMPONENTS =====
export { default as Layout } from './Layout/Layout';
export { default as Header } from './Layout/Header';
export { default as Sidebar } from './Layout/Sidebar';
export { default as Footer } from './Layout/Footer';

// Layout components for lazy loading
export const LayoutComponents = {
  Layout: () => import('./Layout/Layout'),
  Header: () => import('./Layout/Header'),
  Sidebar: () => import('./Layout/Sidebar'),
  Footer: () => import('./Layout/Footer')
};

// ===== COMPONENT CATEGORIES =====

// All grid-related components
export const GridComponents = {
  // Base
  BaseGrid: () => import('./base/BaseGrid'),
  BaseToolbar: () => import('./base/BaseToolbar'),
  
  // Magento
  ...MagentoGrids,
  
  // MDM
  ...MDMGrids,
  
  // Other
  ...OtherGrids,
  
  // Legacy (deprecated)
  UnifiedGrid: () => import('./common/UnifiedGrid'),
  UnifiedGridToolbar: () => import('./common/UnifiedGridToolbar')
};

// All dialog-related components
export const AllDialogComponents = {
  BaseDialog: () => import('./base/BaseDialog'),
  ...DialogComponents
};

// All display components
export const DisplayComponents = {
  BaseCard: () => import('./base/BaseCard'),
  GridCardView: () => import('./common/GridCardView'),
  LoadingSpinner: () => import('./common/LoadingSpinner')
};

// ===== UTILITY EXPORTS =====

// Component types and interfaces
export * from './base/types';

// Prop validation utilities
export * from './base/propValidation';

// Configuration utilities
export * from '../config/baseGridConfig';

// ===== LAZY LOADING UTILITIES =====

/**
 * Lazy load a component with error boundary
 */
export const lazyLoadComponent = (importFn, fallback = null) => {
  const LazyComponent = React.lazy(importFn);
  
  return (props) => (
    <React.Suspense fallback={fallback || <LoadingSpinner />}>
      <ErrorBoundary>
        <LazyComponent {...props} />
      </ErrorBoundary>
    </React.Suspense>
  );
};

/**
 * Preload a component for better performance
 */
export const preloadComponent = (importFn) => {
  const componentImport = importFn();
  return componentImport;
};

/**
 * Batch preload multiple components
 */
export const preloadComponents = (componentMap) => {
  return Promise.all(
    Object.values(componentMap).map(importFn => importFn())
  );
};

// ===== COMPONENT REGISTRY =====

/**
 * Central component registry for dynamic imports
 */
export const ComponentRegistry = {
  // Base Components
  'BaseGrid': () => import('./base/BaseGrid'),
  'BaseToolbar': () => import('./base/BaseToolbar'),
  'BaseDialog': () => import('./base/BaseDialog'),
  'BaseCard': () => import('./base/BaseCard'),
  
  // Common Components
  'TooltipWrapper': () => import('./common/TooltipWrapper'),
  'ErrorBoundary': () => import('./common/ErrorBoundary'),
  'LoadingSpinner': () => import('./common/LoadingSpinner'),
  
  // Grid Components
  'ProductManagementGrid': () => import('./grids/magento/ProductManagementGrid'),
  'ProductsGrid': () => import('./grids/magento/ProductsGrid'),
  'OrdersGrid': () => import('./grids/magento/OrdersGrid'),
  'CustomersGrid': () => import('./grids/magento/CustomersGrid'),
  'MDMProductsGrid': () => import('./grids/MDMProductsGrid/MDMProductsGrid'),
  'MDMStockGrid': () => import('./grids/MDMStockGrid'),
  'CegidGrid': () => import('./grids/CegidGrid'),
  
  // Layout Components
  'Layout': () => import('./Layout/Layout'),
  'Header': () => import('./Layout/Header'),
  'Sidebar': () => import('./Layout/Sidebar'),
  'Footer': () => import('./Layout/Footer'),
  
  // Dialog Components
  'BrandManagementDialog': () => import('./dialogs/BrandManagementDialog')
};

/**
 * Get component by name with lazy loading
 */
export const getComponent = (componentName) => {
  const importFn = ComponentRegistry[componentName];
  if (!importFn) {
    console.warn(`Component "${componentName}" not found in registry`);
    return null;
  }
  return lazyLoadComponent(importFn);
};

/**
 * Check if component exists in registry
 */
export const hasComponent = (componentName) => {
  return componentName in ComponentRegistry;
};

/**
 * Get all available component names
 */
export const getAvailableComponents = () => {
  return Object.keys(ComponentRegistry);
};

// ===== BUNDLE OPTIMIZATION =====

/**
 * Tree-shakable component groups
 * Import only what you need to reduce bundle size
 */

// Essential components (always included)
export const EssentialComponents = {
  BaseGrid: () => import('./base/BaseGrid'),
  BaseToolbar: () => import('./base/BaseToolbar'),
  BaseDialog: () => import('./base/BaseDialog'),
  TooltipWrapper: () => import('./common/TooltipWrapper'),
  ErrorBoundary: () => import('./common/ErrorBoundary')
};

// Feature-specific component groups
export const ProductManagementComponents = {
  ProductManagementGrid: () => import('./grids/magento/ProductManagementGrid'),
  ProductsGrid: () => import('./grids/magento/ProductsGrid'),
  ProductAttributesGrid: () => import('./grids/magento/ProductAttributesGrid'),
  ProductCategoriesGrid: () => import('./grids/magento/ProductCategoriesGrid'),
  BrandManagementDialog: () => import('./dialogs/BrandManagementDialog')
};

export const OrderManagementComponents = {
  OrdersGrid: () => import('./grids/magento/OrdersGrid'),
  InvoicesGrid: () => import('./grids/magento/InvoicesGrid'),
  CustomersGrid: () => import('./grids/magento/CustomersGrid')
};

export const DataManagementComponents = {
  MDMProductsGrid: () => import('./grids/MDMProductsGrid/MDMProductsGrid'),
  MDMStockGrid: () => import('./grids/MDMStockGrid'),
  CegidGrid: () => import('./grids/CegidGrid')
};

// ===== MIGRATION HELPERS =====

/**
 * Legacy component mappings for migration
 */
export const LegacyComponentMap = {
  // Old UnifiedGrid -> New BaseGrid
  'UnifiedGrid': 'BaseGrid',
  'UnifiedGridToolbar': 'BaseToolbar',
  
  // Old custom grids -> New standardized grids
  'CustomProductGrid': 'ProductManagementGrid',
  'CustomOrderGrid': 'OrdersGrid',
  'CustomCustomerGrid': 'CustomersGrid'
};

/**
 * Get modern component for legacy component name
 */
export const getMigratedComponent = (legacyName) => {
  const modernName = LegacyComponentMap[legacyName] || legacyName;
  return getComponent(modernName);
};

// ===== DEFAULT EXPORT =====

/**
 * Default export with most commonly used components
 */
export default {
  // Base Components
  BaseGrid,
  BaseToolbar,
  BaseDialog,
  BaseCard,
  
  // Common Components
  TooltipWrapper,
  ErrorBoundary,
  
  // Key Grid Components
  ProductManagementGrid,
  ProductsGrid,
  OrdersGrid,
  CustomersGrid,
  MDMProductsGrid,
  
  // Utilities
  lazyLoadComponent,
  preloadComponent,
  getComponent,
  hasComponent,
  
  // Component Groups
  BaseComponents,
  GridComponents,
  DialogComponents,
  LayoutComponents
};