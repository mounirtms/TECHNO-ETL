// Firebase Realtime Database Default Structure and Constants
import { database } from './firebase';
import { ref, set, get } from 'firebase/database';

// Default User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  VIEWER: 'viewer',
};

// Role Hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [USER_ROLES.SUPER_ADMIN]: 100,
  [USER_ROLES.ADMIN]: 80,
  [USER_ROLES.MANAGER]: 60,
  [USER_ROLES.USER]: 40,
  [USER_ROLES.VIEWER]: 20,
};

// Default Licensed Programs/Lists
export const DEFAULT_LICENSED_PROGRAMS = {
  BUG_BOUNTY: {
    id: 'bug_bounty',
    name: 'Bug Bounty Program',
    description: 'Quality assurance and bug reporting system',
    category: 'quality',
    icon: 'BugReportIcon',
    path: '/bug-bounty',
    defaultEnabled: true,
    permissions: {
      canRead: true,
      canReport: true,
      canAssign: false,
      canReview: false,
      canDelete: false,
    },
  },
  TASK_VOTING: {
    id: 'task_voting',
    name: 'Task Voting Program',
    description: 'Feature request and task prioritization system',
    category: 'quality',
    icon: 'HowToVoteIcon',
    path: '/voting',
    defaultEnabled: true,
    permissions: {
      canRead: true,
      canVote: true,
      canCreate: false,
      canModerate: false,
      canDelete: false,
    },
  },
  ANALYTICS_PREMIUM: {
    id: 'analytics_premium',
    name: 'Premium Analytics',
    description: 'Advanced analytics and reporting features',
    category: 'analytics',
    icon: 'AnalyticsIcon',
    path: '/analytics/premium',
    defaultEnabled: false,
    permissions: {
      canRead: false,
      canExport: false,
      canShare: false,
      canManage: false,
    },
  },
  INVENTORY_ADVANCED: {
    id: 'inventory_advanced',
    name: 'Advanced Inventory Management',
    description: 'Advanced inventory tracking and management tools',
    category: 'inventory',
    icon: 'Inventory2Icon',
    path: '/inventory/advanced',
    defaultEnabled: false,
    permissions: {
      canRead: false,
      canEdit: false,
      canBulkEdit: false,
      canDelete: false,
    },
  },
  INTEGRATION_PREMIUM: {
    id: 'integration_premium',
    name: 'Premium Integrations',
    description: 'Advanced third-party integrations and APIs',
    category: 'integration',
    icon: 'DataObjectIcon',
    path: '/integrations/premium',
    defaultEnabled: false,
    permissions: {
      canRead: false,
      canConfigure: false,
      canSync: false,
      canManage: false,
    },
  },
};

// Default Menu Categories for Tree Structure
export const MENU_CATEGORIES = {
  CORE: {
    id: 'core',
    name: 'Core Dashboard',
    description: 'Essential dashboard features',
    order: 1,
    defaultExpanded: true,
    licensingRequired: false,
  },
  PRODUCTS: {
    id: 'products',
    name: 'Product Management',
    description: 'Product catalog and management tools',
    order: 2,
    defaultExpanded: false,
    licensingRequired: true,
  },
  INVENTORY: {
    id: 'inventory',
    name: 'Inventory & Stock',
    description: 'Inventory tracking and stock management',
    order: 3,
    defaultExpanded: false,
    licensingRequired: true,
  },
  SALES: {
    id: 'sales',
    name: 'Sales & Orders',
    description: 'Order processing and customer management',
    order: 4,
    defaultExpanded: false,
    licensingRequired: true,
  },
  ANALYTICS: {
    id: 'analytics',
    name: 'Analytics & Reports',
    description: 'Business intelligence and reporting',
    order: 5,
    defaultExpanded: false,
    licensingRequired: true,
  },
  INTEGRATION: {
    id: 'integration',
    name: ' Integration',
    description: 'External system integrations',
    order: 6,
    defaultExpanded: false,
    licensingRequired: true,
  },
  QUALITY: {
    id: 'quality',
    name: 'Quality Assurance',
    description: 'Testing and quality management tools',
    order: 7,
    defaultExpanded: false,
    licensingRequired: false, // Bug bounty and voting are free
  },
  DEVELOPMENT_TESTING: {
    id: 'development_testing',
    name: 'Development & Testing',
    description: 'Development tools and testing features',
    order: 8,
    defaultExpanded: true,
    licensingRequired: false, // Default licensed list for first-time users
  },
  SECURITY: {
    id: 'security',
    name: 'Security & Access',
    description: 'Security management and access control',
    order: 8,
    defaultExpanded: false,
    licensingRequired: true,
  },
  SYSTEM: {
    id: 'system',
    name: ' Management',
    description: 'System configuration and administration',
    order: 9,
    defaultExpanded: false,
    licensingRequired: false, // Always accessible for admins
  },
};

// Default License Types
export const LICENSE_TYPES = {
  FREE: {
    name: 'Free',
    duration: null, // No expiration
    features: ['bug_bounty', 'task_voting'],
    maxUsers: 3,
    supportLevel: 'community',
  },
  BASIC: {
    name: 'Basic',
    duration: 365, // 1 year
    features: ['bug_bounty', 'task_voting', 'analytics_basic'],
    maxUsers: 10,
    supportLevel: 'email',
  },
  PROFESSIONAL: {
    name: 'Professional',
    duration: 365, // 1 year
    features: ['bug_bounty', 'task_voting', 'analytics_premium', 'inventory_advanced'],
    maxUsers: 50,
    supportLevel: 'priority',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    duration: 365, // 1 year
    features: Object.keys(DEFAULT_LICENSED_PROGRAMS),
    maxUsers: -1, // Unlimited
    supportLevel: 'dedicated',
  },
};

// Permission Levels
export const PERMISSION_LEVELS = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
  DELETE: 3,
  ADMIN: 4,
};

/**
 * Initialize Firebase database with default structure
 */
export const initializeFirebaseDefaults = async () => {
  try {
    // Initialize menu categories
    const categoriesRef = ref(database, 'system/menuCategories');
    const categoriesSnapshot = await get(categoriesRef);

    if (!categoriesSnapshot.exists()) {
      await set(categoriesRef, MENU_CATEGORIES);
    }

    // Initialize licensed programs
    const programsRef = ref(database, 'system/licensedPrograms');
    const programsSnapshot = await get(programsRef);

    if (!programsSnapshot.exists()) {
      await set(programsRef, DEFAULT_LICENSED_PROGRAMS);
    }

    // Initialize license types
    const licenseTypesRef = ref(database, 'system/licenseTypes');
    const licenseTypesSnapshot = await get(licenseTypesRef);

    if (!licenseTypesSnapshot.exists()) {
      await set(licenseTypesRef, LICENSE_TYPES);
    }

    // Initialize system settings
    const systemSettingsRef = ref(database, 'system/settings');
    const systemSettingsSnapshot = await get(systemSettingsRef);

    if (!systemSettingsSnapshot.exists()) {
      await set(systemSettingsRef, {
        appVersion: '1.0.0',
        lastUpdated: new Date().toISOString(),
        maintenanceMode: false,
        registrationEnabled: true,
        defaultUserRole: USER_ROLES.USER,
        maxUsersPerLicense: {
          free: 3,
          basic: 10,
          professional: 50,
          enterprise: -1,
        },
      });
    }

    console.log('Firebase defaults initialized successfully');

    return true;
  } catch (error) {
    console.error('Error initializing Firebase defaults:', error);

    return false;
  }
};

/**
 * Create default user license
 */
export const createDefaultUserLicense = (userId, licenseType = 'FREE') => {
  const license = LICENSE_TYPES[licenseType];
  const expiryDate = license.duration
    ? new Date(Date.now() + license.duration * 24 * 60 * 60 * 1000).toISOString()
    : null;

  return {
    isValid: true,
    licenseType: licenseType.toLowerCase(),
    features: license.features,
    expiryDate,
    maxUsers: license.maxUsers,
    supportLevel: license.supportLevel,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Default permissions for licensed programs
    programPermissions: Object.keys(DEFAULT_LICENSED_PROGRAMS).reduce((acc, programId) => {
      const program = DEFAULT_LICENSED_PROGRAMS[programId];

      acc[programId] = {
        enabled: license.features.includes(programId) || program.defaultEnabled,
        permissions: { ...program.permissions },
      };

      return acc;
    }, {}),
    // Menu-specific permissions
    menuPermissions: {},
    // General permissions
    canRead: true,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canAssignRoles: false,
  };
};

/**
 * Get user role permissions
 */
export const getRolePermissions = (role) => {
  const roleLevel = ROLE_HIERARCHY[role] || 0;

  return {
    canRead: roleLevel >= ROLE_HIERARCHY[USER_ROLES.VIEWER],
    canEdit: roleLevel >= ROLE_HIERARCHY[USER_ROLES.USER],
    canDelete: roleLevel >= ROLE_HIERARCHY[USER_ROLES.MANAGER],
    canManageUsers: roleLevel >= ROLE_HIERARCHY[USER_ROLES.ADMIN],
    canAssignRoles: roleLevel >= ROLE_HIERARCHY[USER_ROLES.SUPER_ADMIN],
    canAccessSystem: roleLevel >= ROLE_HIERARCHY[USER_ROLES.ADMIN],
    canManageLicenses: roleLevel >= ROLE_HIERARCHY[USER_ROLES.SUPER_ADMIN],
  };
};

export default {
  USER_ROLES,
  ROLE_HIERARCHY,
  DEFAULT_LICENSED_PROGRAMS,
  MENU_CATEGORIES,
  LICENSE_TYPES,
  PERMISSION_LEVELS,
  initializeFirebaseDefaults,
  createDefaultUserLicense,
  getRolePermissions,
};
