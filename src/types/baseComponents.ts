/**
 * Base Components Type Definitions
 * This file contains shared TypeScript interfaces for base components
 */

import { ReactNode, ElementType } from 'react';
import { SxProps, Theme } from '@mui/material';
import { GridRowsProp, GridColDef, GridSortModel, GridFilterModel } from '@mui/x-data-grid';

/**
 * Base component props that all components can extend
 */
export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
  'data-testid'?: string;
}

/**
 * Base MUI component props
 */
export interface MuiComponentProps extends BaseComponentProps {
  sx?: SxProps<Theme>;
}

/**
 * BaseToolbar configuration
 */
export interface ToolbarConfig {
  showRefresh?: boolean;
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showSettings?: boolean;
  showRealTime?: boolean;
  showPerformance?: boolean;
  collapseOnMobile?: boolean;
  priorityActions?: string[];
  [key: string]: any;
}

/**
 * Performance metrics for monitoring
 */
export interface PerformanceMetrics {
  responseTime?: number;
  renderTime?: number;
  dataSize?: number;
  queryTime?: number;
  [key: string]: any;
}

/**
 * Action button configuration
 */
export interface ActionButton {
  key: string;
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  priority?: number;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
}

/**
 * BaseToolbar props interface
 */
export interface BaseToolbarProps {
  // Basic props
  gridName?: string;
  gridType?: string;
  config?: Partial<ToolbarConfig>;

  // Actions
  customActions?: ReactNode[];
  customLeftActions?: ReactNode[];
  selectedRows?: any[];

  // Event handlers
  onRefresh?: () => void;
  onAdd?: () => void;
  onEdit?: (row?) => void;
  onDelete?: (rows?: any[]) => void;
  onExport?: () => void;
  onImport?: () => void;
  onSearch?: (value: string) => void;
  onClearSearch?: () => void;

  // Search
  searchValue?: string;
  searchPlaceholder?: string;

  // State
  loading?: boolean;

  // Grid controls
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  density?: 'compact' | 'standard' | 'comfortable';
  onDensityChange?: (density: 'compact' | 'standard' | 'comfortable') => void;

  // Real-time features
  realTimeEnabled?: boolean;
  onRealTimeToggle?: (enabled: boolean) => void;
  onSelectionModelChange?: (selection: any[]) => void;

  // Styling
  compact?: boolean;
  sx?: SxProps<Theme>;

  // Advanced features
  showPerformanceMetrics?: boolean;
  performanceMetrics?: PerformanceMetrics;
}

/**
 * Interface for grid cards
 */
export interface GridCard {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: string;
  loading?: boolean;
  [key: string]: any;
}

/**
 * BaseGrid props interface
 */
export interface BaseGridProps {
  // Data props
  data?: GridRowsProp;
  columns?: GridColDef[];
  loading?: boolean;
  error?: Error | null;
  
  // Grid configuration
  gridName?: string;
  gridType?: string;
  height?: number;
  autoHeight?: boolean;
  
  // Pagination
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Selection
  checkboxSelection?: boolean;
  disableSelectionOnClick?: boolean;
  selectionModel?: any[];
  onSelectionModelChange?: (selection: any[]) => void;
  
  // Sorting and filtering
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  
  // Toolbar configuration
  showToolbar?: boolean;
  toolbarConfig?: ToolbarConfig;
  customActions?: ReactNode[];
  customLeftActions?: ReactNode[];
  
  // Stats cards
  showStatsCards?: boolean;
  gridCards?: GridCard[];
  
  // Event handlers
  onRefresh?: () => void;
  onAdd?: () => void;
  onEdit?: (row) => void;
  onDelete?: (rows: any[]) => void;
  onExport?: () => void;
  onImport?: () => void;
  onRowClick?: (params) => void;
  onRowDoubleClick?: (params) => void;
  onCellClick?: (params) => void;
  
  // Advanced features
  enableVirtualization?: boolean;
  enableRealTimeUpdates?: boolean;
  updateInterval?: number;
  
  // Styling
  density?: string;
  sx?: any;
  
  // Accessibility
  ariaLabel?: string;
  
  // Error handling
  onError?: (error: any, context?: string) => void;
  
  // Custom components
  NoRowsOverlay?: React.ComponentType<any>;
  LoadingOverlay?: React.ComponentType<any>;
  ErrorOverlay?: React.ComponentType<any>;
  
  // Advanced props
  getRowId?: (row) => any;
  getRowClassName?: (params) => string;
  getCellClassName?: (params) => string;
  isRowSelectable?: (params) => boolean;
  
  [key: string]: any;
}

/**
 * Common tooltip props
 */
export interface TooltipWrapperProps {
  children: ReactNode;
  disabled?: boolean;
  title: string;
  placement?: 'bottom-end' | 'bottom-start' | 'bottom' | 'left-end' | 'left-start' | 
              'left' | 'right-end' | 'right-start' | 'right' | 'top-end' | 'top-start' | 'top';
  arrow?: boolean;
  [key: string]: any;
}

/**
 * BaseCard props interface
 */
export interface BaseCardProps {
  title?: string;
  subtitle?: string;
  value?: string | number;
  icon?: ReactNode;
  iconBackground?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | string;
  loading?: boolean;
  error?: string | Error;
  elevation?: number;
  variant?: 'outlined' | 'elevation';
  sx?: SxProps<Theme>;
  actions?: ReactNode;
  onClick?: () => void;
  chart?: ReactNode;
  footer?: ReactNode;
  headerAction?: ReactNode;
  [key: string]: any;
}