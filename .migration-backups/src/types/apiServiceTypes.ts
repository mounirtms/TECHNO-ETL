/**
 * API Service Types
 * Centralized type definitions for API services
 */
import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  baseURL: string;
  timeout: number;
  retries?: number;
  cacheTimeout?: number;
  allowDirectUrl?: boolean;
  headers?: Record<string, string>;
  [key: string]: any;
}

/**
 * Service type definitions
 */
export type ServiceType = 'dashboard' | 'mdm' | 'task' | 'magento' | 'health';

/**
 * Service configuration registry
 */
export interface ServiceConfigRegistry {
  [key: string]: ServiceConfig;
}

/**
 * Circuit breaker state enum
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit breaker interface
 */
export interface CircuitBreaker {
  name: string;
  threshold: number;
  timeout: number;
  failureCount: number;
  lastFailureTime: number | null;
  state: CircuitBreakerState;
  execute<T>(operation: () => Promise<T>): Promise<T>;
  onSuccess(): void;
  onFailure(): void;
  getState(): CircuitBreakerStatus;
}

/**
 * Circuit breaker status
 */
export interface CircuitBreakerStatus {
  name: string;
  state: CircuitBreakerState;
  failureCount: number;
  lastFailureTime: number | null;
}

/**
 * Service metrics
 */
export interface ServiceMetrics {
  requests: number;
  errors: number;
  totalDuration: number;
  errorRate?: number;
  avgDuration?: number;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  global: {
    totalRequests: number;
    totalErrors: number;
    totalDuration: number;
    errorRate: number;
    avgDuration: number;
    serviceMetrics: Record<string, ServiceMetrics>;
  };
  services: Record<string, ServiceHealth>;
  timestamp: string;
}

/**
 * Service health
 */
export interface ServiceHealth {
  serviceType: string;
  circuitBreaker: CircuitBreakerStatus;
  metrics: ServiceMetrics;
  healthy: boolean;
  timestamp: string;
}

/**
 * Extended Axios Instance with service methods
 */
export interface EnhancedAxiosInstance extends AxiosInstance {
  serviceType: ServiceType;
  config: ServiceConfig;
  getServiceHealth: () => ServiceHealth;
  clearCache: () => void;
}

/**
 * Request metadata
 */
export interface RequestMetadata {
  startTime: number;
  serviceType: ServiceType;
  requestId: string;
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  duration: number;
  requestId: string;
  serviceType: ServiceType;
  timestamp: string;
}

/**
 * Error metadata
 */
export interface ErrorMetadata {
  duration: number;
  requestId: string;
  serviceType: ServiceType;
  timestamp: string;
  retryable: boolean;
}

/**
 * Extended Axios request config
 */
export interface EnhancedRequestConfig extends AxiosRequestConfig {
  metadata?: RequestMetadata;
}

/**
 * Extended Axios response
 */
export interface EnhancedResponse<T = any> extends AxiosResponse<T> {
  metadata?: ResponseMetadata;
  config: EnhancedRequestConfig;
}

/**
 * Extended Axios error
 */
export interface EnhancedError extends AxiosError {
  metadata?: ErrorMetadata;
  config?: EnhancedRequestConfig;
}

/**
 * API Factory interface
 */
export interface ApiServiceFactoryInterface {
  getService(serviceType: ServiceType, customConfig?: Partial<ServiceConfig>): EnhancedAxiosInstance;
  createService(serviceType: ServiceType, customConfig?: Partial<ServiceConfig>): EnhancedAxiosInstance;
  getServiceHealth(serviceType: ServiceType): ServiceHealth;
  getSystemMetrics(): SystemMetrics;
  isRetryableError(error: EnhancedError): boolean;
  clearServiceCache(serviceType: ServiceType): void;
  clearAllCaches(): void;
  resetMetrics(): void;
  getDashboardService(customConfig?: Partial<ServiceConfig>): EnhancedAxiosInstance;
  getMDMService(customConfig?: Partial<ServiceConfig>): EnhancedAxiosInstance;
  getTaskService(customConfig?: Partial<ServiceConfig>): EnhancedAxiosInstance;
  getMagentoService(customConfig?: Partial<ServiceConfig>): EnhancedAxiosInstance;
  getHealthService(customConfig?: Partial<ServiceConfig>): EnhancedAxiosInstance;
}