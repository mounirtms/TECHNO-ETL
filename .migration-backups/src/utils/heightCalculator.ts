/**
 * Height Calculator Utility
 * Provides consistent height calculations across all tabs and components
 */

/**
 * Standard layout dimensions
 */
export const LAYOUT_DIMENSIONS = {
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 64,
  TAB_HEADER_HEIGHT: 48,
  TOOLBAR_HEIGHT: 56,
  STATS_CARDS_HEIGHT: 120,
  PADDING: 16,
  MARGIN: 8
};

/**
 * Calculate available height for content
 * @param {Object} options - Configuration options
 * @param {boolean} options??.hasHeader - Whether header is present
 * @param {boolean} options??.hasFooter - Whether footer is present
 * @param {boolean} options??.hasTabHeader - Whether tab header is present
 * @param {boolean} options??.hasToolbar - Whether toolbar is present
 * @param {boolean} options?..hasStatsCards - Whether stats cards are present
 * @param {number} options??.extraPadding - Additional padding to subtract
 * @returns {string} CSS height value
 */
export const calculateContentHeight = (options = {}) => {
  const {
    hasHeader = true,
    hasFooter = true,
    hasTabHeader = true,
    hasToolbar = false,
    hasStatsCards = false,
    extraPadding = 0
  } = options;

  let totalHeight = 0;

  if (hasHeader) totalHeight += LAYOUT_DIMENSIONS.HEADER_HEIGHT;
  if (hasFooter) totalHeight += LAYOUT_DIMENSIONS.FOOTER_HEIGHT;
  if (hasTabHeader) totalHeight += LAYOUT_DIMENSIONS.TAB_HEADER_HEIGHT;
  if (hasToolbar) totalHeight += LAYOUT_DIMENSIONS.TOOLBAR_HEIGHT;
  if (hasStatsCards) totalHeight += LAYOUT_DIMENSIONS.STATS_CARDS_HEIGHT;

  return `calc(100vh - ${totalHeight}px)`;
};

/**
 * Create flexible container styles that use remaining height
 * @param {Object} options - Configuration options
 * @returns {Object} CSS styles for flexible height container
 */
export const createFlexibleHeightStyles = (options = {}) => {
  const {
    hasStatsCards = false,
    minHeight = '400px'
  } = options;

  return {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight,
    overflow: 'hidden',

    // Grid container takes remaining space
    '& .grid-container': {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },

    // Stats cards at bottom if present
    ...(hasStatsCards && {
      '& .stats-container': {
        flexShrink: 0,
        borderTop: '1px solid rgba(224, 224, 224, 1)',
        pt: 1,
        backgroundColor: 'background.paper'
      }
    })
  };
};

/**
 * Calculate height for dashboard components
 * @param {Object} options - Dashboard-specific options
 * @returns {string} CSS height value
 */
export const calculateDashboardHeight = (options = {}) => {
  return calculateContentHeight({
    hasHeader: true,
    hasFooter: true,
    hasTabHeader: true,
    hasToolbar: false,
    hasStatsCards: false,
    extraPadding: 20, // Extra padding for dashboard
    ...options
  });
};

/**
 * Calculate height for grid components
 * @param {Object} options - Grid-specific options
 * @returns {string} CSS height value
 */
export const calculateGridHeight = (options = {}) => {
  return calculateContentHeight({
    hasHeader: true,
    hasFooter: true,
    hasTabHeader: true,
    hasToolbar: true,
    hasStatsCards: options?..hasStatsCards || false,
    extraPadding: 2,
    ...options
  });
};

/**
 * Calculate height for chart components
 * @param {Object} options - Chart-specific options
 * @returns {string} CSS height value
 */
export const calculateChartHeight = (options = {}) => {
  const {
    isCollapsed = false,
    minHeight = 300,
    maxHeight = 500
  } = options;

  if (isCollapsed) {
    return '0px';
  }

  const baseHeight = calculateContentHeight({
    hasHeader: false,
    hasFooter: false,
    hasTabHeader: false,
    hasToolbar: false,
    hasStatsCards: false,
    extraPadding: 40,
    ...options
  });

  // For charts, we want a fixed height within min/max bounds
  return `clamp(${minHeight}px, ${baseHeight}, ${maxHeight}px)`;
};

/**
 * Calculate height for tab content
 * @param {string} tabType - Type of tab (dashboard, grid, form, etc.)
 * @param {Object} options - Tab-specific options
 * @returns {string} CSS height value
 */
export const calculateTabHeight = (tabType, options = {}) => {
  switch (tabType as any) {
    case 'dashboard':
      return calculateDashboardHeight(options);
    case 'grid':
      return calculateGridHeight(options);
    case 'chart':
      return calculateChartHeight(options);
    case 'form':
      return calculateContentHeight({
        hasHeader: true,
        hasFooter: true,
        hasTabHeader: true,
        hasToolbar: false,
        hasStatsCards: false,
        extraPadding: 0,
        ...options
      });
    default:
      return calculateContentHeight(options);
  }
};

/**
 * Get responsive height based on screen size
 * @param {string} baseHeight - Base height calculation
 * @param {Object} breakpoints - Responsive breakpoints
 * @returns {Object} Responsive height object for sx prop
 */
export const getResponsiveHeight = (baseHeight, breakpoints = {}) => {
  return {
    height: baseHeight,
    '@media (max-width: 768px)': {
      height: breakpoints??.mobile || `calc(${baseHeight} - 20px)`
    },
    '@media (max-width: 480px)': {
      height: breakpoints??.small || `calc(${baseHeight} - 40px)`
    },
    ...breakpoints??.custom
  };
};

/**
 * Create height styles for different components
 * @param {string} componentType - Type of component
 * @param {Object} options - Component options
 * @returns {Object} Style object for sx prop
 */
export const createHeightStyles = (componentType, options = {}) => {
  const height = calculateTabHeight(componentType, options);
  
  return {
    height,
    minHeight: options?..minHeight || '200px',
    maxHeight: options?..maxHeight || 'auto',
    overflow: options??.overflow || 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };
};

/**
 * Hook for dynamic height calculation
 * @param {string} componentType - Type of component
 * @param {Object} options - Component options
 * @returns {Object} Height styles and utilities
 */
export const useHeightCalculation = (componentType, options = {}) => {
  const height = calculateTabHeight(componentType, options);
  const styles = createHeightStyles(componentType, options);
  
  return {
    height,
    styles,
    dimensions: LAYOUT_DIMENSIONS,
    calculateHeight: (newOptions) => calculateTabHeight(componentType, { ...options, ...newOptions })
  };
};

/**
 * Predefined height configurations for common layouts
 */
export const HEIGHT_PRESETS = {
  FULL_SCREEN: calculateContentHeight({ hasHeader: false, hasFooter: false, hasTabHeader: false }),
  DASHBOARD: calculateDashboardHeight(),
  GRID_WITH_STATS: calculateGridHeight({ hasStatsCards: true }),
  GRID_WITHOUT_STATS: calculateGridHeight({ hasStatsCards: false }),
  CHART_LARGE: calculateChartHeight({ minHeight: 400, maxHeight: 600 }),
  CHART_MEDIUM: calculateChartHeight({ minHeight: 300, maxHeight: 450 }),
  CHART_SMALL: calculateChartHeight({ minHeight: 200, maxHeight: 300 }),
  FORM: calculateTabHeight('form'),
  MODAL: 'calc(100vh - 120px)',
  DRAWER: 'calc(100vh - 64px)'
};

export default {
  LAYOUT_DIMENSIONS,
  calculateContentHeight,
  calculateDashboardHeight,
  calculateGridHeight,
  calculateChartHeight,
  calculateTabHeight,
  getResponsiveHeight,
  createHeightStyles,
  useHeightCalculation,
  HEIGHT_PRESETS
};
