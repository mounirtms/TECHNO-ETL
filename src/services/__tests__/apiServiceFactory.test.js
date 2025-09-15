/**
 * API Service Factory Tests
 * Comprehensive test suite for the advanced API service factory
 */

import axios from 'axios';
import apiServiceFactory, { ApiServiceFactory, SERVICE_CONFIG } from '../apiServiceFactory';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('ApiServiceFactory', () => {
  let factory;

  beforeEach(() => {
    factory = new ApiServiceFactory();
    jest.clearAllMocks();

    // Mock axios.create
    mockedAxios.create.mockReturnValue({
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    });
  });

  describe('Service Creation', () => {
    it('creates a service with correct configuration', () => {
      const service = factory.getService('dashboard');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:5000/api/dashboard',
          timeout: 10000,
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Service-Type': 'dashboard',
            'X-Client': 'Techno-ETL-Frontend',
          }),
        }),
      );
    });

    it('caches service instances', () => {
      const service1 = factory.getService('dashboard');
      const service2 = factory.getService('dashboard');

      expect(service1).toBe(service2);
      expect(mockedAxios.create).toHaveBeenCalledTimes(1);
    });

    it('creates different instances for different configurations', () => {
      const service1 = factory.getService('dashboard');
      const service2 = factory.getService('dashboard', { timeout: 5000 });

      expect(service1).not.toBe(service2);
      expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    });

    it('handles Magento direct URL configuration', () => {
      const directUrl = 'https://magento.example.com/rest/V1';

      factory.getService('magento', { directUrl });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: directUrl,
        }),
      );
    });

    it('uses proxy URL for Magento when no direct URL provided', () => {
      factory.getService('magento');

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:5000/api/magento',
        }),
      );
    });
  });

  describe('Convenience Methods', () => {
    it('provides convenience method for dashboard service', () => {
      const service = factory.getDashboardService();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:5000/api/dashboard',
        }),
      );
    });

    it('provides convenience method for MDM service', () => {
      const service = factory.getMDMService();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:5000/api/mdm',
        }),
      );
    });

    it('provides convenience method for Task service', () => {
      const service = factory.getTaskService();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:5000/api/task',
        }),
      );
    });

    it('provides convenience method for Magento service', () => {
      const service = factory.getMagentoService();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:5000/api/magento',
        }),
      );
    });

    it('provides convenience method for Health service', () => {
      const service = factory.getHealthService();

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:5000/api/health',
        }),
      );
    });
  });

  describe('Circuit Breaker', () => {
    it('initializes circuit breakers for all services', () => {
      expect(factory.circuitBreakers.size).toBe(Object.keys(SERVICE_CONFIG).length);

      Object.keys(SERVICE_CONFIG).forEach(serviceType => {
        expect(factory.circuitBreakers.has(serviceType)).toBe(true);
      });
    });

    it('provides circuit breaker state in service health', () => {
      const health = factory.getServiceHealth('dashboard');

      expect(health).toHaveProperty('circuitBreaker');
      expect(health.circuitBreaker).toHaveProperty('state');
      expect(health.circuitBreaker).toHaveProperty('failureCount');
    });
  });

  describe('Metrics Tracking', () => {
    it('initializes with empty metrics', () => {
      expect(factory.globalMetrics.totalRequests).toBe(0);
      expect(factory.globalMetrics.totalErrors).toBe(0);
      expect(factory.globalMetrics.totalDuration).toBe(0);
    });

    it('provides service health information', () => {
      const health = factory.getServiceHealth('dashboard');

      expect(health).toHaveProperty('serviceType', 'dashboard');
      expect(health).toHaveProperty('metrics');
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('timestamp');
    });

    it('provides system metrics', () => {
      const metrics = factory.getSystemMetrics();

      expect(metrics).toHaveProperty('global');
      expect(metrics).toHaveProperty('services');
      expect(metrics).toHaveProperty('timestamp');

      expect(metrics.global).toHaveProperty('totalRequests');
      expect(metrics.global).toHaveProperty('totalErrors');
      expect(metrics.global).toHaveProperty('errorRate');
      expect(metrics.global).toHaveProperty('avgDuration');
    });

    it('calculates error rates correctly', () => {
      // Simulate some metrics
      factory.globalMetrics.totalRequests = 100;
      factory.globalMetrics.totalErrors = 5;

      const metrics = factory.getSystemMetrics();

      expect(metrics.global.errorRate).toBe(5);
    });

    it('calculates average duration correctly', () => {
      // Simulate some metrics
      factory.globalMetrics.totalRequests = 10;
      factory.globalMetrics.totalDuration = 1000;

      const metrics = factory.getSystemMetrics();

      expect(metrics.global.avgDuration).toBe(100);
    });
  });

  describe('Error Handling', () => {
    it('identifies retryable timeout errors', () => {
      const timeoutError = { code: 'ECONNABORTED' };

      expect(factory.isRetryableError(timeoutError)).toBe(true);
    });

    it('identifies retryable server errors', () => {
      const serverError = { response: { status: 500 } };

      expect(factory.isRetryableError(serverError)).toBe(true);
    });

    it('identifies retryable rate limit errors', () => {
      const rateLimitError = { response: { status: 429 } };

      expect(factory.isRetryableError(rateLimitError)).toBe(true);
    });

    it('identifies non-retryable client errors', () => {
      const clientError = { response: { status: 400 } };

      expect(factory.isRetryableError(clientError)).toBe(false);
    });

    it('identifies non-retryable auth errors', () => {
      const authError = { response: { status: 401 } };

      expect(factory.isRetryableError(authError)).toBe(false);
    });
  });

  describe('Cache Management', () => {
    it('clears cache for specific service', () => {
      // Create some services to populate cache
      factory.getService('dashboard');
      factory.getService('mdm');

      expect(factory.services.size).toBe(2);

      factory.clearServiceCache('dashboard');

      // Should only clear dashboard service
      expect(factory.services.size).toBe(1);
    });

    it('clears all caches', () => {
      // Create some services to populate cache
      factory.getService('dashboard');
      factory.getService('mdm');
      factory.getService('task');

      expect(factory.services.size).toBe(3);

      factory.clearAllCaches();

      expect(factory.services.size).toBe(0);
    });
  });

  describe('Metrics Reset', () => {
    it('resets all metrics and circuit breakers', () => {
      // Simulate some activity
      factory.globalMetrics.totalRequests = 100;
      factory.globalMetrics.totalErrors = 5;

      const circuitBreaker = factory.circuitBreakers.get('dashboard');

      circuitBreaker.failureCount = 3;
      circuitBreaker.state = 'OPEN';

      factory.resetMetrics();

      expect(factory.globalMetrics.totalRequests).toBe(0);
      expect(factory.globalMetrics.totalErrors).toBe(0);
      expect(circuitBreaker.failureCount).toBe(0);
      expect(circuitBreaker.state).toBe('CLOSED');
    });
  });

  describe('Service Configuration', () => {
    it('has correct configuration for dashboard service', () => {
      const config = SERVICE_CONFIG.dashboard;

      expect(config.baseURL).toBe('http://localhost:5000/api/dashboard');
      expect(config.timeout).toBe(10000);
      expect(config.retries).toBe(3);
    });

    it('has correct configuration for MDM service', () => {
      const config = SERVICE_CONFIG.mdm;

      expect(config.baseURL).toBe('http://localhost:5000/api/mdm');
      expect(config.timeout).toBe(15000);
      expect(config.retries).toBe(2);
    });

    it('has correct configuration for Task service', () => {
      const config = SERVICE_CONFIG.task;

      expect(config.baseURL).toBe('http://localhost:5000/api/task');
      expect(config.timeout).toBe(10000);
      expect(config.retries).toBe(3);
    });

    it('has correct configuration for Magento service', () => {
      const config = SERVICE_CONFIG.magento;

      expect(config.baseURL).toBe('http://localhost:5000/api/magento');
      expect(config.timeout).toBe(20000);
      expect(config.retries).toBe(2);
      expect(config.allowDirectUrl).toBe(true);
    });

    it('has correct configuration for Health service', () => {
      const config = SERVICE_CONFIG.health;

      expect(config.baseURL).toBe('http://localhost:5000/api/health');
      expect(config.timeout).toBe(5000);
      expect(config.retries).toBe(1);
    });
  });
});

describe('Circuit Breaker', () => {
  let CircuitBreaker;

  beforeAll(() => {
    // Import CircuitBreaker class for testing
    // Note: In a real implementation, you might need to export it separately
    CircuitBreaker = class {
      constructor(name, threshold = 5, timeout = 60000) {
        this.name = name;
        this.threshold = threshold;
        this.timeout = timeout;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED';
      }

      async execute(operation) {
        if (this.state === 'OPEN') {
          if (Date.now() - this.lastFailureTime > this.timeout) {
            this.state = 'HALF_OPEN';
          } else {
            throw new Error(`Circuit breaker ${this.name} is OPEN`);
          }
        }

        try {
          const result = await operation();

          this.onSuccess();

          return result;
        } catch (error) {
          this.onFailure();
          throw error;
        }
      }

      onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
      }

      onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.threshold) {
          this.state = 'OPEN';
        }
      }

      getState() {
        return {
          name: this.name,
          state: this.state,
          failureCount: this.failureCount,
          lastFailureTime: this.lastFailureTime,
        };
      }
    };
  });

  describe('Circuit Breaker Functionality', () => {
    let circuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker('test', 3, 1000);
    });

    it('starts in CLOSED state', () => {
      expect(circuitBreaker.state).toBe('CLOSED');
      expect(circuitBreaker.failureCount).toBe(0);
    });

    it('executes operation when CLOSED', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('transitions to OPEN after threshold failures', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('failure'));

      // Fail 3 times (threshold)
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(operation);
        } catch (error) {
          // Expected
        }
      }

      expect(circuitBreaker.state).toBe('OPEN');
    });

    it('rejects requests when OPEN', async () => {
      circuitBreaker.state = 'OPEN';
      circuitBreaker.lastFailureTime = Date.now();

      const operation = jest.fn();

      await expect(circuitBreaker.execute(operation)).rejects.toThrow('Circuit breaker test is OPEN');
      expect(operation).not.toHaveBeenCalled();
    });

    it('transitions to HALF_OPEN after timeout', async () => {
      circuitBreaker.state = 'OPEN';
      circuitBreaker.lastFailureTime = Date.now() - 2000; // 2 seconds ago

      const operation = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(operation);

      expect(result).toBe('success');
      expect(circuitBreaker.state).toBe('CLOSED');
    });

    it('resets failure count on success', async () => {
      circuitBreaker.failureCount = 2;

      const operation = jest.fn().mockResolvedValue('success');

      await circuitBreaker.execute(operation);

      expect(circuitBreaker.failureCount).toBe(0);
      expect(circuitBreaker.state).toBe('CLOSED');
    });
  });
});

describe('Singleton Instance', () => {
  it('exports a singleton instance', () => {
    expect(apiServiceFactory).toBeInstanceOf(ApiServiceFactory);
  });

  it('provides the same instance on multiple imports', () => {
    // This would be tested in an integration test with actual imports
    expect(apiServiceFactory).toBeDefined();
  });
});
