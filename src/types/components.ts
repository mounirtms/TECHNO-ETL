/**
 * Component Types for TECHNO-ETL
 * Type definitions for React components and their props
 */

import { ReactNode, ComponentType } from 'react';
import { SxProps, Theme } from '@mui/material/styles';

// Base component props
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
  children?: ReactNode;
  'data-testid'?: string;
}

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
}

export interface SidebarProps extends BaseComponentProps {
  collapsed?: boolean;
  onToggle?: () => void;
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  children?: SidebarItem[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
}

export interface HeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  searchable?: boolean;
  onSearch?: (query: string) => void;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
}

// Dashboard component types
export interface DashboardProps extends BaseComponentProps {
  layout?: 'default' | 'compact' | 'detailed';
  widgets?: DashboardWidget[];
  onWidgetToggle?: (widgetId: string, visible: boolean) => void;
  onLayoutChange?: (layout: 'default' | 'compact' | 'detailed') => void;
}

export interface DashboardWidget {
  id: string;
  title: string;
  component: ComponentType<any>;
  props?: Record<string, any>;
  size?: { width: number; height: number };
  position?: { x: number; y: number };
  visible: boolean;
  resizable?: boolean;
  draggable?: boolean;
}

export interface StatsCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  onClick?: () => void;
}

export interface ChartProps extends BaseComponentProps {
  data: any[];
  title?: string;
  subtitle?: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  height?: number;
  width?: number;
  colors?: string[];
  loading?: boolean;
  error?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  onDataPointClick?: (data) => void;
}

// Form component types
export interface FormProps extends BaseComponentProps {
  onSubmit: (data) => void;
  initialValues?: Record<string, any>;
  validationSchema?: any;
  loading?: boolean;
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
}

export interface FormFieldProps extends BaseComponentProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: any;
  onChange?: (value) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export interface SelectFieldProps extends FormFieldProps {
  options: SelectOption[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  createable?: boolean;
  loading?: boolean;
  onSearch?: (query: string) => void;
  onCreate?: (value: string) => void;
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: ReactNode;
  description?: string;
}

// Data grid component types
export interface DataGridProps<T = any> extends BaseComponentProps {
  data: T[];
  columns: GridColumn<T>[];
  loading?: boolean;
  error?: string;
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  filtering?: FilteringConfig;
  selection?: SelectionConfig;
  virtualization?: VirtualizationConfig;
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  onSortChange?: (field: string, direction: 'asc' | 'desc' | null) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface GridColumn<T = any> {
  field: keyof T;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  visible?: boolean;
  pinned?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'boolean' | 'actions' | 'custom';
  format?: (value, row: T) => ReactNode;
  render?: (value row: T, index: number) => ReactNode;
  cellProps?: (value row: T) => Record<string, any>;
  headerProps?: Record<string, any>;
}

export interface PaginationConfig {
  enabled: boolean;
  page: number;
  pageSize: number;
  pageSizeOptions?: number[];
  total: number;
  showInfo?: boolean;
  showPageSizeSelector?: boolean;
}

export interface SortingConfig {
  enabled: boolean;
  field?: string;
  direction?: 'asc' | 'desc';
  multiple?: boolean;
}

export interface FilteringConfig {
  enabled: boolean;
  filters?: Record<string, any>;
  quickFilter?: string;
  operators?: FilterOperator[];
}

export interface FilterOperator {
  value: string;
  label: string;
  types: string[];
}

export interface SelectionConfig {
  enabled: boolean;
  multiple?: boolean;
  rowSelection?: boolean;
  cellSelection?: boolean;
  selectedRows?: any[];
}

export interface VirtualizationConfig {
  enabled: boolean;
  itemHeight?: number;
  overscan?: number;
  threshold?: number;
}

// Modal and dialog component types
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closable?: boolean;
  backdrop?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  scrollable?: boolean;
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
}

export interface DialogProps extends ModalProps {
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm';
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Navigation component types
export interface TabsProps extends BaseComponentProps {
  value: string | number;
  onChange: (value: string | number) => void;
  tabs: TabItem[];
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  orientation?: 'horizontal' | 'vertical';
  lazy?: boolean;
  keepAlive?: boolean;
}

export interface TabItem {
  value: string | number;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
  closable?: boolean;
  content?: ReactNode;
}

export interface MenuProps extends BaseComponentProps {
  items: MenuItem[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'horizontal' | 'vertical';
  trigger?: 'hover' | 'click';
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
  children?: MenuItem[];
  onClick?: () => void;
}

// Notification component types
export interface NotificationProps {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  actions?: NotificationAction[];
  onClose?: () => void;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

// Loading component types
export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'linear' | 'skeleton';
  overlay?: boolean;
  text?: string;
  delay?: number;
}

export interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  lines?: number;
  animation?: 'pulse' | 'wave' | false;
}

// Error boundary types
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: any[];
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  hasError: boolean;
}

// Theme provider types
export interface ThemeProviderProps extends BaseComponentProps {
  theme?: 'light' | 'dark' | 'system';
  primary?: string;
  secondary?: string;
  customTheme?: any;
}

// Context types
export interface ContextProviderProps<T = any> extends BaseComponentProps {
  value: T;
  initialValue?: T;
  persist?: boolean;
  storageKey?: string;
}

// Higher-order component types
export interface WithLoadingProps {
  loading: boolean;
  error?: string;
}

export interface WithAuthProps {
  user?;
  authenticated: boolean;
  loading: boolean;
}

export interface WithPermissionsProps {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
}

// Event handler types
export type EventHandler<T = any> = (event: T) => void;
export type ChangeHandler<T = any> = (value: T) => void;
export type ClickHandler = EventHandler<React.MouseEvent>;
export type KeyboardHandler = EventHandler<React.KeyboardEvent>;
export type FormSubmitHandler = EventHandler<React.FormEvent>;

// Utility types for components
export type ComponentSize = 'small' | 'medium' | 'large';
export type ComponentVariant = 'primary' | 'secondary' | 'tertiary';
export type ComponentColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ComponentState = 'idle' | 'loading' | 'success' | 'error';

// Export all types
export type {
  BaseComponentProps as BaseProps,
  FormFieldProps as FieldProps,
  DataGridProps as GridProps,
  GridColumn as Column,
};
