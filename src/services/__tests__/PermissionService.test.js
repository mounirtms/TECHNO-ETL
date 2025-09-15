/**
 * Unit tests for PermissionService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import PermissionService from '../PermissionService';
import LicenseManager from '../LicenseManager';
import { USER_ROLES, ROLE_HIERARCHY } from '../../config/firebaseDefaults';

// Mock LicenseManager
vi.mock('../LicenseManager', () => ({
  default: {
    checkUserLicense: vi.fn(),
    validateFeatureAccess: vi.fn(),
  },
}));

describe('PermissionService', () => {
  const mockUser = {
    uid: 'testuser123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockLicenseStatus = {
    isValid: true,
    level: 'professional',
    role: USER_ROLES.USER,
    features: ['feature1', 'feature2'],
    permissions: [
      { resource: '*', actions: ['view', 'edit'] },
      { resource: 'products', actions: ['view', 'edit', 'delete'] },
    ],
    expiryDate: new Date(Date.now() + 86400000), // Tomorrow
  };

  beforeEach(() => {
    vi.clearAllMocks();
    PermissionService.permissionCache.clear();
    PermissionService.currentUser = null;
    PermissionService.currentLicenseStatus = null;
    PermissionService.currentPermissions = [];
  });

  describe('initialize', () => {
    it('should initialize with user and fetch license status', async () => {
      LicenseManager.checkUserLicense.mockResolvedValue(mockLicenseStatus);

      await PermissionService.initialize(mockUser);

      expect(PermissionService.currentUser).toEqual(mockUser);
      expect(PermissionService.currentLicenseStatus).toEqual(mockLicenseStatus);
      expect(PermissionService.currentPermissions).toEqual(mockLicenseStatus.permissions);
      expect(LicenseManager.checkUserLicense).toHaveBeenCalledWith(mockUser.uid);
    });

    it('should handle initialization without user', async () => {
      await PermissionService.initialize(null);

      expect(PermissionService.currentUser).toBeNull();
      expect(PermissionService.currentLicenseStatus).toBeNull();
      expect(PermissionService.currentPermissions).toEqual([]);
    });

    it('should handle errors during initialization', async () => {
      LicenseManager.checkUserLicense.mockRejectedValue(new Error('License check failed'));

      await PermissionService.initialize(mockUser);

      expect(PermissionService.currentUser).toEqual(mockUser);
      expect(PermissionService.currentLicenseStatus).toBeNull();
      expect(PermissionService.currentPermissions).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    beforeEach(async () => {
      LicenseManager.checkUserLicense.mockResolvedValue(mockLicenseStatus);
      await PermissionService.initialize(mockUser);
    });

    it('should return true for admin users', () => {
      PermissionService.currentLicenseStatus.role = USER_ROLES.ADMIN;

      const result = PermissionService.hasPermission('delete', 'any_resource');

      expect(result).toBe(true);
    });

    it('should return true for super admin users', () => {
      PermissionService.currentLicenseStatus.role = USER_ROLES.SUPER_ADMIN;

      const result = PermissionService.hasPermission('delete', 'any_resource');

      expect(result).toBe(true);
    });

    it('should check role-based permissions for regular users', () => {
      PermissionService.currentLicenseStatus.role = USER_ROLES.USER;

      expect(PermissionService.hasPermission('view')).toBe(true);
      expect(PermissionService.hasPermission('edit')).toBe(true);
      expect(PermissionService.hasPermission('delete')).toBe(false);
    });

    it('should check manager permissions', () => {
      PermissionService.currentLicenseStatus.role = USER_ROLES.MANAGER;

      expect(PermissionService.hasPermission('view')).toBe(true);
      expect(PermissionService.hasPermission('edit')).toBe(true);
      expect(PermissionService.hasPermission('delete')).toBe(true);
    });

    it('should cache permission results', () => {
      const result1 = PermissionService.hasPermission('view', 'products');
      const result2 = PermissionService.hasPermission('view', 'products');

      expect(result1).toBe(result2);
      expect(PermissionService.permissionCache.has('view_products')).toBe(true);
    });

    it('should return false when not initialized', () => {
      PermissionService.currentUser = null;
      PermissionService.currentLicenseStatus = null;

      const result = PermissionService.hasPermission('view');

      expect(result).toBe(false);
    });

    it('should handle different action aliases', () => {
      expect(PermissionService.hasPermission('read')).toBe(true);
      expect(PermissionService.hasPermission('update')).toBe(true);
      expect(PermissionService.hasPermission('create')).toBe(true);
    });
  });

  describe('getPermissions', () => {
    beforeEach(async () => {
      LicenseManager.checkUserLicense.mockResolvedValue(mockLicenseStatus);
      await PermissionService.initialize(mockUser);
    });

    it('should return current user permissions', async () => {
      const permissions = await PermissionService.getPermissions();

      expect(permissions).toEqual(mockLicenseStatus.permissions);
    });

    it('should fetch permissions for different user', async () => {
      const otherUserId = 'otheruser';
      const otherLicenseStatus = {
        ...mockLicenseStatus,
        permissions: [{ resource: 'orders', actions: ['view'] }],
      };

      LicenseManager.checkUserLicense.mockResolvedValue(otherLicenseStatus);

      const permissions = await PermissionService.getPermissions(otherUserId);

      expect(permissions).toEqual(otherLicenseStatus.permissions);
      expect(LicenseManager.checkUserLicense).toHaveBeenCalledWith(otherUserId);
    });

    it('should return empty array when not initialized', async () => {
      PermissionService.currentUser = null;
      const permissions = await PermissionService.getPermissions();

      expect(permissions).toEqual([]);
    });
  });

  describe('checkFeatureAccess', () => {
    beforeEach(async () => {
      LicenseManager.checkUserLicense.mockResolvedValue(mockLicenseStatus);
      await PermissionService.initialize(mockUser);
    });

    it('should delegate to LicenseManager', async () => {
      LicenseManager.validateFeatureAccess.mockResolvedValue(true);

      const result = await PermissionService.checkFeatureAccess('feature1');

      expect(result).toBe(true);
      expect(LicenseManager.validateFeatureAccess).toHaveBeenCalledWith('feature1', mockUser.uid);
    });

    it('should return false when not initialized', async () => {
      PermissionService.currentUser = null;
      const result = await PermissionService.checkFeatureAccess('feature1');

      expect(result).toBe(false);
    });
  });

  describe('filterMenuItems', () => {
    const mockMenuItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        permissions: ['view:*'],
      },
      {
        id: 'admin',
        label: 'Admin Panel',
        path: '/admin',
        roleRequired: USER_ROLES.ADMIN,
      },
      {
        id: 'products',
        label: 'Products',
        path: '/products',
        licenseRequired: true,
        children: [
          {
            id: 'product-list',
            label: 'Product List',
            path: '/products/list',
            permissions: ['view:products'],
          },
          {
            id: 'product-admin',
            label: 'Product Admin',
            path: '/products/admin',
            roleRequired: USER_ROLES.ADMIN,
          },
        ],
      },
    ];

    beforeEach(async () => {
      LicenseManager.checkUserLicense.mockResolvedValue(mockLicenseStatus);
      await PermissionService.initialize(mockUser);
    });

    it('should filter menu items based on permissions', () => {
      const filtered = PermissionService.filterMenuItems(mockMenuItems);

      expect(filtered).toHaveLength(2); // dashboard and products
      expect(filtered.find(item => item.id === 'dashboard')).toBeDefined();
      expect(filtered.find(item => item.id === 'products')).toBeDefined();
      expect(filtered.find(item => item.id === 'admin')).toBeUndefined();
    });

    it('should filter children menu items', () => {
      const filtered = PermissionService.filterMenuItems(mockMenuItems);
      const productsMenu = filtered.find(item => item.id === 'products');

      expect(productsMenu.children).toHaveLength(1); // Only product-list
      expect(productsMenu.children[0].id).toBe('product-list');
    });

    it('should allow admin access to all items', () => {
      PermissionService.currentLicenseStatus.role = USER_ROLES.ADMIN;

      const filtered = PermissionService.filterMenuItems(mockMenuItems);

      expect(filtered).toHaveLength(3); // All items
      expect(filtered.find(item => item.id === 'admin')).toBeDefined();
    });

    it('should return empty array when not initialized', () => {
      PermissionService.currentUser = null;
      PermissionService.currentLicenseStatus = null;

      const filtered = PermissionService.filterMenuItems(mockMenuItems);

      expect(filtered).toEqual([]);
    });
  });

  describe('canAccessMenuItem', () => {
    beforeEach(async () => {
      LicenseManager.checkUserLicense.mockResolvedValue(mockLicenseStatus);
      await PermissionService.initialize(mockUser);
    });

    it('should check role requirements', () => {
      const adminMenuItem = {
        id: 'admin',
        roleRequired: USER_ROLES.ADMIN,
      };

      expect(PermissionService.canAccessMenuItem(adminMenuItem)).toBe(false);

      PermissionService.currentLicenseStatus.role = USER_ROLES.ADMIN;
      expect(PermissionService.canAccessMenuItem(adminMenuItem)).toBe(true);
    });

    it('should check license requirements', () => {
      const licensedMenuItem = {
        id: 'premium',
        licenseRequired: true,
      };

      expect(PermissionService.canAccessMenuItem(licensedMenuItem)).toBe(true);

      PermissionService.currentLicenseStatus.isValid = false;
      expect(PermissionService.canAccessMenuItem(licensedMenuItem)).toBe(false);
    });

    it('should allow admin access even with invalid license', () => {
      const licensedMenuItem = {
        id: 'premium',
        licenseRequired: true,
      };

      PermissionService.currentLicenseStatus.isValid = false;
      PermissionService.currentLicenseStatus.role = USER_ROLES.ADMIN;

      expect(PermissionService.canAccessMenuItem(licensedMenuItem)).toBe(true);
    });

    it('should check specific permissions', () => {
      const permissionMenuItem = {
        id: 'products',
        permissions: ['edit:products'],
      };

      // Mock hasPermission to return true for edit:products
      vi.spyOn(PermissionService, 'hasPermission').mockReturnValue(true);

      expect(PermissionService.canAccessMenuItem(permissionMenuItem)).toBe(true);
    });
  });

  describe('getPermissionSummary', () => {
    beforeEach(async () => {
      LicenseManager.checkUserLicense.mockResolvedValue(mockLicenseStatus);
      await PermissionService.initialize(mockUser);
    });

    it('should return comprehensive permission summary', () => {
      const summary = PermissionService.getPermissionSummary();

      expect(summary).toEqual({
        role: USER_ROLES.USER,
        licenseLevel: 'professional',
        isValid: true,
        permissions: {
          canRead: true,
          canEdit: true,
          canDelete: false,
          canAdd: true,
          canManageUsers: false,
          canAssignRoles: false,
        },
        features: ['feature1', 'feature2'],
        expiryDate: mockLicenseStatus.expiryDate,
      });
    });

    it('should return default summary when not initialized', () => {
      PermissionService.currentLicenseStatus = null;

      const summary = PermissionService.getPermissionSummary();

      expect(summary.role).toBe('none');
      expect(summary.licenseLevel).toBe('none');
      expect(summary.isValid).toBe(false);
      expect(summary.permissions.canRead).toBe(false);
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      LicenseManager.checkUserLicense.mockResolvedValue(mockLicenseStatus);
      await PermissionService.initialize(mockUser);
    });

    it('should identify admin users', () => {
      expect(PermissionService.isAdmin()).toBe(false);

      PermissionService.currentLicenseStatus.role = USER_ROLES.ADMIN;
      expect(PermissionService.isAdmin()).toBe(true);

      PermissionService.currentLicenseStatus.role = USER_ROLES.SUPER_ADMIN;
      expect(PermissionService.isAdmin()).toBe(true);
    });

    it('should check bulk operation permissions', () => {
      vi.spyOn(PermissionService, 'hasPermission')
        .mockImplementation((action) => action === 'edit' || action === 'delete');

      expect(PermissionService.canPerformBulkOperations()).toBe(true);
    });

    it('should refresh permissions', async () => {
      const newLicenseStatus = { ...mockLicenseStatus, level: 'enterprise' };

      LicenseManager.checkUserLicense.mockResolvedValue(newLicenseStatus);

      await PermissionService.refreshPermissions();

      expect(PermissionService.currentLicenseStatus.level).toBe('enterprise');
    });

    it('should clear cache', () => {
      PermissionService.permissionCache.set('test', 'value');
      PermissionService.clearCache();
      expect(PermissionService.permissionCache.size).toBe(0);
    });

    it('should return current license status', () => {
      const status = PermissionService.getCurrentLicenseStatus();

      expect(status).toEqual(mockLicenseStatus);
    });
  });
});
