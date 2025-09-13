/**
 * Grid Health Check System
 * Monitors grid components for potential issues and provides automatic recovery
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

class GridHealthMonitor {
  constructor() {
    this.checks = new Map();
    this.issues = new Map();
    this.autoFixAttempts = new Map();
    this.maxAutoFixAttempts = 3;
    
    console.log('🏥 Grid Health Monitor initialized');
  }

  // Register a grid for health monitoring
  registerGrid(gridName, gridRef, config = {}) {
    if (!gridName || !gridRef) {
      console.warn('GridHealthMonitor: Invalid grid registration');
      return;
    }

    this.checks.set(gridName, {
      ref: gridRef,
      config: {
        checkInterval: 5000, // 5 seconds
        maxErrors: 5,
        autoFix: true,
        ...config
      },
      status: 'healthy',
      lastCheck: Date.now(),
      errorCount: 0,
      performance: {
        renderTime: 0,
        lastRenderTime: Date.now()
      }
    });

    console.log(`✅ Grid '${gridName}' registered for health monitoring`);
    this.startMonitoring(gridName);
  }

  // Start monitoring a specific grid
  startMonitoring(gridName) {
    const gridInfo = this.checks.get(gridName);
    if (!gridInfo) return;

    const interval = setInterval(() => {
      this.performHealthCheck(gridName);
    }, gridInfo.config.checkInterval);

    gridInfo.monitoringInterval = interval;
  }

  // Perform comprehensive health check
  performHealthCheck(gridName) {
    const gridInfo = this.checks.get(gridName);
    if (!gridInfo || !gridInfo.ref.current) return;

    const checks = [
      this.checkDataIntegrity(gridName),
      this.checkColumnsIntegrity(gridName),
      this.checkStateConsistency(gridName),
      this.checkPerformance(gridName),
      this.checkMemoryUsage(gridName)
    ];

    const results = checks.map(check => check());
    const healthyChecks = results.filter(result => result.status === 'healthy').length;
    const totalChecks = results.length;
    
    const healthPercentage = (healthyChecks / totalChecks) * 100;
    
    if (healthPercentage < 80) {
      this.handleUnhealthyGrid(gridName, results);
    } else {
      gridInfo.status = 'healthy';
      gridInfo.errorCount = 0;
    }

    gridInfo.lastCheck = Date.now();
  }

  // Check data integrity
  checkDataIntegrity(gridName) {
    return () => {
      try {
        const gridInfo = this.checks.get(gridName);
        const gridElement = gridInfo.ref.current;
        
        if (!gridElement) {
          return { status: 'error', message: 'Grid element not found' };
        }

        // Check if data prop exists and is valid
        const dataElements = gridElement.querySelectorAll('[role="row"]');
        if (dataElements.length === 0) {
          return { status: 'warning', message: 'No data rows found' };
        }

        return { status: 'healthy', message: 'Data integrity OK' };
      } catch (error) {
        return { status: 'error', message: `Data check failed: ${error.message}` };
      }
    };
  }

  // Check columns integrity
  checkColumnsIntegrity(gridName) {
    return () => {
      try {
        const gridInfo = this.checks.get(gridName);
        const gridElement = gridInfo.ref.current;
        
        if (!gridElement) {
          return { status: 'error', message: 'Grid element not found' };
        }

        // Check for column headers
        const headerElements = gridElement.querySelectorAll('[role="columnheader"]');
        if (headerElements.length === 0) {
          return { status: 'error', message: 'No column headers found' };
        }

        // Check for visible columns
        const visibleColumns = Array.from(headerElements).filter(header => 
          header.style.display !== 'none' && !header.hidden
        );

        if (visibleColumns.length === 0) {
          return { status: 'error', message: 'No visible columns found' };
        }

        return { status: 'healthy', message: 'Columns integrity OK' };
      } catch (error) {
        return { status: 'error', message: `Columns check failed: ${error.message}` };
      }
    };
  }

  // Check state consistency
  checkStateConsistency(gridName) {
    return () => {
      try {
        // Check for common state issues
        const issues = [];
        
        // Check localStorage corruption
        try {
          const stored = localStorage.getItem(`grid_${gridName}_settings`);
          if (stored) {
            JSON.parse(stored); // This will throw if corrupted
          }
        } catch (error) {
          issues.push('LocalStorage corruption detected');
        }

        if (issues.length > 0) {
          return { status: 'warning', message: issues.join(', ') };
        }

        return { status: 'healthy', message: 'State consistency OK' };
      } catch (error) {
        return { status: 'error', message: `State check failed: ${error.message}` };
      }
    };
  }

  // Check performance metrics
  checkPerformance(gridName) {
    return () => {
      try {
        const gridInfo = this.checks.get(gridName);
        const now = Date.now();
        const timeSinceLastRender = now - gridInfo.performance.lastRenderTime;

        // If grid hasn't rendered in a while, it might be frozen
        if (timeSinceLastRender > 30000) { // 30 seconds
          return { status: 'warning', message: 'Grid appears to be frozen' };
        }

        // Check for excessive render time
        if (gridInfo.performance.renderTime > 1000) { // 1 second
          return { status: 'warning', message: 'Slow render performance detected' };
        }

        return { status: 'healthy', message: 'Performance OK' };
      } catch (error) {
        return { status: 'error', message: `Performance check failed: ${error.message}` };
      }
    };
  }

  // Check memory usage
  checkMemoryUsage(gridName) {
    return () => {
      try {
        if (performance.memory) {
          const memUsage = performance.memory;
          const usagePercent = (memUsage.usedJSHeapSize / memUsage.totalJSHeapSize) * 100;
          
          if (usagePercent > 90) {
            return { status: 'error', message: 'High memory usage detected' };
          } else if (usagePercent > 75) {
            return { status: 'warning', message: 'Elevated memory usage' };
          }
        }

        return { status: 'healthy', message: 'Memory usage OK' };
      } catch (error) {
        return { status: 'error', message: `Memory check failed: ${error.message}` };
      }
    };
  }

  // Handle unhealthy grid
  handleUnhealthyGrid(gridName, results) {
    const gridInfo = this.checks.get(gridName);
    gridInfo.errorCount++;
    gridInfo.status = 'unhealthy';

    console.warn(`🚨 Grid '${gridName}' health check failed:`, results);

    // Attempt automatic recovery
    if (gridInfo.config.autoFix && gridInfo.errorCount <= this.maxAutoFixAttempts) {
      this.attemptAutoFix(gridName, results);
    } else {
      // Notify user of persistent issues
      toast.error(`Grid '${gridName}' is experiencing issues. Manual intervention may be required.`);
    }
  }

  // Attempt automatic fixes
  attemptAutoFix(gridName, results) {
    const gridInfo = this.checks.get(gridName);
    const currentAttempts = this.autoFixAttempts.get(gridName) || 0;

    if (currentAttempts >= this.maxAutoFixAttempts) {
      console.warn(`Max auto-fix attempts reached for grid '${gridName}'`);
      return;
    }

    this.autoFixAttempts.set(gridName, currentAttempts + 1);

    console.log(`🔧 Attempting auto-fix for grid '${gridName}' (attempt ${currentAttempts + 1})`);

    // Common auto-fix strategies
    const errorResults = results.filter(r => r.status === 'error');
    
    for (const error of errorResults) {
      if (error.message.includes('LocalStorage corruption')) {
        this.fixLocalStorageCorruption(gridName);
      } else if (error.message.includes('No data rows found')) {
        this.triggerDataRefresh(gridName);
      } else if (error.message.includes('No column headers found')) {
        this.fixColumnHeaders(gridName);
      }
    }

    // Schedule a re-check after auto-fix attempt
    setTimeout(() => {
      this.performHealthCheck(gridName);
    }, 2000);
  }

  // Auto-fix: LocalStorage corruption
  fixLocalStorageCorruption(gridName) {
    try {
      localStorage.removeItem(`grid_${gridName}_settings`);
      localStorage.removeItem(`grid_${gridName}_pagination`);
      localStorage.removeItem(`grid_${gridName}_sort`);
      localStorage.removeItem(`grid_${gridName}_filter`);
      console.log(`🔧 Cleared corrupted localStorage for grid '${gridName}'`);
    } catch (error) {
      console.error('Failed to fix localStorage corruption:', error);
    }
  }

  // Auto-fix: Trigger data refresh
  triggerDataRefresh(gridName) {
    try {
      const gridInfo = this.checks.get(gridName);
      const gridElement = gridInfo.ref.current;
      
      // Try to find and trigger refresh button
      const refreshButton = gridElement.querySelector('[aria-label="Refresh"]');
      if (refreshButton) {
        refreshButton.click();
        console.log(`🔧 Triggered data refresh for grid '${gridName}'`);
      }
    } catch (error) {
      console.error('Failed to trigger data refresh:', error);
    }
  }

  // Auto-fix: Fix column headers
  fixColumnHeaders(gridName) {
    try {
      // This would typically involve re-initializing the grid
      console.log(`🔧 Attempting to fix column headers for grid '${gridName}'`);
      // Implementation would depend on the specific grid library
    } catch (error) {
      console.error('Failed to fix column headers:', error);
    }
  }

  // Get health report for a grid
  getHealthReport(gridName) {
    const gridInfo = this.checks.get(gridName);
    if (!gridInfo) return null;

    return {
      gridName,
      status: gridInfo.status,
      lastCheck: new Date(gridInfo.lastCheck).toISOString(),
      errorCount: gridInfo.errorCount,
      performance: gridInfo.performance,
      issues: this.issues.get(gridName) || []
    };
  }

  // Get health report for all grids
  getAllHealthReports() {
    const reports = {};
    for (const gridName of this.checks.keys()) {
      reports[gridName] = this.getHealthReport(gridName);
    }
    return reports;
  }

  // Unregister a grid from monitoring
  unregisterGrid(gridName) {
    const gridInfo = this.checks.get(gridName);
    if (gridInfo && gridInfo.monitoringInterval) {
      clearInterval(gridInfo.monitoringInterval);
    }
    
    this.checks.delete(gridName);
    this.issues.delete(gridName);
    this.autoFixAttempts.delete(gridName);
    
    console.log(`❌ Grid '${gridName}' unregistered from health monitoring`);
  }

  // Clean up all monitoring
  cleanup() {
    for (const gridName of this.checks.keys()) {
      this.unregisterGrid(gridName);
    }
    console.log('🏥 Grid Health Monitor cleaned up');
  }
}

// Singleton instance
const gridHealthMonitor = new GridHealthMonitor();

// React hook for grid health monitoring
export const useGridHealth = (gridName, gridRef, config = {}) => {
  const [healthStatus, setHealthStatus] = useState('healthy');
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    if (gridName && gridRef) {
      gridHealthMonitor.registerGrid(gridName, gridRef, config);
      
      // Update health status periodically
      const statusInterval = setInterval(() => {
        const report = gridHealthMonitor.getHealthReport(gridName);
        if (report) {
          setHealthStatus(report.status);
          setLastCheck(report.lastCheck);
        }
      }, 1000);

      return () => {
        clearInterval(statusInterval);
        gridHealthMonitor.unregisterGrid(gridName);
      };
    }
  }, [gridName, gridRef, config]);

  const triggerHealthCheck = useCallback(() => {
    if (gridName) {
      gridHealthMonitor.performHealthCheck(gridName);
    }
  }, [gridName]);

  const getDetailedReport = useCallback(() => {
    return gridHealthMonitor.getHealthReport(gridName);
  }, [gridName]);

  return {
    healthStatus,
    lastCheck,
    triggerHealthCheck,
    getDetailedReport
  };
};

export default gridHealthMonitor;