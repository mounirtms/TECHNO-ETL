/**
 * Base Components Barrel Export
 *
 * Centralized export point for all base components
 * Enables clean imports and better tree shaking
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

// Core base components
export { default as BaseGrid } from './BaseGrid';
export { default as BaseToolbar } from './BaseToolbar';
export { default as BaseDialog } from './BaseDialog';
export { default as BaseCard } from './BaseCard';

// Re-export common component patterns for convenience
export {
  BaseGrid as Grid,
  BaseToolbar as Toolbar,
  BaseDialog as Dialog,
  BaseCard as Card,
} from './index';

/**
 * Type definitions are available in types.ts
 * When using TypeScript, import types from './types'
 */

/**
 * Component factory functions for common use cases
 */

/**
 * Create a standardized data grid with common configuration
 */
export const createDataGrid = (config = {}) => {
  const defaultConfig = {
    enableSuspense: true,
    enableErrorBoundary: true,
    enableVirtualization: true,
    enableSelection: true,
    enableSearch: true,
    enableStats: true,
    enableActions: true,
  };

  return {
    ...defaultConfig,
    ...config,
  };
};

/**
 * Create a standardized toolbar with common actions
 */
export const createToolbar = (actions = [], config = {}) => {
  const defaultConfig = {
    enableSearch: true,
    enableActions: true,
    enableResponsive: true,
    size: 'medium',
    spacing: 1,
  };

  return {
    ...defaultConfig,
    customActions: actions,
    ...config,
  };
};

/**
 * Create a standardized dialog with form fields
 */
export const createFormDialog = (fields = [], config = {}) => {
  const defaultConfig = {
    type: 'form',
    maxWidth: 'sm',
    fullWidth: true,
  };

  return {
    ...defaultConfig,
    fields,
    ...config,
  };
};

/**
 * Create standardized stats cards
 */
export const createStatsCards = (stats = {}, config = {}) => {
  const defaultConfig = {
    variant: 'stats',
    loading: false,
  };

  return {
    ...defaultConfig,
    stats,
    config,
    ...config,
  };
};

/**
 * Higher-order component factory for creating grid pages
 */
export const createGridPage = (options = {}) => {
  const {
    gridName,
    apiService,
    apiEndpoint,
    columns = [],
    actions = [],
    fields = [],
    ...rest
  } = options;

  return function GridPageComponent(props) {
    return (
      <BaseGrid
        gridName={gridName}
        apiService={apiService}
        apiEndpoint={apiEndpoint}
        columns={columns}
        toolbarConfig={createToolbar(actions)}
        dialogConfig={createFormDialog(fields)}
        {...rest}
        {...props}
      />
    );
  };
};

/**
 * Common configuration presets
 */
export const GRID_PRESETS = {
  // Standard CRUD grid
  crud: {
    enableSelection: true,
    enableSearch: true,
    enableStats: true,
    toolbarConfig: {
      showRefresh: true,
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showExport: true,
    },
  },

  // Read-only grid
  readonly: {
    enableSelection: false,
    enableSearch: true,
    enableStats: true,
    toolbarConfig: {
      showRefresh: true,
      showAdd: false,
      showEdit: false,
      showDelete: false,
      showExport: true,
    },
  },

  // Simple list grid
  simple: {
    enableSelection: false,
    enableSearch: false,
    enableStats: false,
    toolbarConfig: {
      showRefresh: true,
      showAdd: false,
      showEdit: false,
      showDelete: false,
      showExport: false,
    },
  },

  // Management grid with advanced features
  management: {
    enableSelection: true,
    enableSearch: true,
    enableStats: true,
    enableVirtualization: true,
    toolbarConfig: {
      showRefresh: true,
      showAdd: true,
      showEdit: true,
      showDelete: true,
      showSync: true,
      showExport: true,
      showImport: true,
    },
  },
};

/**
 * Utility function to apply preset configuration
 */
export const applyGridPreset = (preset, overrides = {}) => {
  const presetConfig = GRID_PRESETS[preset] || GRID_PRESETS.crud;

  return {
    ...presetConfig,
    ...overrides,
    toolbarConfig: {
      ...presetConfig.toolbarConfig,
      ...overrides.toolbarConfig,
    },
  };
};

/**
 * Default export for convenience
 */
export default {
  BaseGrid,
  BaseToolbar,
  BaseDialog,
  BaseCard,
  createDataGrid,
  createToolbar,
  createFormDialog,
  createStatsCards,
  createGridPage,
  applyGridPreset,
  GRID_PRESETS,
};
