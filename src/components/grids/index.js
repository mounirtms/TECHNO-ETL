/**
 * Grid Components Index
 * Optimized exports for all grid-related components
 * Supports tree-shaking and lazy loading
 */

// ===== MAGENTO GRIDS =====
export { default as ProductManagementGrid } from './magento/ProductManagementGrid';
export { default as ProductsGrid } from './magento/ProductsGrid';
export { default as ProductAttributesGrid } from './magento/ProductAttributesGrid';
export { default as ProductCategoriesGrid } from './magento/ProductCategoriesGrid';
export { default as CategoryManagementGrid } from './magento/CategoryManagementGrid';
export { default as CategoryGrid } from './magento/CategoryGrid';
export { default as OrdersGrid } from './magento/OrdersGrid';
export { default as InvoicesGrid } from './magento/InvoicesGrid';
export { default as CustomersGrid } from './magento/CustomersGrid';
export { default as StocksGrid } from './magento/StocksGrid';
export { default as SourcesGrid } from './magento/SourcesGrid';
export { default as CmsBlocksGrid } from './magento/CmsBlocksGrid';

// ===== MDM GRIDS =====
export { default as MDMProductsGrid } from './MDMProductsGrid/MDMProductsGrid';
export { default as MDMStockGrid } from './MDMStockGrid';

// ===== OTHER GRIDS =====
export { default as CegidGrid } from './CegidGrid';

// ===== TEMPLATE GRIDS =====
export { default as StandardGridTemplate } from './templates/StandardGridTemplate';

// ===== LAZY LOADING EXPORTS =====

// Magento grids for lazy loading
export const MagentoGrids = {
  ProductManagementGrid: () => import('./magento/ProductManagementGrid'),
  ProductsGrid: () => import('./magento/ProductsGrid'),
  ProductAttributesGrid: () => import('./magento/ProductAttributesGrid'),
  ProductCategoriesGrid: () => import('./magento/ProductCategoriesGrid'),
  CategoryManagementGrid: () => import('./magento/CategoryManagementGrid'),
  CategoryGrid: () => import('./magento/CategoryGrid'),
  OrdersGrid: () => import('./magento/OrdersGrid'),
  InvoicesGrid: () => import('./magento/InvoicesGrid'),
  CustomersGrid: () => import('./magento/CustomersGrid'),
  StocksGrid: () => import('./magento/StocksGrid'),
  SourcesGrid: () => import('./magento/SourcesGrid'),
  CmsBlocksGrid: () => import('./magento/CmsBlocksGrid')
};

// MDM grids for lazy loading
export const MDMGrids = {
  MDMProductsGrid: () => import('./MDMProductsGrid/MDMProductsGrid'),
  MDMStockGrid: () => import('./MDMStockGrid')
};

// Other grids for lazy loading
export const OtherGrids = {
  CegidGrid: () => import('./CegidGrid'),
  StandardGridTemplate: () => import('./templates/StandardGridTemplate')
};

// ===== FEATURE-BASED GROUPING =====

// Product management related grids
export const ProductGrids = {
  ProductManagementGrid: () => import('./magento/ProductManagementGrid'),
  ProductsGrid: () => import('./magento/ProductsGrid'),
  ProductAttributesGrid: () => import('./magento/ProductAttributesGrid'),
  ProductCategoriesGrid: () => import('./magento/ProductCategoriesGrid'),
  MDMProductsGrid: () => import('./MDMProductsGrid/MDMProductsGrid')
};

// Order management related grids
export const OrderGrids = {
  OrdersGrid: () => import('./magento/OrdersGrid'),
  InvoicesGrid: () => import('./magento/InvoicesGrid')
};

// Customer management related grids
export const CustomerGrids = {
  CustomersGrid: () => import('./magento/CustomersGrid')
};

// Inventory management related grids
export const InventoryGrids = {
  StocksGrid: () => import('./magento/StocksGrid'),
  SourcesGrid: () => import('./magento/SourcesGrid'),
  MDMStockGrid: () => import('./MDMStockGrid')
};

// Category management related grids
export const CategoryGrids = {
  CategoryManagementGrid: () => import('./magento/CategoryManagementGrid'),
  CategoryGrid: () => import('./magento/CategoryGrid'),
  ProductCategoriesGrid: () => import('./magento/ProductCategoriesGrid')
};

// Data integration grids
export const DataIntegrationGrids = {
  CegidGrid: () => import('./CegidGrid'),
  MDMProductsGrid: () => import('./MDMProductsGrid/MDMProductsGrid'),
  MDMStockGrid: () => import('./MDMStockGrid')
};

// ===== GRID REGISTRY =====

/**
 * Complete grid registry for dynamic loading
 */
export const GridRegistry = {
  // Magento
  'ProductManagementGrid': () => import('./magento/ProductManagementGrid'),
  'ProductsGrid': () => import('./magento/ProductsGrid'),
  'ProductAttributesGrid': () => import('./magento/ProductAttributesGrid'),
  'ProductCategoriesGrid': () => import('./magento/ProductCategoriesGrid'),
  'CategoryManagementGrid': () => import('./magento/CategoryManagementGrid'),
  'CategoryGrid': () => import('./magento/CategoryGrid'),
  'OrdersGrid': () => import('./magento/OrdersGrid'),
  'InvoicesGrid': () => import('./magento/InvoicesGrid'),
  'CustomersGrid': () => import('./magento/CustomersGrid'),
  'StocksGrid': () => import('./magento/StocksGrid'),
  'SourcesGrid': () => import('./magento/SourcesGrid'),
  'CmsBlocksGrid': () => import('./magento/CmsBlocksGrid'),
  
  // MDM
  'MDMProductsGrid': () => import('./MDMProductsGrid/MDMProductsGrid'),
  'MDMStockGrid': () => import('./MDMStockGrid'),
  
  // Other
  'CegidGrid': () => import('./CegidGrid'),
  'StandardGridTemplate': () => import('./templates/StandardGridTemplate')
};

/**
 * Get grid component by name
 */
export const getGrid = (gridName) => {
  const importFn = GridRegistry[gridName];
  if (!importFn) {
    console.warn(`Grid "${gridName}" not found in registry`);
    return null;
  }
  return importFn;
};

/**
 * Check if grid exists
 */
export const hasGrid = (gridName) => {
  return gridName in GridRegistry;
};

/**
 * Get all available grid names
 */
export const getAvailableGrids = () => {
  return Object.keys(GridRegistry);
};

/**
 * Get grids by category
 */
export const getGridsByCategory = (category) => {
  const categoryMap = {
    'magento': MagentoGrids,
    'mdm': MDMGrids,
    'product': ProductGrids,
    'order': OrderGrids,
    'customer': CustomerGrids,
    'inventory': InventoryGrids,
    'category': CategoryGrids,
    'integration': DataIntegrationGrids,
    'other': OtherGrids
  };
  
  return categoryMap[category] || {};
};

// ===== PRELOADING UTILITIES =====

/**
 * Preload critical grids for better performance
 */
export const preloadCriticalGrids = () => {
  return Promise.all([
    import('./magento/ProductManagementGrid'),
    import('./magento/ProductsGrid'),
    import('./magento/OrdersGrid'),
    import('./MDMProductsGrid/MDMProductsGrid')
  ]);
};

/**
 * Preload grids by feature
 */
export const preloadGridsByFeature = (feature) => {
  const featureGrids = getGridsByCategory(feature);
  return Promise.all(
    Object.values(featureGrids).map(importFn => importFn())
  );
};

// ===== MIGRATION HELPERS =====

/**
 * Legacy grid name mappings
 */
export const LegacyGridMap = {
  'ProductGrid': 'ProductsGrid',
  'OrderGrid': 'OrdersGrid',
  'CustomerGrid': 'CustomersGrid',
  'StockGrid': 'StocksGrid',
  'CategoryGrid': 'CategoryManagementGrid'
};

/**
 * Get modern grid name for legacy name
 */
export const getMigratedGridName = (legacyName) => {
  return LegacyGridMap[legacyName] || legacyName;
};

/**
 * Get modern grid component for legacy name
 */
export const getMigratedGrid = (legacyName) => {
  const modernName = getMigratedGridName(legacyName);
  return getGrid(modernName);
};

// ===== DEFAULT EXPORT =====

export default {
  // Most commonly used grids
  ProductManagementGrid,
  ProductsGrid,
  OrdersGrid,
  CustomersGrid,
  MDMProductsGrid,
  MDMStockGrid,
  
  // Utilities
  getGrid,
  hasGrid,
  getAvailableGrids,
  getGridsByCategory,
  preloadCriticalGrids,
  preloadGridsByFeature,
  
  // Categories
  MagentoGrids,
  MDMGrids,
  ProductGrids,
  OrderGrids,
  CustomerGrids,
  InventoryGrids,
  CategoryGrids,
  DataIntegrationGrids,
  OtherGrids
};