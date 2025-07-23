/**
 * Worker Process and Background Task Logging Service
 * Comprehensive logging for background jobs, ETL processes, and scheduled tasks
 */

import productionLogger from './productionLogger.js';
import { Worker } from 'jest-worker';

// Job status types
export const JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETRYING: 'retrying'
};

// Job types
export const JOB_TYPES = {
  ETL_SYNC: 'etl_sync',
  DATA_MIGRATION: 'data_migration',
  REPORT_GENERATION: 'report_generation',
  CACHE_REFRESH: 'cache_refresh',
  CLEANUP: 'cleanup',
  BACKUP: 'backup',
  HEALTH_CHECK: 'health_check',
  NOTIFICATION: 'notification'
};

class WorkerLogger {
  constructor() {
    this.activeJobs = new Map();
    this.jobHistory = [];
    this.workerPools = new Map();
    this.scheduledTasks = new Map();
    this.etlProcesses = new Map();
    
    this.metrics = {
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      averageExecutionTime: 0,
      workerPoolUtilization: {},
      queueMetrics: {
        pending: 0,
        running: 0,
        completed: 0,
        failed: 0
      }
    };

    this.startMetricsCollection();
  }

  // Log job start
  logJobStart(jobId, jobType, jobData = {}, workerId = null) {
    const startTime = new Date();
    const jobInfo = {
      jobId,
      jobType,
      status: JOB_STATUS.RUNNING,
      startTime,
      workerId,
      data: this.sanitizeJobData(jobData),
      attempts: 1,
      logs: []
    };

    this.activeJobs.set(jobId, jobInfo);
    this.metrics.totalJobs++;
    this.metrics.queueMetrics.running++;

    productionLogger.info('Background job started', {
      category: 'worker_job',
      action: 'job_start',
      ...jobInfo,
      timestamp: startTime.toISOString()
    });

    return jobInfo;
  }

  // Log job progress
  logJobProgress(jobId, progress, message = '', metadata = {}) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      productionLogger.warn('Attempted to log progress for unknown job', { jobId });
      return;
    }

    const progressInfo = {
      progress: Math.min(100, Math.max(0, progress)), // Ensure 0-100 range
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    job.logs.push({
      type: 'progress',
      ...progressInfo
    });

    productionLogger.info('Job progress update', {
      category: 'worker_job',
      action: 'job_progress',
      jobId,
      jobType: job.jobType,
      ...progressInfo
    });
  }

  // Log job completion
  logJobComplete(jobId, result = {}, metadata = {}) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      productionLogger.warn('Attempted to complete unknown job', { jobId });
      return;
    }

    const endTime = new Date();
    const executionTime = endTime.getTime() - job.startTime.getTime();

    job.status = JOB_STATUS.COMPLETED;
    job.endTime = endTime;
    job.executionTime = executionTime;
    job.result = result;

    // Update metrics
    this.metrics.completedJobs++;
    this.metrics.queueMetrics.running--;
    this.metrics.queueMetrics.completed++;
    this.updateAverageExecutionTime(executionTime);

    // Move to history
    this.jobHistory.push({ ...job });
    this.activeJobs.delete(jobId);

    // Keep only last 1000 jobs in history
    if (this.jobHistory.length > 1000) {
      this.jobHistory.shift();
    }

    productionLogger.info('Background job completed', {
      category: 'worker_job',
      action: 'job_complete',
      jobId,
      jobType: job.jobType,
      executionTime,
      result: this.sanitizeJobData(result),
      timestamp: endTime.toISOString(),
      ...metadata
    });

    return job;
  }

  // Log job failure
  logJobFailure(jobId, error, metadata = {}) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      productionLogger.warn('Attempted to fail unknown job', { jobId });
      return;
    }

    const endTime = new Date();
    const executionTime = endTime.getTime() - job.startTime.getTime();

    job.status = JOB_STATUS.FAILED;
    job.endTime = endTime;
    job.executionTime = executionTime;
    job.error = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    };

    // Update metrics
    this.metrics.failedJobs++;
    this.metrics.queueMetrics.running--;
    this.metrics.queueMetrics.failed++;

    // Move to history
    this.jobHistory.push({ ...job });
    this.activeJobs.delete(jobId);

    productionLogger.error('Background job failed', {
      category: 'worker_job',
      action: 'job_failed',
      jobId,
      jobType: job.jobType,
      executionTime,
      error: job.error,
      timestamp: endTime.toISOString(),
      ...metadata
    });

    return job;
  }

  // Log job retry
  logJobRetry(jobId, attempt, reason = '', metadata = {}) {
    const job = this.activeJobs.get(jobId);
    if (!job) {
      productionLogger.warn('Attempted to retry unknown job', { jobId });
      return;
    }

    job.status = JOB_STATUS.RETRYING;
    job.attempts = attempt;
    job.logs.push({
      type: 'retry',
      attempt,
      reason,
      timestamp: new Date().toISOString()
    });

    productionLogger.warn('Background job retry', {
      category: 'worker_job',
      action: 'job_retry',
      jobId,
      jobType: job.jobType,
      attempt,
      reason,
      timestamp: new Date().toISOString(),
      ...metadata
    });
  }

  // Log worker pool metrics
  logWorkerPoolMetrics(poolName, metrics) {
    const poolMetrics = {
      poolName,
      activeWorkers: metrics.activeWorkers || 0,
      idleWorkers: metrics.idleWorkers || 0,
      totalWorkers: metrics.totalWorkers || 0,
      queueSize: metrics.queueSize || 0,
      utilization: metrics.activeWorkers / metrics.totalWorkers * 100,
      timestamp: new Date().toISOString()
    };

    this.workerPools.set(poolName, poolMetrics);
    this.metrics.workerPoolUtilization[poolName] = poolMetrics.utilization;

    productionLogger.logPerformance('worker_pool_metrics', poolMetrics);
  }

  // Log scheduled task execution
  logScheduledTask(taskName, schedule, execution = {}) {
    const taskInfo = {
      taskName,
      schedule,
      lastExecution: execution.timestamp || new Date().toISOString(),
      status: execution.status || 'completed',
      duration: execution.duration || 0,
      result: execution.result || null,
      error: execution.error || null
    };

    this.scheduledTasks.set(taskName, taskInfo);

    productionLogger.info('Scheduled task executed', {
      category: 'scheduled_task',
      ...taskInfo
    });
  }

  // Log ETL process
  logETLProcess(processId, processType, phase, data = {}) {
    const timestamp = new Date().toISOString();
    
    if (!this.etlProcesses.has(processId)) {
      this.etlProcesses.set(processId, {
        processId,
        processType,
        startTime: timestamp,
        phases: [],
        status: 'running'
      });
    }

    const process = this.etlProcesses.get(processId);
    process.phases.push({
      phase,
      timestamp,
      data: this.sanitizeJobData(data)
    });

    productionLogger.info('ETL process phase', {
      category: 'etl_process',
      processId,
      processType,
      phase,
      timestamp,
      ...data
    });
  }

  // Complete ETL process
  completeETLProcess(processId, result = {}) {
    const process = this.etlProcesses.get(processId);
    if (process) {
      process.status = 'completed';
      process.endTime = new Date().toISOString();
      process.result = result;

      productionLogger.info('ETL process completed', {
        category: 'etl_process',
        action: 'process_complete',
        ...process
      });
    }
  }

  // Fail ETL process
  failETLProcess(processId, error) {
    const process = this.etlProcesses.get(processId);
    if (process) {
      process.status = 'failed';
      process.endTime = new Date().toISOString();
      process.error = {
        message: error.message,
        stack: error.stack
      };

      productionLogger.error('ETL process failed', {
        category: 'etl_process',
        action: 'process_failed',
        ...process
      });
    }
  }

  // Sanitize job data to remove sensitive information
  sanitizeJobData(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential'];

    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeJobData(sanitized[key]);
      }
    }

    return sanitized;
  }

  // Update average execution time
  updateAverageExecutionTime(executionTime) {
    const totalTime = this.metrics.averageExecutionTime * (this.metrics.completedJobs - 1) + executionTime;
    this.metrics.averageExecutionTime = totalTime / this.metrics.completedJobs;
  }

  // Start metrics collection
  startMetricsCollection() {
    setInterval(() => {
      this.collectMetrics();
    }, 60000); // Every minute
  }

  // Collect and log metrics
  collectMetrics() {
    const metrics = {
      activeJobs: this.activeJobs.size,
      totalJobs: this.metrics.totalJobs,
      completedJobs: this.metrics.completedJobs,
      failedJobs: this.metrics.failedJobs,
      successRate: this.metrics.totalJobs > 0 ? (this.metrics.completedJobs / this.metrics.totalJobs) * 100 : 0,
      averageExecutionTime: this.metrics.averageExecutionTime,
      queueMetrics: this.metrics.queueMetrics,
      workerPoolUtilization: this.metrics.workerPoolUtilization,
      scheduledTasks: this.scheduledTasks.size,
      etlProcesses: this.etlProcesses.size,
      timestamp: new Date().toISOString()
    };

    productionLogger.logPerformance('worker_metrics', metrics);
  }

  // Get current metrics
  getMetrics() {
    return {
      activeJobs: Array.from(this.activeJobs.values()),
      jobHistory: this.jobHistory.slice(-100), // Last 100 jobs
      workerPools: Array.from(this.workerPools.values()),
      scheduledTasks: Array.from(this.scheduledTasks.values()),
      etlProcesses: Array.from(this.etlProcesses.values()),
      metrics: this.metrics
    };
  }

  // Get job status
  getJobStatus(jobId) {
    return this.activeJobs.get(jobId) || 
           this.jobHistory.find(job => job.jobId === jobId) || 
           null;
  }
}

// Create singleton instance
const workerLogger = new WorkerLogger();

export default workerLogger;
export { WorkerLogger };
