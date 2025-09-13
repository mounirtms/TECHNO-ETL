/**
 * Dialog Components Barrel Export
 * 
 * Centralized export for all dialog components
 * Optimized for lazy loading and tree shaking
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React from 'react';

// ============================================================================
// LAZY LOADED DIALOG COMPONENTS
// ============================================================================

// Import/Export dialogs
export const CSVImportDialog = React.lazy(() => import('./CSVImportDialog'));
export const CatalogProcessorDialog = React.lazy(() => import('./CatalogProcessorDialog'));
export const BrandManagementDialog = React.lazy(() => import('./BrandManagementDialog'));

// Product management dialogs
export const ProductInfoDialog = React.lazy(() => import('../common/ProductInfoDialog'));

// Media dialogs
export const MediaUploadDialog = React.lazy(() => import('./MediaUploadDialog'));
export const BulkMediaDialog = React.lazy(() => import('./BulkMediaDialog'));

// Settings dialogs
export const SettingsDialog = React.lazy(() => import('./SettingsDialog'));
export const PreferencesDialog = React.lazy(() => import('./PreferencesDialog'));

// ============================================================================
// DIALOG CATEGORIES
// ============================================================================

/**
 * Dialog component mapping by category
 */
export const DIALOG_CATEGORIES = {
  import: {
    csv: CSVImportDialog,
    catalog: CatalogProcessorDialog
  },
  
  management: {
    product: ProductInfoDialog,
    brand: BrandManagementDialog
  },
  
  media: {
    upload: MediaUploadDialog,
    bulk: BulkMediaDialog
  },
  
  settings: {
    general: SettingsDialog,
    preferences: PreferencesDialog
  }
};

/**
 * All dialog components map
 */
export const ALL_DIALOGS = {
  'csv-import': CSVImportDialog,
  'catalog-processor': CatalogProcessorDialog,
  'brand-management': BrandManagementDialog,
  'product-info': ProductInfoDialog,
  'media-upload': MediaUploadDialog,
  'bulk-media': BulkMediaDialog,
  'settings': SettingsDialog,
  'preferences': PreferencesDialog
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get dialog component by name
 * @param {string} name - Dialog name
 * @returns {React.LazyExoticComponent} Dialog component
 */
export const getDialog = (name) => {
  const dialog = ALL_DIALOGS[name];
  if (!dialog) {
    throw new Error(`Dialog "${name}" not found`);
  }
  return dialog;
};

/**
 * Get dialogs by category
 * @param {string} category - Dialog category
 * @returns {Object} Dialog category object
 */
export const getDialogsByCategory = (category) => {
  const dialogs = DIALOG_CATEGORIES[category];
  if (!dialogs) {
    throw new Error(`Dialog category "${category}" not found`);
  }
  return dialogs;
};

/**
 * Create Suspense wrapper for dialog
 * @param {React.LazyExoticComponent} DialogComponent - Dialog component to wrap
 * @param {React.ReactNode} fallback - Fallback component
 * @returns {React.Component} Wrapped component
 */
export const withSuspense = (
  DialogComponent,
  fallback = <div>Loading dialog...</div>
) => {
  return React.memo((props) => (
    <React.Suspense fallback={fallback}>
      <DialogComponent {...props} />
    </React.Suspense>
  ));
};

// ============================================================================
// PRE-WRAPPED DIALOGS
// ============================================================================

/**
 * Pre-wrapped dialogs with Suspense
 */
export const SafeCSVImportDialog = withSuspense(CSVImportDialog);
export const SafeCatalogProcessorDialog = withSuspense(CatalogProcessorDialog);
export const SafeProductInfoDialog = withSuspense(ProductInfoDialog);
export const SafeBrandManagementDialog = withSuspense(BrandManagementDialog);

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Individual components
  CSVImportDialog,
  CatalogProcessorDialog,
  BrandManagementDialog,
  ProductInfoDialog,
  MediaUploadDialog,
  BulkMediaDialog,
  SettingsDialog,
  PreferencesDialog,
  
  // Safe components
  SafeCSVImportDialog,
  SafeCatalogProcessorDialog,
  SafeProductInfoDialog,
  SafeBrandManagementDialog,
  
  // Utilities
  getDialog,
  getDialogsByCategory,
  withSuspense,
  
  // Maps
  ALL_DIALOGS,
  DIALOG_CATEGORIES
};