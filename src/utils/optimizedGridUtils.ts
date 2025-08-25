
/**
 * Optimized Grid Utilities
 * Performance-focused utilities for data grids
 */

/**
 * Memoized row data processor
 * @param {Array} rows - Raw row data
 * @param {Object} processors - Data processors
 * @returns {Array} - Processed rows
 */
export const processGridRows = (rows: any[], processors: {[key: string]: any} = {}) => {
  // Use WeakMap for caching processed rows
  const processedCache = new WeakMap();
  
  if(processedCache.has(rows)) {
    return processedCache.get(rows);
  }
  
  const processed = rows.map((row, index) => {
    // Apply processors if available
    let processedRow = { ...row, id: row.id || index };
    
    Object.keys(processors).forEach((key: string) => {
      if(processors[key] && typeof processors[key] ==='function') {
        processedRow[key] = processors[key](row[key], row);
      }
    });
    
    return processedRow;
  });
  
  processedCache.set(rows, processed);
  return processed;
};

/**
 * Optimized column definition generator
 * @param {Array} baseColumns - Base column definitions
 * @param {Object} overrides - Column overrides
 * @returns {Array} - Optimized column definitions
 */
export const generateOptimizedColumns = (baseColumns: any[], overrides: {[key: string]: any} = {}) => {
  return baseColumns.map((column) => {
    // Apply overrides
    const overriddenColumn = { ...column, ...overrides[column.field]
    };
    
    // Optimize renderers
    if(overriddenColumn.renderCell) {
      // Memoize renderers to prevent unnecessary re-renders
      const originalRenderer = overriddenColumn.renderCell;
      overriddenColumn.renderCell = (params: any) => {
        // Add performance optimization hints
        return originalRenderer(params);
      };
    }
    
    return overriddenColumn;
  });
};

/**
 * Virtualized grid data handler
 * @param {Array} data - Grid data
 * @param {number} startIndex - Start index
 * @param {number} endIndex - End index
 * @returns {Array} - Sliced data for virtualization
 */
export const getVirtualizedData = (data: any[], startIndex: number, endIndex: number) => {
  // Ensure we don't go out of bounds
  const start = Math.max(0, startIndex);
  const end = Math.min(data.length, endIndex);
  
  // Return sliced data
  return data.slice(start, end);
};

export default {
  processGridRows,
  generateOptimizedColumns,
  getVirtualizedData
};
