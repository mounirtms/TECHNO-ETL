/**
 * Techno-ETL Type System
 * This file serves as the main entry point for all type definitions
 */

// Import individual types from our type files
import type { ApiResponse as ImportedApiResponse } from './api';
import type { User as ImportedUser } from './globalTypes';
import type { UserSettings as ImportedUserSettings } from './globalTypes';
import type { ApiError as ApiErrorType } from './api';
import type { ApiError as GlobalApiError } from './globalTypes';
import type { MuiComponentProps as GlobalMuiProps } from './globalTypes';
import type { BaseComponentProps as BaseCompProps } from './baseComponents';
import type { MuiComponentProps as BaseMuiProps } from './baseComponents';
import type { DataGridProps as ComponentDataGridProps } from './components';
import type { DialogProps as ComponentDialogProps } from './components';
import type { DataGridProps as MUIDataGridProps } from './muiTypes';
import type { DialogProps as MUIDialogProps } from './muiTypes';
import type { CircuitBreakerState as ApiCircuitBreakerState } from './apiServiceTypes';
import type { ServiceConfig as ApiServiceConfig } from './apiServiceTypes';

// Re-export specific types with clear naming to avoid conflicts
export type TechnoApiResponse = ImportedApiResponse;
export type TechnoUser = ImportedUser;
export type TechnoUserSettings = ImportedUserSettings;
export type TechnoApiError = ApiErrorType;
export type TechnoSystemError = GlobalApiError;
export type TechnoDataGridProps = ComponentDataGridProps;
export type TechnoMuiDataGrid = MUIDataGridProps;
export type TechnoDialogProps = ComponentDialogProps;
export type TechnoMuiDialog = MUIDialogProps;
export type TechnoCircuitBreakerState = ApiCircuitBreakerState;
export type TechnoServiceConfig = ApiServiceConfig;
export type TechnoBaseComponentProps = BaseCompProps;
export type TechnoMuiComponentProps = GlobalMuiProps;
export type TechnoBaseMuiProps = BaseMuiProps;

// Export all types from baseComponents directly
export * from './baseComponents';

// Export grid-specific types
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
  renderCell?: (value, row) => React.ReactNode;
export interface GridData {
  rows: any[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
// Context types
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
export interface LanguageContextType {
  currentLanguage: string;
  languages: Record<string, Language>;
  translate: (key: string, variables?: Record<string, any>) => string;
  setLanguage: (language: string) => void;
  direction: 'ltr' | 'rtl';
export interface Language {
  name: string;
  code: string;
  flag?: string;
  direction: 'ltr' | 'rtl';
export interface AuthContextType {
  currentUser: TechnoUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<TechnoApiResponse>;
  logout: () => Promise<void>;
  register: (userData: Partial<TechnoUser>) => Promise<TechnoApiResponse>;
  updateUser: (userData: Partial<TechnoUser>) => Promise<TechnoApiResponse>;
  refreshToken: () => Promise<void>;
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
export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  totalRevenue: number;
  syncStatus: 'online' | 'offline' | 'syncing' | 'error';
  lastSync: Date;