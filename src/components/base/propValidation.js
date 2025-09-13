/**
 * Prop Validation and Default Values for Base Components
 * Provides comprehensive prop validation and default value handling
 */

import PropTypes from 'prop-types';

// ===== COMMON PROP TYPES =====

export const CommonPropTypes = {
  sx: PropTypes.object,
  className: PropTypes.string,
  'data-testid': PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.instanceOf(Error)
  ])
};

export const ActionHandlerPropType = PropTypes.func;

// ===== GRID PROP TYPES =====

export const GridColumnPropType = PropTypes.shape({
  field: PropTypes.string.isRequired,
  headerName: PropTypes.string,
  width: PropTypes.number,
  minWidth: PropTypes.number,
  maxWidth: PropTypes.number,
  flex: PropTypes.number,
  sortable: PropTypes.bool,
  filterable: PropTypes.bool,
  hideable: PropTypes.bool,
  resizable: PropTypes.bool,
  type: PropTypes.oneOf(['string', 'number', 'date', 'dateTime', 'boolean', 'singleSelect']),
  valueOptions: PropTypes.array,
  renderCell: PropTypes.func,
  renderHeader: PropTypes.func,
  priority: PropTypes.number,
  responsive: PropTypes.bool,
  exportable: PropTypes.bool,
  searchable: PropTypes.bool
});

export const ToolbarConfigPropType = PropTypes.shape({
  showRefresh: PropTypes.bool,
  showAdd: PropTypes.bool,
  showEdit: PropTypes.bool,
  showDelete: PropTypes.bool,
  showSync: PropTypes.bool,
  showExport: PropTypes.bool,
  showImport: PropTypes.bool,
  showSearch: PropTypes.bool,
  showFilters: PropTypes.bool,
  showSettings: PropTypes.bool,
  showSelection: PropTypes.bool,
  showViewToggle: PropTypes.bool,
  showCustomFilters: PropTypes.bool,
  showRowNumbers: PropTypes.bool,
  compact: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  collapseOnMobile: PropTypes.bool,
  priorityActions: PropTypes.arrayOf(PropTypes.string),
  exportOptions: PropTypes.shape({
    formats: PropTypes.arrayOf(PropTypes.oneOf(['csv', 'excel', 'pdf'])),
    filename: PropTypes.string,
    includeHeaders: PropTypes.bool
  }),
  mdmStocks: PropTypes.bool
});

export const BaseGridPropTypes = {
  ...CommonPropTypes,
  
  // Core props
  gridName: PropTypes.string,
  columns: PropTypes.arrayOf(GridColumnPropType),
  data: PropTypes.array,
  getRowId: PropTypes.func,
  density: PropTypes.oneOf(['compact', 'standard', 'comfortable']),

  // Feature toggles
  enableCache: PropTypes.bool,
  enableI18n: PropTypes.bool,
  enableRTL: PropTypes.bool,
  enableSelection: PropTypes.bool,
  enableSorting: PropTypes.bool,
  enableFiltering: PropTypes.bool,
  enableColumnReordering: PropTypes.bool,
  enableColumnResizing: PropTypes.bool,

  // Performance options
  virtualizationThreshold: PropTypes.number,
  enableVirtualization: PropTypes.bool,
  rowBuffer: PropTypes.number,
  columnBuffer: PropTypes.number,
  rowThreshold: PropTypes.number,
  columnThreshold: PropTypes.number,

  // View options
  showStatsCards: PropTypes.bool,
  showCardView: PropTypes.bool,
  defaultViewMode: PropTypes.oneOf(['grid', 'card']),
  gridCards: PropTypes.array,
  totalCount: PropTypes.number,
  defaultPageSize: PropTypes.number,
  paginationMode: PropTypes.oneOf(['client', 'server']),
  onPaginationModelChange: PropTypes.func,

  // Toolbar configuration
  toolbarConfig: ToolbarConfigPropType,
  customActions: PropTypes.array,
  customLeftActions: PropTypes.array,

  // Context menu configuration
  contextMenuActions: PropTypes.object,

  // Floating actions configuration
  floatingActions: PropTypes.object,
  floatingPosition: PropTypes.string,
  floatingVariant: PropTypes.string,
  enableFloatingActions: PropTypes.bool,

  // Filter configuration
  filterOptions: PropTypes.array,
  currentFilter: PropTypes.string,
  onFilterChange: PropTypes.func,
  childFilterModel: PropTypes.object,
  searchableFields: PropTypes.arrayOf(PropTypes.string),

  // Event handlers
  onSelectionChange: PropTypes.func,
  onError: PropTypes.func,
  onExport: PropTypes.func,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSync: PropTypes.func,
  onSearch: PropTypes.func,
  onSortChange: PropTypes.func,
  onFilterModelChange: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowDoubleClick: PropTypes.func,
  onRefresh: PropTypes.func,

  // Advanced props
  preColumns: PropTypes.array,
  endColumns: PropTypes.array,
  initialVisibleColumns: PropTypes.arrayOf(PropTypes.string),

  // Custom filter props for specialized grids
  succursaleOptions: PropTypes.array,
  currentSuccursale: PropTypes.string,
  onSuccursaleChange: PropTypes.func,
  sourceOptions: PropTypes.array,
  currentSource: PropTypes.string,
  onSourceChange: PropTypes.func,
  showChangedOnly: PropTypes.bool,
  setShowChangedOnly: PropTypes.func,
  onSyncStocksHandler: PropTypes.func,
  onSyncAllHandler: PropTypes.func,
  canInfo: PropTypes.bool,
  onInfo: PropTypes.func,
  mdmStocks: PropTypes.bool
};

// ===== TOOLBAR PROP TYPES =====

export const BaseToolbarPropTypes = {
  ...CommonPropTypes,
  
  // Basic props
  gridName: PropTypes.string,
  gridType: PropTypes.string,
  config: ToolbarConfigPropType,

  // Actions
  customActions: PropTypes.array,
  customLeftActions: PropTypes.array,
  selectedRows: PropTypes.array,

  // Event handlers
  onRefresh: PropTypes.func,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSync: PropTypes.func,
  onExport: PropTypes.func,
  onImport: PropTypes.func,
  onSearch: PropTypes.func,
  onClearSearch: PropTypes.func,

  // Search
  searchValue: PropTypes.string,
  searchPlaceholder: PropTypes.string,

  // Grid controls
  columnVisibility: PropTypes.object,
  onColumnVisibilityChange: PropTypes.func,
  density: PropTypes.oneOf(['compact', 'standard', 'comfortable']),
  onDensityChange: PropTypes.func,

  // View controls
  viewMode: PropTypes.oneOf(['grid', 'card']),
  onViewModeChange: PropTypes.func,
  showCardView: PropTypes.bool,

  // Filter controls
  onFiltersToggle: PropTypes.func,
  filtersVisible: PropTypes.bool,

  // Advanced features
  enableI18n: PropTypes.bool,
  isRTL: PropTypes.bool,
  realTimeEnabled: PropTypes.bool,
  onRealTimeToggle: PropTypes.func,
  showPerformanceMetrics: PropTypes.bool,
  performanceMetrics: PropTypes.object,

  // Custom filter props
  succursaleOptions: PropTypes.array,
  currentSuccursale: PropTypes.string,
  onSuccursaleChange: PropTypes.func,
  sourceOptions: PropTypes.array,
  currentSource: PropTypes.string,
  onSourceChange: PropTypes.func,
  showChangedOnly: PropTypes.bool,
  setShowChangedOnly: PropTypes.func,
  onSyncStocksHandler: PropTypes.func,
  onSyncAllHandler: PropTypes.func,
  canInfo: PropTypes.bool,
  onInfo: PropTypes.func,
  mdmStocks: PropTypes.bool
};

// ===== DIALOG PROP TYPES =====

export const BaseDialogPropTypes = {
  ...CommonPropTypes,
  
  // Core props
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node,

  // Dialog configuration
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  fullScreen: PropTypes.bool,
  disableEscapeKeyDown: PropTypes.bool,
  disableBackdropClick: PropTypes.bool,

  // Actions
  showActions: PropTypes.bool,
  primaryAction: PropTypes.node,
  secondaryAction: PropTypes.node,
  customActions: PropTypes.array,
  
  // Primary action
  primaryLabel: PropTypes.string,
  primaryIcon: PropTypes.node,
  onPrimaryAction: PropTypes.func,
  primaryDisabled: PropTypes.bool,
  primaryLoading: PropTypes.bool,
  primaryColor: PropTypes.string,
  primaryVariant: PropTypes.string,

  // Secondary action
  secondaryLabel: PropTypes.string,
  secondaryIcon: PropTypes.node,
  onSecondaryAction: PropTypes.func,
  secondaryDisabled: PropTypes.bool,
  secondaryColor: PropTypes.string,
  secondaryVariant: PropTypes.string,

  // State management
  success: PropTypes.bool,
  
  // Form handling
  formId: PropTypes.string,
  onSubmit: PropTypes.func,
  
  // Styling
  transition: PropTypes.oneOf(['slide', 'fade', 'none']),
  titleSx: PropTypes.object,
  contentSx: PropTypes.object,
  actionsSx: PropTypes.object,

  // Advanced features
  showCloseButton: PropTypes.bool,
  preventClose: PropTypes.bool,
  autoFocus: PropTypes.bool,
  restoreFocus: PropTypes.bool,

  // Accessibility
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string
};

// ===== CARD PROP TYPES =====

export const BaseCardPropTypes = {
  ...CommonPropTypes,
  
  // Content props
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  subtitle: PropTypes.string,
  description: PropTypes.string,
  
  // Visual props
  icon: PropTypes.elementType,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'info']),
  variant: PropTypes.oneOf(['elevation', 'outlined']),
  elevation: PropTypes.number,
  
  // Trend and analytics
  previousValue: PropTypes.number,
  showTrend: PropTypes.bool,
  trendPeriod: PropTypes.string,
  
  // Progress and goals
  showProgress: PropTypes.bool,
  progressValue: PropTypes.number,
  progressMax: PropTypes.number,
  goalValue: PropTypes.number,
  
  // Interactive features
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  onRefresh: PropTypes.func,
  
  // Styling
  minHeight: PropTypes.number,
  
  // Animation
  animateValue: PropTypes.bool,
  animationDuration: PropTypes.number,
  
  // Advanced features
  realTimeUpdate: PropTypes.bool,
  updateInterval: PropTypes.number,
  
  // Accessibility
  ariaLabel: PropTypes.string
};

// ===== DEFAULT VALUES =====

export const BaseGridDefaultProps = {
  gridName: 'BaseGrid',
  columns: [],
  data: [],
  loading: false,
  error: null,
  density: 'standard',
  
  // Feature toggles
  enableCache: true,
  enableI18n: true,
  enableRTL: false,
  enableSelection: true,
  enableSorting: true,
  enableFiltering: true,
  enableColumnReordering: true,
  enableColumnResizing: true,

  // Performance options
  virtualizationThreshold: 1000,
  enableVirtualization: true,
  rowBuffer: 10,
  columnBuffer: 2,
  rowThreshold: 3,
  columnThreshold: 3,

  // View options
  showStatsCards: false,
  showCardView: false,
  defaultViewMode: 'grid',
  gridCards: [],
  totalCount: 0,
  defaultPageSize: 25,
  paginationMode: 'client',

  // Toolbar configuration
  toolbarConfig: {},
  customActions: [],
  customLeftActions: [],

  // Context menu configuration
  contextMenuActions: {},

  // Floating actions configuration
  floatingActions: {},
  floatingPosition: 'bottom-right',
  floatingVariant: 'speedDial',
  enableFloatingActions: false,

  // Filter configuration
  filterOptions: [],
  currentFilter: 'all',
  searchableFields: ['name', 'id'],

  // Advanced props
  preColumns: [],
  endColumns: [],
  initialVisibleColumns: [],
  sx: {},

  // Custom filter props
  mdmStocks: false
};

export const BaseToolbarDefaultProps = {
  gridName: 'BaseToolbar',
  gridType: 'default',
  config: {},
  customActions: [],
  customLeftActions: [],
  selectedRows: [],
  searchValue: '',
  searchPlaceholder: 'Search...',
  loading: false,
  columnVisibility: {},
  density: 'standard',
  viewMode: 'grid',
  showCardView: false,
  filtersVisible: false,
  enableI18n: true,
  isRTL: false,
  realTimeEnabled: false,
  showPerformanceMetrics: false,
  performanceMetrics: {},
  mdmStocks: false
};

export const BaseDialogDefaultProps = {
  open: false,
  title: '',
  maxWidth: 'sm',
  fullWidth: true,
  fullScreen: false,
  disableEscapeKeyDown: false,
  disableBackdropClick: false,
  showActions: true,
  primaryLabel: 'Save',
  secondaryLabel: 'Cancel',
  primaryDisabled: false,
  primaryLoading: false,
  primaryColor: 'primary',
  primaryVariant: 'contained',
  secondaryDisabled: false,
  secondaryColor: 'inherit',
  secondaryVariant: 'outlined',
  loading: false,
  error: null,
  success: false,
  transition: 'slide',
  showCloseButton: true,
  preventClose: false,
  autoFocus: true,
  restoreFocus: true,
  sx: {},
  titleSx: {},
  contentSx: {},
  actionsSx: {}
};

export const BaseCardDefaultProps = {
  title: '',
  value: 0,
  subtitle: '',
  description: '',
  color: 'primary',
  variant: 'elevation',
  elevation: 1,
  loading: false,
  error: null,
  showTrend: false,
  trendPeriod: '24h',
  showProgress: false,
  progressValue: 0,
  progressMax: 100,
  clickable: false,
  minHeight: 120,
  animateValue: true,
  animationDuration: 1000,
  realTimeUpdate: false,
  updateInterval: 30000,
  sx: {}
};

// ===== VALIDATION HELPERS =====

/**
 * Validates grid configuration object
 */
export const validateGridConfig = (config) => {
  const errors = [];
  
  if (config.columns && !Array.isArray(config.columns)) {
    errors.push('columns must be an array');
  }
  
  if (config.data && !Array.isArray(config.data)) {
    errors.push('data must be an array');
  }
  
  if (config.defaultPageSize && (typeof config.defaultPageSize !== 'number' || config.defaultPageSize <= 0)) {
    errors.push('defaultPageSize must be a positive number');
  }
  
  if (config.virtualizationThreshold && (typeof config.virtualizationThreshold !== 'number' || config.virtualizationThreshold <= 0)) {
    errors.push('virtualizationThreshold must be a positive number');
  }
  
  return errors;
};

/**
 * Validates toolbar configuration object
 */
export const validateToolbarConfig = (config) => {
  const errors = [];
  
  if (config.size && !['small', 'medium', 'large'].includes(config.size)) {
    errors.push('size must be one of: small, medium, large');
  }
  
  if (config.priorityActions && !Array.isArray(config.priorityActions)) {
    errors.push('priorityActions must be an array');
  }
  
  if (config.exportOptions && typeof config.exportOptions !== 'object') {
    errors.push('exportOptions must be an object');
  }
  
  return errors;
};

/**
 * Validates dialog configuration object
 */
export const validateDialogConfig = (config) => {
  const errors = [];
  
  if (config.maxWidth && !['xs', 'sm', 'md', 'lg', 'xl'].includes(config.maxWidth)) {
    errors.push('maxWidth must be one of: xs, sm, md, lg, xl');
  }
  
  if (config.transition && !['slide', 'fade', 'none'].includes(config.transition)) {
    errors.push('transition must be one of: slide, fade, none');
  }
  
  return errors;
};

/**
 * Validates card configuration object
 */
export const validateCardConfig = (config) => {
  const errors = [];
  
  if (config.color && !['primary', 'secondary', 'success', 'warning', 'error', 'info'].includes(config.color)) {
    errors.push('color must be one of: primary, secondary, success, warning, error, info');
  }
  
  if (config.variant && !['elevation', 'outlined'].includes(config.variant)) {
    errors.push('variant must be one of: elevation, outlined');
  }
  
  if (config.elevation && (typeof config.elevation !== 'number' || config.elevation < 0 || config.elevation > 24)) {
    errors.push('elevation must be a number between 0 and 24');
  }
  
  return errors;
};

// ===== PROP VALIDATION UTILITIES =====

/**
 * Creates a prop validator that logs warnings for invalid props
 */
export const createPropValidator = (componentName, propTypes, defaultProps) => {
  return (props) => {
    // Validate props using PropTypes
    PropTypes.checkPropTypes(propTypes, props, 'prop', componentName);
    
    // Apply default props
    const validatedProps = { ...defaultProps, ...props };
    
    // Custom validation logic can be added here
    
    return validatedProps;
  };
};

/**
 * HOC that adds prop validation to a component
 */
export const withPropValidation = (Component, propTypes, defaultProps) => {
  const validator = createPropValidator(Component.displayName || Component.name, propTypes, defaultProps);
  
  const ValidatedComponent = (props) => {
    const validatedProps = validator(props);
    return <Component {...validatedProps} />;
  };
  
  ValidatedComponent.displayName = `withPropValidation(${Component.displayName || Component.name})`;
  ValidatedComponent.propTypes = propTypes;
  ValidatedComponent.defaultProps = defaultProps;
  
  return ValidatedComponent;
};

export default {
  BaseGridPropTypes,
  BaseToolbarPropTypes,
  BaseDialogPropTypes,
  BaseCardPropTypes,
  BaseGridDefaultProps,
  BaseToolbarDefaultProps,
  BaseDialogDefaultProps,
  BaseCardDefaultProps,
  validateGridConfig,
  validateToolbarConfig,
  validateDialogConfig,
  validateCardConfig,
  createPropValidator,
  withPropValidation
};