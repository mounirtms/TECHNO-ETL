/**
 * Grid Testing Utility
 * Tests grid functionality, layout, and pagination
 */

/**
 * Test grid pagination functionality
 * @param {Object} gridRef - Reference to the grid component
 * @param {Object} testConfig - Test configuration
 * @returns {Object} Test results
 */
export const testGridPagination = (gridRef, testConfig = {}) => {
  const results = {
    paginationMode: null,
    rowCount: null,
    currentPage: null,
    pageSize: null,
    totalPages: null,
    errors: [],
    warnings: []
  };

  try {
    if (!gridRef.current) {
      results.errors.push('Grid reference is null');
      return results;
    }

    const gridApi = gridRef.current;
    
    // Test pagination mode
    const paginationModel = gridApi.state?.pagination?.paginationModel;
    if (paginationModel) {
      results.currentPage = paginationModel.page;
      results.pageSize = paginationModel.pageSize;
    }

    // Check for server-side pagination requirements
    const paginationMode = gridApi.props?.paginationMode;
    results.paginationMode = paginationMode;

    if (paginationMode === 'server') {
      const rowCount = gridApi.props?.rowCount;
      results.rowCount = rowCount;
      
      if (rowCount === undefined || rowCount === null) {
        results.errors.push('Server pagination requires rowCount prop');
      }
      
      if (typeof rowCount !== 'number') {
        results.errors.push(`rowCount must be a number, got ${typeof rowCount}`);
      }
      
      results.totalPages = Math.ceil(rowCount / results.pageSize);
    }

    // Test pagination controls
    const paginationElement = document.querySelector('.MuiTablePagination-root');
    if (!paginationElement) {
      results.warnings.push('Pagination controls not found in DOM');
    }

  } catch (error) {
    results.errors.push(`Pagination test error: ${error.message}`);
  }

  return results;
};

/**
 * Test grid layout and scrolling
 * @param {Object} gridRef - Reference to the grid component
 * @returns {Object} Layout test results
 */
export const testGridLayout = (gridRef) => {
  const results = {
    containerHeight: null,
    gridHeight: null,
    hasVerticalScroll: false,
    hasHorizontalScroll: false,
    statsCardsVisible: false,
    toolbarVisible: false,
    errors: [],
    warnings: []
  };

  try {
    if (!gridRef.current) {
      results.errors.push('Grid reference is null');
      return results;
    }

    // Test container dimensions
    const container = gridRef.current.closest('.MuiPaper-root');
    if (container) {
      results.containerHeight = container.offsetHeight;
    }

    // Test grid dimensions
    const gridElement = document.querySelector('.MuiDataGrid-root');
    if (gridElement) {
      results.gridHeight = gridElement.offsetHeight;
      
      // Check for scrollbars
      const virtualScroller = gridElement.querySelector('.MuiDataGrid-virtualScroller');
      if (virtualScroller) {
        results.hasVerticalScroll = virtualScroller.scrollHeight > virtualScroller.clientHeight;
        results.hasHorizontalScroll = virtualScroller.scrollWidth > virtualScroller.clientWidth;
      }
    }

    // Test stats cards visibility
    const statsCards = document.querySelector('[data-testid="stats-cards"]');
    results.statsCardsVisible = !!statsCards;

    // Test toolbar visibility
    const toolbar = document.querySelector('.MuiDataGrid-toolbarContainer');
    results.toolbarVisible = !!toolbar;

    // Validate layout structure
    if (results.containerHeight && results.gridHeight) {
      if (results.gridHeight > results.containerHeight) {
        results.warnings.push('Grid height exceeds container height');
      }
    }

  } catch (error) {
    results.errors.push(`Layout test error: ${error.message}`);
  }

  return results;
};

/**
 * Test grid data and rendering
 * @param {Object} gridRef - Reference to the grid component
 * @param {Array} expectedData - Expected data array
 * @returns {Object} Data test results
 */
export const testGridData = (gridRef, expectedData = []) => {
  const results = {
    rowCount: 0,
    columnCount: 0,
    dataMatches: false,
    renderingComplete: false,
    errors: [],
    warnings: []
  };

  try {
    if (!gridRef.current) {
      results.errors.push('Grid reference is null');
      return results;
    }

    const gridApi = gridRef.current;
    
    // Test row count
    const rows = gridApi.props?.rows || [];
    results.rowCount = rows.length;
    
    // Test column count
    const columns = gridApi.props?.columns || [];
    results.columnCount = columns.length;

    // Test data matching
    if (expectedData.length > 0) {
      results.dataMatches = rows.length === expectedData.length;
      if (!results.dataMatches) {
        results.warnings.push(`Data mismatch: expected ${expectedData.length}, got ${rows.length}`);
      }
    }

    // Test rendering completion
    const renderedRows = document.querySelectorAll('.MuiDataGrid-row');
    results.renderingComplete = renderedRows.length > 0;

    if (!results.renderingComplete) {
      results.warnings.push('No rows rendered in DOM');
    }

  } catch (error) {
    results.errors.push(`Data test error: ${error.message}`);
  }

  return results;
};

/**
 * Comprehensive grid test suite
 * @param {Object} gridRef - Reference to the grid component
 * @param {Object} testConfig - Test configuration
 * @returns {Object} Complete test results
 */
export const runGridTestSuite = (gridRef, testConfig = {}) => {
  const results = {
    timestamp: new Date().toISOString(),
    gridName: testConfig.gridName || 'Unknown',
    tests: {
      pagination: null,
      layout: null,
      data: null
    },
    summary: {
      totalTests: 3,
      passedTests: 0,
      failedTests: 0,
      warnings: 0
    }
  };

  // Run pagination tests
  results.tests.pagination = testGridPagination(gridRef, testConfig);
  
  // Run layout tests
  results.tests.layout = testGridLayout(gridRef);
  
  // Run data tests
  results.tests.data = testGridData(gridRef, testConfig.expectedData);

  // Calculate summary
  Object.values(results.tests).forEach(test => {
    if (test.errors.length === 0) {
      results.summary.passedTests++;
    } else {
      results.summary.failedTests++;
    }
    results.summary.warnings += test.warnings.length;
  });

  return results;
};

/**
 * Log grid test results to console
 * @param {Object} testResults - Results from runGridTestSuite
 */
export const logGridTestResults = (testResults) => {
  console.log('\n🧪 GRID TEST RESULTS');
  console.log('===================');
  console.log(`Grid: ${testResults.gridName}`);
  console.log(`Timestamp: ${testResults.timestamp}`);
  console.log(`✅ Passed: ${testResults.summary.passedTests}/${testResults.summary.totalTests}`);
  console.log(`❌ Failed: ${testResults.summary.failedTests}/${testResults.summary.totalTests}`);
  console.log(`⚠️ Warnings: ${testResults.summary.warnings}`);

  // Log detailed results
  Object.entries(testResults.tests).forEach(([testName, results]) => {
    console.log(`\n📊 ${testName.toUpperCase()} TEST:`);
    
    if (results.errors.length > 0) {
      console.log('❌ Errors:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (results.warnings.length > 0) {
      console.log('⚠️ Warnings:');
      results.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (results.errors.length === 0) {
      console.log('✅ Test passed');
    }
  });
};

/**
 * Monitor grid performance
 * @param {Object} gridRef - Reference to the grid component
 * @returns {Object} Performance metrics
 */
export const monitorGridPerformance = (gridRef) => {
  const metrics = {
    renderTime: null,
    scrollPerformance: null,
    memoryUsage: null,
    errors: []
  };

  try {
    // Measure render time
    const startTime = performance.now();
    
    // Force a re-render
    if (gridRef.current) {
      gridRef.current.forceUpdate?.();
    }
    
    requestAnimationFrame(() => {
      metrics.renderTime = performance.now() - startTime;
    });

    // Monitor memory usage if available
    if (performance.memory) {
      metrics.memoryUsage = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }

  } catch (error) {
    metrics.errors.push(`Performance monitoring error: ${error.message}`);
  }

  return metrics;
};

export default {
  testGridPagination,
  testGridLayout,
  testGridData,
  runGridTestSuite,
  logGridTestResults,
  monitorGridPerformance
};
