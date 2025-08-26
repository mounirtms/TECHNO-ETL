// API-related types

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode?: number;
export interface ApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | ApiError;
  metadata?: ApiMetadata;
  timestamp?: string;
export interface ApiMetadata {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  hasMore?: boolean;
  requestId?: string;
  version?: string;
// Product API Types
export interface ProductListResponse extends ApiResponse<Product[]> {
  metadata: ApiMetadata & {
    filters?: Record<string, any>;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
export interface ProductRequest {
  sku: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: string[];
  attributes?: Record<string, any>;
export interface ProductUpdateRequest extends Partial<ProductRequest> {
  id: string;
// Dashboard API Types
export interface DashboardStatsResponse extends ApiResponse<DashboardStats> {}

export interface SyncStatusResponse extends ApiResponse<SyncStatus> {}

// Authentication API Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
export interface LoginResponse extends ApiResponse<{
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}> {}

export interface RefreshTokenRequest {
  refreshToken: string;
export interface RefreshTokenResponse extends ApiResponse<{
  token: string;
  expiresIn: number;
}> {}

// Settings API Types
export interface SettingsResponse extends ApiResponse<UserSettings> {}

export interface UpdateSettingsRequest {
  settings: Partial<UserSettings>;
// File Upload Types
export interface FileUploadResponse extends ApiResponse<{
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}> {}

// Webhook Types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  source: string;
// ETL Types
export interface ETLJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  source: string;
  target: string;
  recordsProcessed: number;
  recordsTotal: number;
  errors?: string[];
export interface ETLJobResponse extends ApiResponse<ETLJob[]> {}

export interface ETLJobRequest {
  name: string;
  source: string;
  target: string;
  schedule?: string;
  config?: Record<string, any>;
// Magento Integration Types
export interface MagentoProduct {
  id: number;
  sku: string;
  name: string;
  price: number;
  status: number;
  visibility: number;
  type_id: string;
  created_at: string;
  updated_at: string;
  extension_attributes?: any;
  custom_attributes?: Array<{
    attribute_code: string;
    value: any;
  }>;
export interface MagentoCategory {
  id: number;
  parent_id: number;
  name: string;
  is_active: boolean;
  position: number;
  level: number;
  children_data?: MagentoCategory[];
// Firebase Types
export interface FirebaseError {
  code: string;
  message: string;
  stack?: string;
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
// Cache Types
export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'ttl';
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
// Performance Monitoring Types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  threshold?: {
    warning: number;
    critical: number;
  };
export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    overall: 'good' | 'warning' | 'critical';
    score: number;
    recommendations?: string[];
  };