import { useContext, useCallback, useMemo } from 'react';
import { useLicense as useLicenseContext } from '../contexts/PermissionContext';

/**
 * Custom hook for license management
 * Provides convenient methods for checking license status and feature access
 */
export const useLicense = () => {
    const context = useLicenseContext();
    
    if (!context) {
        throw new Error('useLicense must be used within a PermissionProvider');
    }

    const {
        licenseStatus,
        checkFeatureAccess,
        refreshLicense,
        isLicenseValid,
        getLicenseLevel
    } = context;

    // Convenience methods for license checking
    const isBasic = useCallback(() => {
        return getLicenseLevel() === 'basic';
    }, [getLicenseLevel]);

    const isProfessional = useCallback(() => {
        return getLicenseLevel() === 'professional';
    }, [getLicenseLevel]);

    const isEnterprise = useCallback(() => {
        return getLicenseLevel() === 'enterprise';
    }, [getLicenseLevel]);

    const isAdmin = useCallback(() => {
        return getLicenseLevel() === 'admin';
    }, [getLicenseLevel]);

    // Check if license has specific feature
    const hasFeature = useCallback((featureId) => {
        if (!licenseStatus) return false;
        return licenseStatus.features?.includes(featureId) || false;
    }, [licenseStatus]);

    // Check if license is expired
    const isExpired = useCallback(() => {
        if (!licenseStatus?.expiryDate) return false;
        return new Date(licenseStatus.expiryDate) <= new Date();
    }, [licenseStatus]);

    // Get days until expiry
    const getDaysUntilExpiry = useCallback(() => {
        if (!licenseStatus?.expiryDate) return null;
        const expiryDate = new Date(licenseStatus.expiryDate);
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [licenseStatus]);

    // Check if license is expiring soon (within 30 days)
    const isExpiringSoon = useCallback(() => {
        const daysUntilExpiry = getDaysUntilExpiry();
        return daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
    }, [getDaysUntilExpiry]);

    // Get license type display name
    const getLicenseTypeName = useCallback(() => {
        if (!licenseStatus) return 'Unknown';
        
        const typeMap = {
            'free': 'Free',
            'basic': 'Basic',
            'professional': 'Professional',
            'enterprise': 'Enterprise',
            'admin': 'Administrator'
        };
        
        return typeMap[licenseStatus.licenseType] || 'Unknown';
    }, [licenseStatus]);

    // Check if user can access premium features
    const canAccessPremiumFeatures = useCallback(() => {
        const level = getLicenseLevel();
        return ['professional', 'enterprise', 'admin'].includes(level) && isLicenseValid();
    }, [getLicenseLevel, isLicenseValid]);

    // Check if user can access enterprise features
    const canAccessEnterpriseFeatures = useCallback(() => {
        const level = getLicenseLevel();
        return ['enterprise', 'admin'].includes(level) && isLicenseValid();
    }, [getLicenseLevel, isLicenseValid]);

    // Get license limitations
    const getLicenseLimitations = useCallback(() => {
        if (!licenseStatus) return {};
        
        return {
            maxUsers: licenseStatus.maxUsers,
            features: licenseStatus.features || [],
            supportLevel: licenseStatus.supportLevel || 'community',
            expiryDate: licenseStatus.expiryDate
        };
    }, [licenseStatus]);

    // Memoized license information
    const licenseInfo = useMemo(() => {
        if (!licenseStatus) return null;
        
        return {
            isValid: isLicenseValid(),
            level: getLicenseLevel(),
            typeName: getLicenseTypeName(),
            isExpired: isExpired(),
            isExpiringSoon: isExpiringSoon(),
            daysUntilExpiry: getDaysUntilExpiry(),
            limitations: getLicenseLimitations(),
            canAccessPremium: canAccessPremiumFeatures(),
            canAccessEnterprise: canAccessEnterpriseFeatures()
        };
    }, [
        licenseStatus,
        isLicenseValid,
        getLicenseLevel,
        getLicenseTypeName,
        isExpired,
        isExpiringSoon,
        getDaysUntilExpiry,
        getLicenseLimitations,
        canAccessPremiumFeatures,
        canAccessEnterpriseFeatures
    ]);

    return {
        // Raw license status
        licenseStatus,
        
        // License information
        licenseInfo,
        
        // Basic checks
        isLicenseValid,
        getLicenseLevel,
        getLicenseTypeName,
        
        // Level checks
        isBasic,
        isProfessional,
        isEnterprise,
        isAdmin,
        
        // Feature checks
        hasFeature,
        checkFeatureAccess,
        canAccessPremiumFeatures,
        canAccessEnterpriseFeatures,
        
        // Expiry checks
        isExpired,
        isExpiringSoon,
        getDaysUntilExpiry,
        
        // Limitations
        getLicenseLimitations,
        
        // Utility functions
        refreshLicense
    };
};

export default useLicense;