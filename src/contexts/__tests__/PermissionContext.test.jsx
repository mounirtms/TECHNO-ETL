import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PermissionProvider, usePermissions, useLicense } from '../PermissionContext';
import { AuthProvider } from '../AuthContext';

// Mock the services
vi.mock('../../services/PermissionService', () => ({
    default: {
        initialize: vi.fn().mockResolvedValue(undefined),
        getPermissions: vi.fn().mockResolvedValue([
            { resource: '*', actions: ['view', 'edit'] }
        ]),
        hasPermission: vi.fn().mockReturnValue(true),
        filterMenuItems: vi.fn().mockReturnValue([]),
        canAccessMenuItem: vi.fn().mockReturnValue(true),
        getPermissionSummary: vi.fn().mockReturnValue({
            role: 'user',
            licenseLevel: 'basic',
            isValid: true,
            permissions: {
                canRead: true,
                canEdit: true,
                canDelete: false,
                canAdd: false,
                canManageUsers: false,
                canAssignRoles: false
            }
        }),
        isAdmin: vi.fn().mockReturnValue(false),
        canPerformBulkOperations: vi.fn().mockReturnValue(false),
        refreshPermissions: vi.fn().mockResolvedValue(undefined),
        checkFeatureAccess: vi.fn().mockResolvedValue(true)
    }
}));

vi.mock('../../services/LicenseManager', () => ({
    default: {
        checkUserLicense: vi.fn().mockResolvedValue({
            isValid: true,
            level: 'basic',
            expiryDate: null,
            features: ['bug_bounty', 'task_voting'],
            permissions: [{ resource: '*', actions: ['view', 'edit'] }],
            licenseType: 'free',
            maxUsers: 3,
            role: 'user'
        }),
        listenToLicenseChanges: vi.fn().mockReturnValue(() => {}),
        validateFeatureAccess: vi.fn().mockResolvedValue(true)
    }
}));

// Mock Firebase
vi.mock('../../config/firebase', () => ({
    auth: {},
    database: {}
}));

// Mock other services
vi.mock('../../services/magentoService', () => ({
    default: {
        login: vi.fn(),
        get: vi.fn()
    }
}));

vi.mock('../../services/firebaseSyncService', () => ({
    default: {
        syncUserOnLogin: vi.fn()
    }
}));

// Test component that uses the hooks
const TestComponent = () => {
    const {
        permissions,
        loading,
        initialized,
        hasPermission,
        canView,
        canEdit
    } = usePermissions();

    const {
        licenseStatus,
        isLicenseValid,
        getLicenseLevel
    } = useLicense();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div data-testid="initialized">{initialized ? 'true' : 'false'}</div>
            <div data-testid="permissions-count">{permissions.length}</div>
            <div data-testid="can-view">{canView() ? 'true' : 'false'}</div>
            <div data-testid="can-edit">{canEdit() ? 'true' : 'false'}</div>
            <div data-testid="license-valid">{isLicenseValid() ? 'true' : 'false'}</div>
            <div data-testid="license-level">{getLicenseLevel()}</div>
        </div>
    );
};

// Mock AuthContext
const MockAuthProvider = ({ children }) => {
    const mockUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
    };

    return (
        <AuthProvider>
            {children}
        </AuthProvider>
    );
};

describe('PermissionContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should provide permission context to children', async () => {
        render(
            <MockAuthProvider>
                <PermissionProvider>
                    <TestComponent />
                </PermissionProvider>
            </MockAuthProvider>
        );

        // Initially should show loading
        expect(screen.getByText('Loading...')).toBeInTheDocument();

        // Wait for initialization
        await waitFor(() => {
            expect(screen.getByTestId('initialized')).toHaveTextContent('true');
        });

        // Check that permissions are loaded
        expect(screen.getByTestId('permissions-count')).toHaveTextContent('1');
        expect(screen.getByTestId('can-view')).toHaveTextContent('true');
        expect(screen.getByTestId('can-edit')).toHaveTextContent('true');
    });

    it('should provide license context to children', async () => {
        render(
            <MockAuthProvider>
                <PermissionProvider>
                    <TestComponent />
                </PermissionProvider>
            </MockAuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('initialized')).toHaveTextContent('true');
        });

        // Check license information
        expect(screen.getByTestId('license-valid')).toHaveTextContent('true');
        expect(screen.getByTestId('license-level')).toHaveTextContent('basic');
    });

    it('should throw error when usePermissions is used outside provider', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            render(<TestComponent />);
        }).toThrow('usePermissions must be used within a PermissionProvider');

        consoleSpy.mockRestore();
    });

    it('should throw error when useLicense is used outside provider', () => {
        // Test component that only uses useLicense
        const LicenseTestComponent = () => {
            const { isLicenseValid } = useLicense();
            return <div>{isLicenseValid() ? 'valid' : 'invalid'}</div>;
        };

        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            render(<LicenseTestComponent />);
        }).toThrow('useLicense must be used within a PermissionProvider');

        consoleSpy.mockRestore();
    });
});