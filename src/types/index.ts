// Common types for the application

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  avatar?: string;
  lastLogin?: Date;
  settings?: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'standard' | 'comfortable';
  animations: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    keyboardNavigation: boolean;
    screenReader: boolean;
  };
  performance: {
    defaultPageSize: number;
    refreshInterval: number;
    enableVirtualization: boolean;
    cacheEnabled: boolean;
    autoRefresh: boolean;
    lazyLoading: boolean;
  };
  security: {
    sessionTimeout: number;
    twoFactorEnabled: boolean;
    auditLogging: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  metadata?: {
    page?: number;
    pageSize?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface GridColumn {
  id: string;
  label: string;
  field: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'actions';
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  renderCell?: (value: any, row: any) => React.ReactNode;
}

export interface GridData {
  rows: any[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
}

export interface ThemeContextType {
  mode: 'light' | 'dark' | 'system';
  colorPreset: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'standard' | 'comfortable';
  animations: boolean;
  highContrast: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setColorPreset: (preset: string) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setDensity: (density: 'compact' | 'standard' | 'comfortable') => void;
  setAnimations: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
}

export interface LanguageContextType {
  currentLanguage: string;
  languages: Record<string, Language>;
  translate: (key: string, variables?: Record<string, any>) => string;
  setLanguage: (language: string) => void;
  direction: 'ltr' | 'rtl';
}

export interface Language {
  name: string;
  code: string;
  flag?: string;
  direction: 'ltr' | 'rtl';
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<ApiResponse>;
  updateUser: (userData: Partial<User>) => Promise<ApiResponse>;
  refreshToken: () => Promise<void>;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  syncStatus: 'online' | 'offline' | 'syncing' | 'error';
  lastSync: Date;
}

// Component Props Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export interface CardProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

// Utility Types
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
export type ComponentSize = 'sm' | 'md' | 'lg';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Event Handler Types
export type EventHandler<T = void> = () => T;
export type ValueEventHandler<T, R = void> = (value: T) => R;
export type ChangeEventHandler<T = string> = (event: React.ChangeEvent<T>) => void;

// API Types
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

export interface SyncStatus {
  status: 'online' | 'offline' | 'syncing' | 'error';
  lastSync: Date;
  nextSync?: Date;
  errorMessage?: string;
  progress?: number;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: any; label: string }>;
  validation?: (value: any) => string | undefined;
}

export interface FormData {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType;
  children?: NavItem[];
  badge?: string | number;
  disabled?: boolean;
}

// Export all types for easy importing
export * from './api';
export * from './components';
export * from './contexts';
