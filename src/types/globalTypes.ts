/**
 * Global type definitions for Techno-ETL
 * This file contains centralized type definitions used throughout the application
 * It serves as a single source of truth for common interfaces and types
 */

import { ReactNode, ElementType } from 'react';
import { SxProps, Theme } from '@mui/material';

/**
 * Common React component props
 */
export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
/**
 * Common MUI component props
 */
export interface MuiComponentProps extends BaseComponentProps {
  sx?: SxProps<Theme>;
/**
 * API Response types
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
  request?: any;
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  data?: any;
/**
 * User related types
 */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: string;
  isMagentoUser?: boolean;
  token?: string;
  createdAt?: string;
  lastLogin?: string;
export interface UserSettings {
  preferences: {
    language?: string;
    theme?: string;
    fontSize?: string;
    density?: string;
    animations?: boolean;
    highContrast?: boolean;
    colorPreset?: string;
    [key: string]: any;
  };
  lastSync?: string;
  userId: string;
  email?: string | null;
/**
 * Common UI component props
 */
export interface CardProps extends MuiComponentProps {
  title?: string;
  subtitle?: string;
  icon?: ElementType;
  loading?: boolean;
  error?: Error | null;
  variant?: 'elevation' | 'outlined';
  elevation?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  clickable?: boolean;
  onClick?: () => void;
/**
 * Common data types
 */
export interface DataItem {
  id: string | number;
  [key: string]: any;
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
/**
 * Grid related types
 */
export interface GridColumn {
  field: string;
  headerName: string;
  width?: number;
  flex?: number;
  renderCell?: (params) => ReactNode;
  valueGetter?: (params) => any;
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  [key: string]: any;
export interface GridSettings {
  columns: GridColumn[];
  pageSize: number;
  sortModel?: Array<{ field: string; sort: 'asc' | 'desc' }>;
  filterModel?: any;
  density?: 'compact' | 'standard' | 'comfortable';
/**
 * Service configuration
 */
export interface ServiceConfig {
  baseURL: string;
  timeout: number;
  retries?: number;
  cacheTimeout?: number;
  allowDirectUrl?: boolean;
  [key: string]: any;
/**
 * Circuit breaker types
 */
export interface CircuitBreakerState {
  name: string;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number | null;
/**
 * Helper type utilities
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ValueOf<T> = T[keyof T];
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;