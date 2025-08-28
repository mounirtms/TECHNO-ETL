/**
 * TypeScript Interface Definitions for Base Components
 * 
 * Comprehensive type definitions for all base components
 * Enables type safety and better developer experience
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { ReactNode, MouseEvent, ChangeEvent } from 'react';
import { SxProps, Theme } from '@mui/material/styles';
import { GridColDef, GridRowSelectionModel, GridSortModel, GridFilterModel, GridPaginationModel } from '@mui/x-data-grid';

// ============================================================================
// COMMON TYPES
// ============================================================================

export type ColorVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
export type SizeVariant = 'small' | 'medium' | 'large';
export type ButtonVariant = 'text' | 'outlined' | 'contained';

export interface ApiService {
  get: (endpoint: string, config?: any) => Promise<any>;
  post: (endpoint: string, data?: any, config?: any) => Promise<any>;
  put: (endpoint: string, data?: any, config?: any) => Promise<any>;
  delete: (endpoint: string, config?: any) => Promise<any>;
}

export interface GridStats {
  total: number;
  active: number;
  inactive: number;
  selected: number;
  [key: string]: number;
}

export interface BaseComponentProps {
  id?: string;
  className?: string;
  sx?: SxProps<Theme>;
  children?: ReactNode;
}

// ============================================================================
// BASE GRID TYPES
// ============================================================================

export interface GridColumnConfig extends GridColDef {
  visible?: boolean;
  exportable?: boolean;
  searchable?: boolean;
}

export interface GridToolbarConfig {
  showRefresh?: boolean;
  showAdd?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showSync?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showSettings?: boolean;
  showDensity?: boolean;
  showColumns?: boolean;
  showViewToggle?: boolean;
  showSelection?: boolean;
  compact?: boolean;
  size?: SizeVariant;
  spacing?: number;
  exportOptions?: {
    excel?: boolean;
    csv?: boolean;
    json?: boolean;
  };
}

export interface GridDialogConfig {
  add?: {
    title?: string;
    fields?: FormField[];
    validationRules?: ValidationRules;
  };
  edit?: {
    title?: string;
    fields?: FormField[];
    validationRules?: ValidationRules;
  };
  delete?: {
    title?: string;
    confirmMessage?: string;
  };
}

export interface GridStatsConfig {
  stats?: Array<{
    key: string;
    title: string;
    color?: ColorVariant;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'flat';
    percentage?: number;
  }>;
}

export interface CustomAction {
  key: string;
  label: string;
  icon?: ReactNode;
  color?: ColorVariant;
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
  requiresSelection?: boolean;
}

export interface BaseGridProps extends BaseComponentProps {
  // Core props
  gridName: string;
  columns?: GridColumnConfig[];
  data?: any[];
  loading?: boolean;
  error?: Error | null;
  
  // API props
  apiService?: ApiService;
  apiEndpoint?: string;
  apiParams?: Record<string, any>;
  
  // Feature toggles
  enableSuspense?: boolean;
  enableErrorBoundary?: boolean;
  enableVirtualization?: boolean;
  enableSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableSearch?: boolean;
  enableStats?: boolean;
  enableActions?: boolean;
  
  // Configuration
  toolbarConfig?: GridToolbarConfig;
  dialogConfig?: GridDialogConfig;
  statsConfig?: GridStatsConfig;
  customActions?: CustomAction[];
  
  // Data handling
  searchFields?: string[];
  getRowId?: (row: any) => string | number;
  
  // Event handlers
  onRefresh?: () => void;
  onAdd?: () => void;
  onEdit?: (record: any) => void;
  onDelete?: (records: any[]) => void;
  onSearch?: (query: string) => void;
  onSelectionChange?: (selection: GridRowSelectionModel) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// BASE TOOLBAR TYPES
// ============================================================================

export interface BaseToolbarProps extends BaseComponentProps {
  // Core props
  searchId?: string;
  config?: GridToolbarConfig;
  customActions?: CustomAction[];
  
  // State props
  selectedCount?: number;
  searchQuery?: string;
  loading?: boolean;
  
  // Feature toggles
  enableSearch?: boolean;
  enableActions?: boolean;
  enableResponsive?: boolean;
  
  // Event handlers
  onSearchChange?: (query: string) => void;
  onRefresh?: () => void;
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSync?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onCustomAction?: (key: string, action: CustomAction) => void;
  
  // Style props
  size?: SizeVariant;
  variant?: 'standard' | 'dense';
  spacing?: number;
}

// ============================================================================
// BASE DIALOG TYPES
// ============================================================================

export type DialogType = 'add' | 'edit' | 'delete' | 'confirm' | 'form';

export interface FormField {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type?: string;
  message?: string;
  validator?: (value: any) => boolean;
  [key: string]: any;
}

export interface ValidationRules {
  [fieldKey: string]: ValidationRule | ValidationRule[];
}

export interface BaseDialogProps extends BaseComponentProps {
  // Core props
  type?: DialogType;
  open?: boolean;
  onClose?: () => void;
  onSubmit?: (data: any, type: DialogType) => Promise<void>;
  
  // Content props
  title?: string;
  subtitle?: string;
  content?: ReactNode;
  data?: Record<string, any>;
  
  // Configuration
  config?: {
    title?: string;
    icon?: ReactNode;
    submitLabel?: string;
    submitColor?: ColorVariant;
    submitVariant?: ButtonVariant;
    dangerous?: boolean;
  };
  fields?: FormField[];
  validationRules?: ValidationRules;
  
  // State props
  loading?: boolean;
  error?: string | null;
  
  // Style props
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableEscapeKeyDown?: boolean;
}

// ============================================================================
// BASE CARD TYPES
// ============================================================================

export type CardVariant = 'stats' | 'info' | 'action' | 'metric' | 'progress';
export type InfoType = 'info' | 'warning' | 'error' | 'success';
export type TrendType = 'up' | 'down' | 'flat';

export interface ProgressConfig {
  value: number;
  max?: number;
  showPercentage?: boolean;
}

export interface BaseCardProps extends BaseComponentProps {
  // Core props
  variant?: CardVariant;
  type?: InfoType;
  
  // Content props
  title?: string;
  value?: string | number;
  subtitle?: string;
  content?: ReactNode;
  icon?: ReactNode;
  
  // Stats props (for multiple stat cards)
  stats?: GridStats;
  config?: GridStatsConfig;
  
  // State props
  loading?: boolean;
  
  // Style props
  color?: ColorVariant;
  
  // Event props
  onClick?: (event: MouseEvent) => void;
  onDismiss?: () => void;
  
  // Advanced props
  trend?: TrendType;
  percentage?: number;
  progress?: ProgressConfig;
  actions?: ReactNode;
  dismissible?: boolean;
}

// ============================================================================
// COMPONENT CONFIGURATION TYPES
// ============================================================================

export interface GridPresetConfig {
  enableSelection: boolean;
  enableSearch: boolean;
  enableStats: boolean;
  enableVirtualization?: boolean;
  toolbarConfig: GridToolbarConfig;
}

export interface GridPresets {
  crud: GridPresetConfig;
  readonly: GridPresetConfig;
  simple: GridPresetConfig;
  management: GridPresetConfig;
}

export interface ComponentFactory<T = any> {
  create: (config?: Partial<T>) => T;
  applyPreset: (preset: string, overrides?: Partial<T>) => T;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

export interface GridState {
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  filterModel: GridFilterModel;
  setFilterModel: (model: GridFilterModel) => void;
  selectedRows: GridRowSelectionModel;
  setSelectedRows: (selection: GridRowSelectionModel) => void;
  columnVisibility: Record<string, boolean>;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  density: 'compact' | 'standard' | 'comfortable';
  setDensity: (density: 'compact' | 'standard' | 'comfortable') => void;
}

export interface GridCache {
  getCacheData: () => any[] | null;
  setCacheData: (data: any[]) => void;
  clearCache: () => void;
}

export interface GridActions {
  handleBulkAction: (action: string, selection: GridRowSelectionModel) => void;
  handleExport: (data: any[], format?: 'csv' | 'excel' | 'json') => void;
  handleImport: (file: File) => Promise<any[]>;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

export type GridEventHandler<T = any> = (data: T) => void;
export type AsyncGridEventHandler<T = any> = (data: T) => Promise<void>;

export interface GridEventHandlers {
  onRowClick?: GridEventHandler<any>;
  onRowDoubleClick?: GridEventHandler<any>;
  onSelectionChange?: GridEventHandler<GridRowSelectionModel>;
  onSortChange?: GridEventHandler<GridSortModel>;
  onFilterChange?: GridEventHandler<GridFilterModel>;
  onPaginationChange?: GridEventHandler<GridPaginationModel>;
  onAdd?: GridEventHandler<void>;
  onEdit?: GridEventHandler<any>;
  onDelete?: GridEventHandler<any[]>;
  onRefresh?: GridEventHandler<void>;
  onExport?: GridEventHandler<any[]>;
  onImport?: AsyncGridEventHandler<File>;
  onError?: GridEventHandler<Error>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ============================================================================
// TYPE RE-EXPORTS
// ============================================================================

// Types are exported individually above
// When using these types, import them directly:
// import { BaseGridProps, BaseToolbarProps } from './types';

// For namespace imports:
// import type * as BaseTypes from './types';