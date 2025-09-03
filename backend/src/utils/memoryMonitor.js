import { logger } from './logger.js';

class MemoryMonitor {
  constructor(config) {
    this.warningThreshold = config.memoryWarningThreshold || 0.8;
    this.checkInterval = 30000; // Check every 30 seconds
    this.isMonitoring = false;
    this.lastWarningTime = 0;
    this.warningCooldown = 300000; // 5 minutes between warnings
  }

  start() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.intervalId = setInterval(() => this.checkMemory(), this.checkInterval);
    logger.info('[MemoryMonitor] Started monitoring memory usage');
  }

  stop() {
    if (!this.isMonitoring) return;

    clearInterval(this.intervalId);
    this.isMonitoring = false;
    logger.info('[MemoryMonitor] Stopped memory monitoring');
  }

  checkMemory() {
    const { heapUsed, heapTotal } = process.memoryUsage();
    const usage = heapUsed / heapTotal;

    // Track memory stats
    logger.info('[MemoryMonitor] Memory usage tracked', {
      cpu: {
        user: process.cpuUsage().user,
        system: process.cpuUsage().system,
        loadAverage: process.cpuUsage().loadavg || [0, 0, 0],
        timestamp: new Date().toISOString(),
      },
      memory: {
        process: process.memoryUsage(),
        system: {
          total: process.memoryUsage().heapTotal,
          free: process.memoryUsage().heapTotal - process.memoryUsage().heapUsed,
          used: process.memoryUsage().heapUsed,
          usagePercent: usage * 100,
        },
        timestamp: new Date().toISOString(),
      },
      network: {
        interfaces: process._getActiveRequests()?.length || 0,
        timestamp: new Date().toISOString(),
      },
    });

    // Check for high memory usage
    if (usage > this.warningThreshold) {
      const now = Date.now();

      if (now - this.lastWarningTime > this.warningCooldown) {
        this.lastWarningTime = now;
        
        logger.warn('[MemoryMonitor] System warning collected', {
          category: 'system_warning',
          warningType: 'high_memory_usage',
          type: 'high_memory_usage',
          message: `Memory usage at ${(usage * 100).toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          memoryUsage: process.memoryUsage(),
          threshold: this.warningThreshold,
        });
        
        // Trigger garbage collection if available
        if (global.gc) {
          logger.info('[MemoryMonitor] Triggering garbage collection');
          global.gc();
        }
      }
    }
  }

  static getInstance(config) {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor(config);
    }

    return MemoryMonitor.instance;
  }
}

export default MemoryMonitor;