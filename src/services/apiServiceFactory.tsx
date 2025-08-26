import React from 'react';
/**
 * API Service Factory - Ultra-Advanced Service Management
 * Centralized service creation with intelligent routing, caching, and monitoring
 * Uses cutting-edge patterns for maximum performance and reliability
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  ServiceType,
  ServiceConfig,
  ServiceConfigRegistry,
  CircuitBreaker as ICircuitBreaker,
  CircuitBreakerState,
  CircuitBreakerStatus,
  ServiceHealth,
  SystemMetrics,
  EnhancedAxiosInstance,
  RequestMetadata,
  EnhancedRequestConfig,
  EnhancedResponse,
  EnhancedError,
  ApiServiceFactoryInterface
} from '../types/apiServiceTypes';

/**
 * Service Configuration Registry
 * Defines routing and configuration for different service types
 */
const SERVICE_CONFIG: ServiceConfigRegistry = {
  dashboard: {
    baseURL: 'http://localhost:5000/api/dashboard',
    timeout: 10000,
    retries: 3,
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
  },
  mdm: {
    baseURL: 'http://localhost:5000/api/mdm',
    timeout: 15000,
    retries: 2,
    cacheTimeout: 2 * 60 * 1000, // 2 minutes
  },
  task: {
    baseURL: 'http://localhost:5000/api/task',
    timeout: 10000,
    retries: 3,
    cacheTimeout: 1 * 60 * 1000, // 1 minute
  },
  magento: {
    baseURL: 'http://localhost:5000/api/magento', // Proxied through backend
    timeout: 20000,
    retries: 2,
    cacheTimeout: 3 * 60 * 1000, // 3 minutes
    // Can be overridden with direct URL from settings
    allowDirectUrl: true,
  },
  health: {
    baseURL: 'http://localhost:5000/api/health',
    timeout: 5000,
    retries: 1,
    cacheTimeout: 30 * 1000, // 30 seconds
};

/**
 * Circuit Breaker Implementation
 * Prevents cascading failures by monitoring service health
 */
class CircuitBreaker implements ICircuitBreaker {
  public failureCount: number;
  public lastFailureTime: number | null;
  public state: CircuitBreakerState;

  constructor(public name: string, public threshold: number = 5, public timeout: number = 60000) {
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if(this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.timeout) {
        this.state = 'HALF_OPEN';
        console.log(`🔄 Circuit breaker ${this.name} transitioning to HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch(error: any) {
      this.onFailure();
      throw error;
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if(this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      console.warn(`🚨 Circuit breaker ${this.name} is now OPEN`);
  getState(): CircuitBreakerStatus {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
/**
 * Advanced API Service Factory Class
 * Creates and manages API service instances with intelligent features
 */
class ApiServiceFactory implements ApiServiceFactoryInterface {
  private services: Map<string, EnhancedAxiosInstance>;
  private circuitBreakers: Map<string, CircuitBreaker>;
  private globalMetrics: {
    totalRequests: number;
    totalErrors: number;
    totalDuration: number;
    serviceMetrics: Record<string, {
      requests: number;
      errors: number;
      totalDuration: number;
    }>;
  };

  constructor() {
    this.services = new Map();
    this.circuitBreakers = new Map();
    this.globalMetrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalDuration: 0,
      serviceMetrics: {}
    };

    // Initialize circuit breakers for each service type
    Object.keys(SERVICE_CONFIG).forEach((serviceType) => {
      this.circuitBreakers.set(serviceType, new CircuitBreaker(serviceType));
    });
  /**
   * Create or retrieve a service instance
   */
  getService(serviceType: ServiceType, customConfig: Partial<ServiceConfig> = {}): EnhancedAxiosInstance {
    const cacheKey = `${serviceType}_${JSON.stringify(customConfig)}`;
    
    if (this.services.has(cacheKey)) {
      return this.services.get(cacheKey)!;
    const service = this.createService(serviceType, customConfig);
    this.services.set(cacheKey, service);
    
    return service;
  /**
   * Create a new service instance with advanced configuration
   */
  createService(serviceType: ServiceType, customConfig: Partial<ServiceConfig> = {}): EnhancedAxiosInstance {
    const config = { ...SERVICE_CONFIG[serviceType],
      ...customConfig
    };

    // Handle Magento direct URL override
    if(serviceType === 'magento' && customConfig.directUrl && config.allowDirectUrl) {
      config.baseURL = customConfig.directUrl;
      console.log(`🔗 Using direct Magento URL: ${config.baseURL}`);
    // Create axios instance
    const axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Type': serviceType,
        'X-Client': 'Techno-ETL-Frontend',
        'X-Version': '2.0.0',
        ...customConfig.headers
    }) as EnhancedAxiosInstance;

    // Add request interceptor
    axiosInstance.interceptors.request.use(
      (requestConfig: AxiosRequestConfig): EnhancedRequestConfig => {
        const enhancedConfig = requestConfig as EnhancedRequestConfig;
        enhancedConfig.metadata = {
          startTime: Date.now(),
          serviceType,
          requestId: `${serviceType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        this.globalMetrics.totalRequests++;
        if(!this.globalMetrics.serviceMetrics[serviceType]) {
          this.globalMetrics.serviceMetrics[serviceType] = {
            requests: 0,
            errors: 0,
            totalDuration: 0
          };
        this.globalMetrics.serviceMetrics[serviceType].requests++;
        
        console.log(`🚀 ${serviceType.toUpperCase()} Request [${enhancedConfig.metadata.requestId}]: ${enhancedConfig.method?.toUpperCase()} ${enhancedConfig.url}`);
        return enhancedConfig;
      },
      (error) => {
        console.error(`❌ ${serviceType.toUpperCase()} Request Error:`, error);
        return Promise.reject(error);
    );

    // Add response interceptor with circuit breaker
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse): EnhancedResponse => {
        const enhancedResponse = response as EnhancedResponse;
        const duration = Date.now() - (enhancedResponse.config.metadata?.startTime || 0);
        const requestId = enhancedResponse.config.metadata?.requestId || 'unknown';
        
        this.globalMetrics.totalDuration += duration;
        this.globalMetrics.serviceMetrics[serviceType].totalDuration += duration;
        
        console.log(`✅ ${serviceType.toUpperCase()} Response [${requestId}]: ${enhancedResponse.status} (${duration}ms)`);
        
        // Add metadata to response
        enhancedResponse.metadata = {
          duration,
          requestId,
          serviceType,
          timestamp: new Date().toISOString()
        };
        
        return enhancedResponse;
      },
      (error): Promise<never> => {
        const enhancedError = error as EnhancedError;
        const duration = enhancedError.config?.metadata ? Date.now() - enhancedError.config.metadata.startTime : 0;
        const requestId = enhancedError.config?.metadata?.requestId || 'unknown';
        
        this.globalMetrics.totalErrors++;
        if(this.globalMetrics.serviceMetrics[serviceType]) {
          this.globalMetrics.serviceMetrics[serviceType].errors++;
        console.error(`❌ ${serviceType.toUpperCase()} Error [${requestId}]: ${enhancedError.message} (${duration}ms)`);
        
        // Add metadata to error
        enhancedError.metadata = {
          duration,
          requestId,
          serviceType,
          timestamp: new Date().toISOString(),
          retryable: this.isRetryableError(enhancedError)
        };
        
        return Promise.reject(enhancedError);
    );

    // Add circuit breaker wrapper
    const circuitBreaker = this.circuitBreakers.get(serviceType);
    if(!circuitBreaker) {
      throw new Error(`Circuit breaker for ${serviceType} not found`);
    const originalRequest = axiosInstance.request.bind(axiosInstance);
    
    axiosInstance.request = async <T = any, R = AxiosResponse<T>>(requestConfig: AxiosRequestConfig): Promise<R> => {
      return circuitBreaker.execute(() => originalRequest(requestConfig)) as Promise<R>;
    };

    // Add service-specific methods
    axiosInstance.serviceType = serviceType;
    axiosInstance.config = config;
    axiosInstance.getServiceHealth = () => this.getServiceHealth(serviceType);
    axiosInstance.clearCache = () => this.clearServiceCache(serviceType);

    return axiosInstance;
  /**
   * Get service health information
   */
  getServiceHealth(serviceType: ServiceType): ServiceHealth {
    const circuitBreaker = this.circuitBreakers.get(serviceType);
    const metrics = this.globalMetrics.serviceMetrics[serviceType] || {
      requests: 0,
      errors: 0,
      totalDuration: 0
    };

    const errorRate = metrics.requests > 0 ? (metrics.errors / metrics.requests) * 100 : 0;
    const avgDuration = metrics.requests > 0 ? metrics.totalDuration / metrics.requests : 0;

    return {
      serviceType,
      circuitBreaker: circuitBreaker.getState(),
      metrics: { ...metrics,
        errorRate: Math.round(errorRate * 100) / 100,
        avgDuration: Math.round(avgDuration)
      },
      healthy: circuitBreaker?.state === 'CLOSED' && errorRate < 10,
      timestamp: new Date().toISOString()
    };
  /**
   * Get comprehensive system metrics
   */
  getSystemMetrics(): SystemMetrics {
    const services = {};
    
    Object.keys(SERVICE_CONFIG).forEach((serviceType) => {
      services[serviceType] = this.getServiceHealth(serviceType);
    });

    const totalErrorRate = this.globalMetrics.totalRequests > 0 
      ? (this.globalMetrics.totalErrors / this.globalMetrics.totalRequests) * 100 
      : 0;
    
    const avgDuration = this.globalMetrics.totalRequests > 0 
      ? this.globalMetrics.totalDuration / this.globalMetrics.totalRequests 
      : 0;

    return {
      global: { ...this.globalMetrics,
        errorRate: Math.round(totalErrorRate * 100) / 100,
        avgDuration: Math.round(avgDuration)
      },
      services,
      timestamp: new Date().toISOString()
    };
  /**
   * Determine if an error is retryable
   */
  isRetryableError(error: EnhancedError): boolean {
    if (error.code === 'ECONNABORTED') return true; // Timeout
    if (error.response?.status >= 500) return true; // Server errors
    if (error.response?.status ===429) return true; // Rate limiting
    return false;
  /**
   * Clear cache for a specific service
   */
  clearServiceCache(serviceType: ServiceType): void {
    const keysToDelete = [];
    for([key] of this.services) {
      if (key.startsWith(serviceType)) {
        keysToDelete.push(key);
    keysToDelete.forEach((key) => this.services.delete(key));
    console.log(`🗑️ Cleared cache for ${serviceType} service`);
  /**
   * Clear all service caches
   */
  clearAllCaches(): void {
    this.services.clear();
    console.log('🗑️ All service caches cleared');
  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.globalMetrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalDuration: 0,
      serviceMetrics: {}
    };
    
    // Reset circuit breakers
    this.circuitBreakers.forEach((cb) => {
      cb.failureCount = 0;
      cb.state = 'CLOSED';
      cb.lastFailureTime = null;
    });
    
    console.log('📊 All metrics and circuit breakers reset');
  /**
   * Convenience methods for specific services
   */
  getDashboardService(customConfig: Partial<ServiceConfig> = {}): EnhancedAxiosInstance {
    return this.getService('dashboard', customConfig);
  getMDMService(customConfig: Partial<ServiceConfig> = {}): EnhancedAxiosInstance {
    return this.getService('mdm', customConfig);
  getTaskService(customConfig: Partial<ServiceConfig> = {}): EnhancedAxiosInstance {
    return this.getService('task', customConfig);
  getMagentoService(customConfig: Partial<ServiceConfig> = {}): EnhancedAxiosInstance {
    return this.getService('magento', customConfig);
  getHealthService(customConfig: Partial<ServiceConfig> = {}): EnhancedAxiosInstance {
    return this.getService('health', customConfig);
// Create singleton instance
const apiServiceFactory = new ApiServiceFactory();

// Export both the class and the singleton
export { ApiServiceFactory, SERVICE_CONFIG };
export default apiServiceFactory;

/**
 * Usage Examples:
 * 
 * // Get a standard service
 * const dashboardService = apiServiceFactory.getDashboardService();
 * const response = await dashboardService.get('/stats');
 * 
 * // Get Magento service with direct URL
 * const magentoService = apiServiceFactory.getMagentoService({
 *   directUrl: 'https://magento.example.com/rest/V1'
 * });
 * 
 * // Get service health
 * const health = apiServiceFactory.getServiceHealth('dashboard');
 * console.log('Service health:', health);
 * 
 * // Get system metrics
 * const metrics = apiServiceFactory.getSystemMetrics();
 * console.log('System metrics:', metrics);
 * 
 * // Clear caches
 * apiServiceFactory.clearServiceCache('magento');
 * apiServiceFactory.clearAllCaches();
 */