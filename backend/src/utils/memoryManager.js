
/**
 * Memory Management Utilities
 * Optimized for ETL operations
 */

export class MemoryManager {
    constructor(options = {}) {
        this.threshold = options.threshold || 100; // MB
        this.gcInterval = options.gcInterval || 5 * 60 * 1000; // 5 minutes
        this.lastGC = Date.now();
        
        // Start monitoring
        this.startMonitoring();
    }
    
    startMonitoring() {
        setInterval(() => {
            this.checkMemoryUsage();
        }, 30000); // Check every 30 seconds
    }
    
    checkMemoryUsage() {
        const usage = process.memoryUsage();
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
        
        if (heapUsedMB > this.threshold) {
            console.log(`⚠️ High memory usage detected: ${heapUsedMB}MB`);
            this.forceGarbageCollection();
        }
    }
    
    forceGarbageCollection() {
        const now = Date.now();
        if (now - this.lastGC > this.gcInterval && global.gc) {
            try {
                global.gc();
                this.lastGC = now;
                const newUsage = process.memoryUsage();
                const newHeapMB = Math.round(newUsage.heapUsed / 1024 / 1024);
                console.log(`🧹 Garbage collection completed. New heap: ${newHeapMB}MB`);
            } catch (error) {
                console.error('Failed to run garbage collection:', error.message);
            }
        }
    }
    
    getMemoryStats() {
        const usage = process.memoryUsage();
        return {
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
            external: Math.round(usage.external / 1024 / 1024),
            rss: Math.round(usage.rss / 1024 / 1024)
        };
    }
    
    logMemoryStats() {
        const stats = this.getMemoryStats();
        console.log('💾 Memory Stats:', stats);
    }
}

// Global memory manager instance
export const memoryManager = new MemoryManager({
    threshold: 100,
    gcInterval: 300000
});

export default memoryManager;
