/**
 * Base Components Index
 * Centralized exports for all base components
 * Provides clean barrel exports for optimized imports
 */

// Core base components
export { default as BaseGrid } from './BaseGrid';
export { default as BaseToolbar } from './BaseToolbar';
export { default as BaseDialog } from './BaseDialog';
export { default as BaseCard } from './BaseCard';

// Re-export for backward compatibility
export { default as BaseGrid as EnhancedBaseGrid } from './BaseGrid';
export { default as BaseToolbar as EnhancedBaseToolbar } from './BaseToolbar';

// Component groups for easier imports
export const GridComponents = {
  BaseGrid: require('./BaseGrid').default,
  BaseToolbar: require('./BaseToolbar').default
};

export const DialogComponents = {
  BaseDialog: require('./BaseDialog').default
};

export const DisplayComponents = {
  BaseCard: require('./BaseCard').default
};

// All base components
export const BaseComponents = {
  ...GridComponents,
  ...DialogComponents,
  ...DisplayComponents
};