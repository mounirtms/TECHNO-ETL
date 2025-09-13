/**
 * Verification script for the Permission System implementation
 * This script verifies that all components are properly integrated
 */

import PermissionService from '../services/PermissionService';
import LicenseManager from '../services/LicenseManager';

export const verifyPermissionSystem = async () => {
    const results = {
        success: true,
        errors: [],
        warnings: [],
        components: {}
    };

    try {
        // Test 1: Verify PermissionService exists and has required methods
        console.log('🔍 Testing PermissionService...');
        
        const requiredMethods = [
            'initialize',
            'hasPermission',
            'getPermissions',
            'checkFeatureAccess',
            'filterMenuItems',
            'canAccessMenuItem',
            'getPermissionSummary',
            'isAdmin',
            'canPerformBulkOperations',
            'refreshPermissions'
        ];

        for (const method of requiredMethods) {
            if (typeof PermissionService[method] !== 'function') {
                results.errors.push(`PermissionService.${method} is not a function`);
                results.success = false;
            }
        }

        results.components.PermissionService = {
            exists: true,
            methods: requiredMethods.filter(method => typeof PermissionService[method] === 'function')
        };

        // Test 2: Verify LicenseManager exists and has required methods
        console.log('🔍 Testing LicenseManager...');
        
        const requiredLicenseMethods = [
            'checkUserLicense',
            'validateFeatureAccess',
            'getLicenseLevel',
            'updateLicenseStatus',
            'listenToLicenseChanges'
        ];

        for (const method of requiredLicenseMethods) {
            if (typeof LicenseManager[method] !== 'function') {
                results.errors.push(`LicenseManager.${method} is not a function`);
                results.success = false;
            }
        }

        results.components.LicenseManager = {
            exists: true,
            methods: requiredLicenseMethods.filter(method => typeof LicenseManager[method] === 'function')
        };

        // Test 3: Test basic functionality without user (should handle gracefully)
        console.log('🔍 Testing basic functionality...');
        
        try {
            const hasPermission = PermissionService.hasPermission('view');
            results.components.basicFunctionality = {
                hasPermissionWithoutUser: hasPermission === false, // Should be false when no user
                noErrors: true
            };
        } catch (error) {
            results.errors.push(`Basic functionality test failed: ${error.message}`);
            results.success = false;
        }

        // Test 4: Verify context files exist
        console.log('🔍 Checking context files...');
        
        try {
            // These imports will throw if files don't exist
            const PermissionContext = await import('../contexts/PermissionContext.jsx');
            const usePermissionsHook = await import('../hooks/usePermissions.js');
            const useLicenseHook = await import('../hooks/useLicense.js');

            results.components.contexts = {
                PermissionContext: !!PermissionContext.PermissionProvider,
                usePermissions: !!usePermissionsHook.usePermissions,
                useLicense: !!useLicenseHook.useLicense
            };
        } catch (error) {
            results.errors.push(`Context files verification failed: ${error.message}`);
            results.success = false;
        }

        // Test 5: Verify AuthContext integration
        console.log('🔍 Checking AuthContext integration...');
        
        try {
            const AuthContext = await import('../contexts/AuthContext.jsx');
            const authContextHasMethods = AuthContext.useAuth !== undefined;
            
            results.components.authIntegration = {
                authContextExists: authContextHasMethods,
                integrated: true
            };
        } catch (error) {
            results.warnings.push(`AuthContext integration check failed: ${error.message}`);
        }

        console.log('✅ Permission System verification completed');
        
        return results;

    } catch (error) {
        results.success = false;
        results.errors.push(`Verification failed: ${error.message}`);
        return results;
    }
};

export const printVerificationResults = (results) => {
    console.log('\n📊 Permission System Verification Results');
    console.log('==========================================');
    
    if (results.success) {
        console.log('✅ Overall Status: SUCCESS');
    } else {
        console.log('❌ Overall Status: FAILED');
    }
    
    console.log('\n📋 Components Status:');
    Object.entries(results.components).forEach(([component, status]) => {
        console.log(`  ${component}:`, status);
    });
    
    if (results.errors.length > 0) {
        console.log('\n❌ Errors:');
        results.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (results.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        results.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    console.log('\n==========================================');
};

// Export for use in development
export default {
    verifyPermissionSystem,
    printVerificationResults
};