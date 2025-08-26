/**
 * Service Types for TECHNO-ETL
 * Type definitions for application services and business logic
 */

// Settings service types
export interface SettingsService {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  export(): Promise<string>;
  import(data: string): Promise<void>;
  migrate(fromVersion: string, toVersion: string): Promise<void>;
  validate(settings): Promise<ValidationResult>;
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
export interface ValidationError {
  field: string;
  message: string;
  code: string;
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
// API service types
export interface ApiService {
  get<T = any>(url: string, params?: Record<string, any>): Promise<T>;
  post<T = any>(url: string, data?): Promise<T>;
  put<T = any>(url: string, data?): Promise<T>;
  patch<T = any>(url: string, data?): Promise<T>;
  delete<T = any>(url: string): Promise<T>;
  upload(url: string, file: File, onProgress?: (progress: number) => void): Promise<any>;
  download(url: string, filename?: string): Promise<void>;
  setToken(token: string): void;
  clearToken(): void;
  setBaseURL(baseURL: string): void;
  setTimeout(timeout: number): void;
  setRetryAttempts(attempts: number): void;
  addInterceptor(type: 'request' | 'response', interceptor): void;
  removeInterceptor(type: 'request' | 'response', id: string): void;
// Cache service types
export interface CacheService {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, ttl?: number): Promise<void>;
  remove(key: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  expire(key: string, ttl: number): Promise<void>;
  increment(key: string, value?: number): Promise<number>;
  decrement(key: string, value?: number): Promise<number>;
  size(): Promise<number>;
  keys(pattern?: string): Promise<string[]>;
  flush(): Promise<void>;
// Logger service types
export interface LoggerService {
  debug(message: string, meta? ): void;
  info(message: string, meta? ): void;
  warn(message: string, meta? ): void;
  error(message: string, error?: Error, meta? ): void;
  fatal(message: string, error?: Error, meta? ): void;
  setLevel(level: LogLevel): void;
  addTransport(transport: LogTransport): void;
  removeTransport(name: string): void;
  createChild(context: string): LoggerService;
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogTransport {
  name: string;
  level: LogLevel;
  format?: (log: LogEntry) => string;
  destination: 'console' | 'file' | 'remote';
  options?: Record<string, any>;
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  meta?: any;
  error?: Error;
// Authentication service types
export interface AuthService {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
  refresh(): Promise<AuthResult>;
  register(userData: RegisterData): Promise<AuthResult>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resendVerification(email: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  hasPermission(permission: string): Promise<boolean>;
  hasRole(role: string): Promise<boolean>;
  isAuthenticated(): Promise<boolean>;
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  captcha?: string;
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  captcha?: string;
export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  permissions: string[];
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
// Notification service types
export interface NotificationService {
  show(notification: Notification): string;
  hide(id: string): void;
  clear(): void;
  success(message: string, options?: NotificationOptions): string;
  error(message: string, options?: NotificationOptions): string;
  warning(message: string, options?: NotificationOptions): string;
  info(message: string, options?: NotificationOptions): string;
  loading(message: string, options?: NotificationOptions): string;
  subscribe(callback: (notification: Notification) => void): () => void;
  unsubscribe(callback: (notification: Notification) => void): void;
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  actions?: NotificationAction[];
  position?: NotificationPosition;
  sticky?: boolean;
  progress?: number;
  timestamp: Date;
export interface NotificationOptions {
  title?: string;
  duration?: number;
  closable?: boolean;
  actions?: NotificationAction[];
  position?: NotificationPosition;
  sticky?: boolean;
export interface NotificationAction {
  label: string;
  action: () => void;
  primary?: boolean;
export type NotificationPosition = 
  | 'top-left' 
  | 'top-center' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right';

// File service types
export interface FileService {
  upload(file: File, path?: string, onProgress?: (progress: number) => void): Promise<FileUploadResult>;
  download(url: string, filename?: string): Promise<void>;
  delete(path: string): Promise<void>;
  list(path?: string): Promise<FileInfo[]>;
  getInfo(path: string): Promise<FileInfo>;
  generateUrl(path: string, expiresIn?: number): Promise<string>;
  validateFile(file: File, rules: FileValidationRules): ValidationResult;
  compressImage(file: File, options?: ImageCompressionOptions): Promise<File>;
  convertFormat(file: File, format: string): Promise<File>;
export interface FileUploadResult {
  id: string;
  path: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  checksum?: string;
export interface FileInfo {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  createdAt: Date;
  updatedAt: Date;
  isDirectory: boolean;
  children?: FileInfo[];
export interface FileValidationRules {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
export interface ImageCompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
// Search service types
export interface SearchService<T = any> {
  search(query: string, options?: SearchOptions): Promise<SearchResult<T>>;
  suggest(query: string, field?: string): Promise<string[]>;
  index(document: T, id?: string): Promise<void>;
  update(id: string, document: Partial<T>): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
  reindex(): Promise<void>;
  getStats(): Promise<SearchStats>;
export interface SearchOptions {
  fields?: string[];
  filters?: Record<string, any>;
  sort?: SortOption[];
  pagination?: PaginationOptions;
  highlight?: boolean;
  facets?: string[];
export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
export interface PaginationOptions {
  page: number;
  pageSize: number;
export interface SearchResult<T> {
  hits: SearchHit<T>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: Record<string, FacetResult[]>;
  suggestions?: string[];
  executionTime: number;
export interface SearchHit<T> {
  id: string;
  document: T;
  score: number;
  highlights?: Record<string, string[]>;
export interface FacetResult {
  value: string;
  count: number;
export interface SearchStats {
  totalDocuments: number;
  indexSize: number;
  lastIndexed: Date;
  searchesPerformed: number;
  averageSearchTime: number;
// Theme service types
export interface ThemeService {
  getCurrentTheme(): Promise<ThemeConfig>;
  setTheme(theme: Partial<ThemeConfig>): Promise<void>;
  resetTheme(): Promise<void>;
  getAvailableThemes(): Promise<ThemeInfo[]>;
  createCustomTheme(config: ThemeConfig): Promise<string>;
  deleteCustomTheme(id: string): Promise<void>;
  exportTheme(id?: string): Promise<string>;
  importTheme(data: string): Promise<string>;
  previewTheme(config: ThemeConfig): void;
  applyTheme(id: string): Promise<void>;
export interface ThemeConfig {
  id?: string;
  name: string;
  mode: 'light' | 'dark' | 'system';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
  borderRadius: number;
  spacing: number;
  typography: TypographyConfig;
  components?: ComponentThemeConfig;
export interface TypographyConfig {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  headings: {
    h1: TypographyVariant;
    h2: TypographyVariant;
    h3: TypographyVariant;
    h4: TypographyVariant;
    h5: TypographyVariant;
    h6: TypographyVariant;
  };
export interface TypographyVariant {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: number;
export interface ComponentThemeConfig {
  button?: any;
  input?: any;
  card?: any;
  modal?: any;
  table?: any;
export interface ThemeInfo {
  id: string;
  name: string;
  description?: string;
  preview?: string;
  author?: string;
  version?: string;
  isDefault?: boolean;
  isCustom?: boolean;
// Analytics service types
export interface AnalyticsService {
  track(event: AnalyticsEvent): Promise<void>;
  page(page: string, properties?: Record<string, any>): Promise<void>;
  identify(userId: string, traits?: Record<string, any>): Promise<void>;
  group(groupId: string, traits?: Record<string, any>): Promise<void>;
  alias(newId: string, previousId?: string): Promise<void>;
  reset(): Promise<void>;
  flush(): Promise<void>;
  setUserId(userId: string): void;
  getUserId(): string | null;
  getSessionId(): string;
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: Date;
  context?: AnalyticsContext;
export interface AnalyticsContext {
  page?: {
    url: string;
    title: string;
    path: string;
    referrer?: string;
  };
  device?: {
    type: string;
    brand?: string;
    model?: string;
  };
  os?: {
    name: string;
    version: string;
  };
  browser?: {
    name: string;
    version: string;
  };
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
// Export service factory type
export interface ServiceFactory {
  createApiService(config): ApiService;
  createCacheService(config): CacheService;
  createLoggerService(config): LoggerService;
  createAuthService(config): AuthService;
  createNotificationService(config): NotificationService;
  createFileService(config): FileService;
  createSearchService(config): SearchService;
  createThemeService(config): ThemeService;
  createAnalyticsService(config): AnalyticsService;
// Service registry type
export interface ServiceRegistry {
  register<T>(name: string, service: T): void;
  unregister(name: string): void;
  get<T>(name: string): T | null;
  has(name: string): boolean;
  list(): string[];
  clear(): void;
// Service configuration types
export interface ServiceConfig {
  name: string;
  enabled: boolean;
  options: Record<string, any>;
  dependencies?: string[];
  priority?: number;
export interface ServiceManager {
  register(config: ServiceConfig, factory: () => any): void;
  unregister(name: string): void;
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(name?: string): Promise<void>;
  getService<T>(name: string): T | null;
  getStatus(name?: string): ServiceStatus | Record<string, ServiceStatus>;
  onStatusChange(callback: (name: string, status: ServiceStatus) => void): () => void;
export interface ServiceStatus {
  name: string;
  status: 'stopped' | 'starting' | 'running' | 'stopping' | 'error';
  error?: Error;
  startTime?: Date;
  uptime?: number;