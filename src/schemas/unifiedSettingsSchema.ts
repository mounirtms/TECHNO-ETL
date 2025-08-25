/**
 * Unified Settings Schema for TECHNO-ETL
 * Comprehensive schema that consolidates all user preferences, API configurations, and dashboard settings
 * Version: 2.0.0
 */

// Extend Window interface for custom properties
declare global {
  interface Window {
    __VITE_ENV__?: Record<string, string>;
  }
}

// Environment variable defaults
const getEnvDefault = (key: string, fallback = '') => {
  if(typeof window !== 'undefined' && window?.__VITE_ENV__) {
    return window?.__VITE_ENV__[key] || fallback;
  }
  try {
    // Use dynamic import.meta access for Vite environment variables
    if(import.meta && import.meta.env) {
      return import.meta.env[key] || fallback;
    }
  } catch {
    // Fallback if import.meta is not available
  }
  return fallback;
};

/**
 * Complete unified settings schema
 */
export const UNIFIED_SETTINGS_SCHEMA = {
  // Schema metadata
  _meta: {
    version: '2.0.0',
    lastUpdated: null,
    migrationVersion: 1,
    source: 'unified'
  },

  // Personal information
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    birthDate: '',
    gender: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    avatar: null
  },

  // API configurations
  apiSettings: {
    magento: {
      enabled: true,
      name: 'Magento API',
      description: 'E-commerce platform integration',
      url: getEnvDefault('VITE_MAGENTO_URL'),
      username: getEnvDefault('VITE_MAGENTO_USERNAME'),
      password: getEnvDefault('VITE_MAGENTO_PASSWORD'),
      authMode: getEnvDefault('VITE_MAGENTO_AUTH_TYPE', 'basic'), // 'basic', 'oauth'
      consumerKey: getEnvDefault('VITE_MAGENTO_CONSUMER_KEY'),
      consumerSecret: getEnvDefault('VITE_MAGENTO_CONSUMER_SECRET'),
      accessToken: getEnvDefault('VITE_MAGENTO_ACCESS_TOKEN'),
      accessTokenSecret: getEnvDefault('VITE_MAGENTO_ACCESS_TOKEN_SECRET'),
      enableDirectConnection: false,
      timeout: 30000,
      retryAttempts: 3,
      version: '2.4',
      storeCode: 'default',
      websiteId: 1
    },
    cegid: {
      enabled: false,
      name: 'CEGID API',
      description: 'ERP system integration',
      url: '',
      username: '',
      password: '',
      database: '',
      timeout: 30000,
      retryAttempts: 3,
      version: '1.0',
      connectionString: ''
    },
    firebase: {
      enabled: true,
      name: 'Firebase API',
      description: 'Real-time database and authentication',
      projectId: getEnvDefault('VITE_FIREBASE_PROJECT_ID'),
      apiKey: getEnvDefault('VITE_FIREBASE_API_KEY'),
      authDomain: getEnvDefault('VITE_FIREBASE_AUTH_DOMAIN'),
      databaseURL: getEnvDefault('VITE_FIREBASE_DATABASE_URL'),
      storageBucket: getEnvDefault('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnvDefault('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnvDefault('VITE_FIREBASE_APP_ID')
    },
    general: {
      backendServer: getEnvDefault('VITE_BACKEND_URL', 'http://localhost:3001'),
      globalTimeout: 30000,
      enableLogging: true,
      enableRetry: true,
      maxConcurrentRequests: 10,
      enableCaching: true,
      cacheTimeout: 300000 // 5 minutes
    }
  },

  // User preferences
  preferences: {
    // Appearance
    language: 'en',
    theme: 'system', // 'light', 'dark', 'system'
    colorPreset: 'purple', // 'blue', 'green', 'purple', 'orange', 'red'
    fontSize: 'medium', // 'small', 'medium', 'large', 'extra-large'
    density: 'standard', // 'compact', 'standard', 'comfortable'
    animations: true,
    borderRadius: 'medium', // 'none', 'small', 'medium', 'large'

    // Grid and data display
    defaultPageSize: 25,
    enableVirtualization: true,
    showStatsCards: true,
    autoRefresh: false,
    refreshInterval: 30, // seconds
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h', // '12h', '24h'
    numberFormat: 'en-US', // locale for number formatting

    // Performance
    cacheEnabled: true,
    lazyLoading: true,
    compressionEnabled: true,
    enableServiceWorker: true,
    preloadData: false,

    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    soundEnabled: true,
    desktopNotifications: false,
    notificationPosition: 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right'

    // Security
    sessionTimeout: 30, // minutes
    twoFactorEnabled: false,
    auditLogging: true,
    autoLogout: true,
    rememberLogin: false,

    // Accessibility
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    screenReader: false,
    reducedMotion: false,
    focusIndicators: true,

    // Developer settings
    developerMode: false,
    debugMode: false,
    showPerformanceMetrics: false,
    enableConsoleLogging: false
  },

  // Dashboard configuration
  dashboard: {
    layout: 'default', // 'default', 'compact', 'detailed'

    // Stat cards visibility
    statCards: {
      revenue: true,
      orders: true,
      products: true,
      customers: true,
      categories: true,
      brands: true,
      lowStock: true,
      pendingOrders: true,
      inventory: true,
      sales: true
    },

    // Charts visibility
    charts: {
      orders: true,
      customers: true,
      productStats: true,
      brandDistribution: true,
      categoryTree: true,
      salesPerformance: true,
      inventoryStatus: true,
      productAttributes: true,
      revenueChart: true,
      topProducts: true
    },

    // Widgets configuration
    widgets: {
      taskManagement: true,
      recentActivity: true,
      performanceMetrics: true,
      quickActions: true,
      dashboardOverview: true,
      notifications: true,
      calendar: false,
      weather: false
    },

    // General dashboard settings
    general: {
      autoRefresh: false,
      refreshInterval: 300, // seconds
      animations: true,
      compactMode: false,
      showTooltips: true,
      enableDragDrop: true,
      saveLayout: true,
      defaultDateRange: '30d' // '7d', '30d', '90d', '1y'
    }
  },

  // Application state
  appState: {
    lastActiveTab: 'Dashboard',
    sidebarCollapsed: false,
    recentlyUsedFeatures: [],
    bookmarkedPages: [],
    customShortcuts: {},
    workspaceLayout: 'default'
  }
};

/**
 * Settings validation rules
 */
export const SETTINGS_VALIDATION = {
  personalInfo: {
    email: { type: 'email', required: false },
    phone: { type: 'string', pattern: /^[\+]?[1-9][\d]{0,15}$/ },
    postalCode: { type: 'string', maxLength: 20 }
  },
  apiSettings: {
    magento: {
      url: { type: 'url', required: true },
      username: { type: 'string', required: true, minLength: 1 },
      password: { type: 'string', required: true, minLength: 1 },
      timeout: { type: 'number', min: 1000, max: 120000 },
      retryAttempts: { type: 'number', min: 0, max: 10 }
    },
    cegid: {
      url: { type: 'url', required: false },
      timeout: { type: 'number', min: 1000, max: 120000 }
    }
  },
  preferences: {
    language: { type: 'enum', values: ['en', 'fr', 'ar'] },
    theme: { type: 'enum', values: ['light', 'dark', 'system'] },
    fontSize: { type: 'enum', values: ['small', 'medium', 'large', 'extra-large'] },
    density: { type: 'enum', values: ['compact', 'standard', 'comfortable'] },
    defaultPageSize: { type: 'number', min: 5, max: 100 },
    refreshInterval: { type: 'number', min: 10, max: 3600 },
    sessionTimeout: { type: 'number', min: 5, max: 480 }
  }
};

/**
 * Storage keys for different settings categories
 */
export const STORAGE_KEYS = {
  UNIFIED_SETTINGS: 'techno-etl-unified-settings-v2',
  LEGACY_USER_SETTINGS: 'userSettings',
  LEGACY_API_SETTINGS: 'userApiSettings',
  LEGACY_DASHBOARD_SETTINGS: 'dashboardSettings',
  LEGACY_TECHNO_SETTINGS: 'techno-etl-settings',
  BACKUP_PREFIX: 'techno-etl-backup-',
  USER_PREFIX: 'techno-etl-user-'
};

/**
 * Default export
 */
export default UNIFIED_SETTINGS_SCHEMA;
