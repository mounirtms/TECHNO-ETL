/**
 * Integration tests for Permission System
 * Tests LicenseManager and PermissionService working together
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { USER_ROLES } from '../../config/firebaseDefaults';

// Mock Firebase
vi.mock('../../config/firebase', () => ({
    database: {}
}));

vi.mock('firebase/database', () => ({
    ref: vi.fn(() => ({})),
    get: vi.fn(),
    set: vi.fn(),
    onValue: vi.fn(),
    off: vi.fn()
}));

describe('Permission System Integration', () => {
    let LicenseManager;
    let PermissionService;

    const mockUser = {
        uid: 'integration-test-user',
        email: 'integration@test.com',
        displayName: 'Integration Test User'
    };

    beforeEach(async () => {
        // Import services
        const licenseModule = await import('../LicenseManager');
        const permissionModule = await import('../PermissionService');
        
        LicenseManager = licenseModule.default;
        PermissionService = permissionModule.default;
        
        // Clear state
        LicenseManager.cache.clear();
        LicenseManager.listeners.clear();
        PermissionService.permissionCache.clear();
        PermissionService.currentUser = null;
        PermissionService.currentLicenseStatus = null;
        PermissionService.currentPermissions = [];
        
        vi.clearAllMocks();
    });

    describe('User Permission Workflow', () => {
        it('should handle complete user permission workflow', async () => {
            // Mock Firebase responses for license check
            const { get } = await import('firebase/database');
            
            const mockLicenseData = {
                isValid: true,
                licenseType: 'professional',
                features: ['products', 'analytics', 'reports'],
                expiryDate: new Date(Date.now() + 86400000).toISOString(),
                programPermissions: {
                    'products': {
                        enabled: true,
                        permissions: {
                            'read': true,
                            'write': true,
                            'delete': false
                        }
                    }
                }
            };

            const mockUserData = {
                role: USER_ROLES.USER,
                email: mockUser.email,
                displayName: mockUser.displayName
            };

            get.mockResolvedValue({
                exists: () => true,
                val: () => mockLicenseData
            });

            // Step 1: Initialize PermissionService with user
            await PermissionService.initialize(mockUser);

            // Step 2: Verify user is properly initialized
            expect(PermissionService.currentUser).toEqual(mockUser);
            expect(PermissionService.currentLicenseStatus).toBeDefined();
            expect(PermissionService.currentLicenseStatus.isValid).toBe(true);

            // Step 3: Test basic permissions
            expect(PermissionService.hasPermission('view')).toBe(true);
            expect(PermissionService.hasPermission('edit')).toBe(true);
            expect(PermissionService.hasPermission('delete')).toBe(false);

            // Step 4: Test feature access
            const hasProductsAccess = await PermissionService.checkFeatureAccess('products');
            expect(hasProductsAccess).toBe(true);

            const hasUnknownAccess = await PermissionService.checkFeatureAccess('unknown_feature');
            expect(hasUnknownAccess).toBe(false);

            // Step 5: Test permission summary
            const summary = PermissionService.getPermissionSummary();
            expect(summary.role).toBe(USER_ROLES.USER);
            expect(summary.isValid).toBe(true);
            expect(summary.features).toContain('products');
        });

        it('should handle admin user with elevated permissions', async () => {
            const { get } = await import('firebase/database');
            
            const mockAdminLicenseData = {
                isValid: true,
                licenseType: 'enterprise',
                features: ['products', 'analytics', 'reports', 'admin'],
                expiryDate: new Date(Date.now() + 86400000).toISOString()
            };

            const mockAdminUserData = {
                role: USER_ROLES.ADMIN,
                email: 'admin@test.com',
                displayName: 'Admin User'
            };

            get.mockImplementation((ref) => {
                if (ref.path && ref.path.includes('users')) {
                    return Promise.resolve({
                        exists: () => true,
                        val: () => mockAdminUserData
                    });
                } else {
                    return Promise.resolve({
                        exists: () => true,
                        val: () => mockAdminLicenseData
                    });
                }
            });

            const adminUser = {
                uid: 'admin-user',
                email: 'admin@test.com',
                displayName: 'Admin User'
            };

            // Initialize with admin user
            await PermissionService.initialize(adminUser);

            // Admin should have all permissions
            expect(PermissionService.hasPermission('view')).toBe(true);
            expect(PermissionService.hasPermission('edit')).toBe(true);
            expect(PermissionService.hasPermission('delete')).toBe(true);
            expect(PermissionService.hasPermission('manage_users')).toBe(true);

            // Admin should be identified correctly
            expect(PermissionService.isAdmin()).toBe(true);

            // Admin should have access to all features
            const hasAnyFeatureAccess = await PermissionService.checkFeatureAccess('any_feature');
            expect(hasAnyFeatureAccess).toBe(true);
        });

        it('should handle expired license gracefully', async () => {
            const { get } = await import('firebase/database');
            
            const mockExpiredLicenseData = {
                isValid: true,
                licenseType: 'basic',
                features: ['products'],
                expiryDate: new Date(Date.now() - 86400000).toISOString() // Yesterday
            };

            get.mockResolvedValue({
                exists: () => true,
                val: () => mockExpiredLicenseData
            });

            await PermissionService.initialize(mockUser);

            // License should be marked as invalid due to expiry
            expect(PermissionService.currentLicenseStatus.isValid).toBe(false);

            // Basic permissions should still work based on role
            expect(PermissionService.hasPermission('view')).toBe(true);
            expect(PermissionService.hasPermission('edit')).toBe(true);

            // But licensed features should be denied
            const hasFeatureAccess = await PermissionService.checkFeatureAccess('products');
            expect(hasFeatureAccess).toBe(false);
        });

        it('should handle menu filtering with mixed permissions', async () => {
            const { get } = await import('firebase/database');
            
            const mockLicenseData = {
                isValid: true,
                licenseType: 'professional',
                features: ['products', 'analytics'],
                expiryDate: new Date(Date.now() + 86400000).toISOString()
            };

            get.mockResolvedValue({
                exists: () => true,
                val: () => mockLicenseData
            });

            await PermissionService.initialize(mockUser);

            const mockMenuItems = [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    path: '/dashboard'
                },
                {
                    id: 'products',
                    label: 'Products',
                    path: '/products',
                    licenseRequired: true,
                    featureId: 'products'
                },
                {
                    id: 'admin',
                    label: 'Admin',
                    path: '/admin',
                    roleRequired: USER_ROLES.ADMIN
                },
                {
                    id: 'reports',
                    label: 'Reports',
                    path: '/reports',
                    licenseRequired: true,
                    featureId: 'reports'
                }
            ];

            const filteredItems = PermissionService.filterMenuItems(mockMenuItems);

            // Should include dashboard and products (has feature)
            expect(filteredItems).toHaveLength(2);
            expect(filteredItems.find(item => item.id === 'dashboard')).toBeDefined();
            expect(filteredItems.find(item => item.id === 'products')).toBeDefined();
            
            // Should exclude admin (insufficient role) and reports (no feature)
            expect(filteredItems.find(item => item.id === 'admin')).toBeUndefined();
            expect(filteredItems.find(item => item.id === 'reports')).toBeUndefined();
        });
    });

    describe('License Management Integration', () => {
        it('should update license and reflect changes in permissions', async () => {
            const { get, set } = await import('firebase/database');
            
            // Initial basic license
            const initialLicense = {
                isValid: true,
                licenseType: 'basic',
                features: ['products'],
                expiryDate: new Date(Date.now() + 86400000).toISOString()
            };

            get.mockResolvedValue({
                exists: () => true,
                val: () => initialLicense
            });

            set.mockResolvedValue();

            // Initialize with basic license
            await PermissionService.initialize(mockUser);
            
            let summary = PermissionService.getPermissionSummary();
            expect(summary.licenseLevel).toBe('basic');
            expect(summary.features).toEqual(['products']);

            // Update to professional license
            const upgradedLicense = {
                isValid: true,
                licenseType: 'professional',
                features: ['products', 'analytics', 'reports'],
                expiryDate: new Date(Date.now() + 86400000).toISOString()
            };

            // Mock the updated license data
            get.mockResolvedValue({
                exists: () => true,
                val: () => upgradedLicense
            });

            // Update license through LicenseManager
            await LicenseManager.updateLicenseStatus(mockUser.uid, upgradedLicense);

            // Refresh permissions to get updated license
            await PermissionService.refreshPermissions();

            // Verify updated permissions
            summary = PermissionService.getPermissionSummary();
            expect(summary.licenseLevel).toBe('professional');
            expect(summary.features).toContain('analytics');
            expect(summary.features).toContain('reports');
        });
    });

    describe('Error Handling Integration', () => {
        it('should handle Firebase errors gracefully', async () => {
            const { get } = await import('firebase/database');
            
            // Mock Firebase error
            get.mockRejectedValue(new Error('Firebase connection failed'));

            // Should not throw error
            await expect(PermissionService.initialize(mockUser)).resolves.not.toThrow();

            // Should have fallback state with minimal permissions
            expect(PermissionService.currentLicenseStatus).toBeDefined();
            expect(PermissionService.currentLicenseStatus.isValid).toBe(false);
            expect(PermissionService.hasPermission('view')).toBe(false);
        });

        it('should handle missing license data', async () => {
            const { get, set } = await import('firebase/database');
            
            // Mock no existing license
            get.mockResolvedValue({
                exists: () => false,
                val: () => null
            });

            set.mockResolvedValue();

            await PermissionService.initialize(mockUser);

            // Should create default license and still function
            expect(PermissionService.currentLicenseStatus).toBeDefined();
            expect(PermissionService.currentLicenseStatus.licenseType).toBe('free');
            expect(PermissionService.hasPermission('view')).toBe(true);
        });
    });
});