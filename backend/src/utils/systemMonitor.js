/**
 * TECHNO-ETL System Monitor
 * Real-time performance and health monitoring
 */

import os from 'os';
import { performance } from 'perf_hooks';

class SystemMonitor {
    constructor() {
        this.startTime = Date.now();
        this.metrics = {
            requests: 0,
            errors: 0,
            memoryPeak: 0,
            cpuUsage: []
        };
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        // Memory monitoring
        setInterval(() => {
            const memUsage = process.memoryUsage();
            const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
            
            if (heapUsedMB > this.metrics.memoryPeak) {
                this.metrics.memoryPeak = heapUsedMB;
            }
            
            if (heapUsedMB > 85) {
                this.triggerMemoryCleanup();
            }
        }, 30000); // Every 30 seconds
        
        // CPU monitoring
        setInterval(() => {
            const cpuUsage = os.loadavg()[0];
            this.metrics.cpuUsage.push({
                timestamp: Date.now(),
                usage: cpuUsage
            });
            
            // Keep only last 20 readings
            if (this.metrics.cpuUsage.length > 20) {
                this.metrics.cpuUsage.shift();
            }
        }, 10000); // Every 10 seconds
    }
    
    triggerMemoryCleanup() {
        if (global.gc) {
            console.log('🧹 Triggering garbage collection - High memory usage detected');
            global.gc();
        }
    }
    
    getSystemStats() {
        const uptime = Date.now() - this.startTime;
        const memUsage = process.memoryUsage();
        
        return {
            uptime: Math.floor(uptime / 1000),
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024),
                total: Math.round(memUsage.heapTotal / 1024 / 1024),
                peak: this.metrics.memoryPeak
            },
            cpu: {
                current: os.loadavg()[0],
                average: this.metrics.cpuUsage.length > 0 
                    ? this.metrics.cpuUsage.reduce((sum, item) => sum + item.usage, 0) / this.metrics.cpuUsage.length 
                    : 0
            },
            requests: this.metrics.requests,
            errors: this.metrics.errors,
            errorRate: this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests) * 100 : 0
        };
    }
    
    incrementRequests() {
        this.metrics.requests++;
    }
    
    incrementErrors() {
        this.metrics.errors++;
    }
}

export default new SystemMonitor();
