import { set_license_status } from './licenseUtils';

/**
 * Setup test license data for development
 * This function creates sample license data for testing purposes
 */
export const setupTestLicenses = async () => {
    try {
        console.log('Setting up test license data...');
        
        // Sample user IDs (replace with actual user IDs from your auth system)
        const testUsers = [
            {
                userId: 'magento-user', // For Magento users
                licenseData: {
                    isValid: true,
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
                    licenseType: 'premium',
                    features: ['dashboard', 'products', 'orders', 'customers', 'analytics']
                }
            },
            {
                userId: 'test@techno-dz.com', // For Google auth users
                licenseData: {
                    isValid: true,
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                    licenseType: 'trial',
                    features: ['dashboard', 'products']
                }
            }
        ];

        for (const user of testUsers) {
            const success = await set_license_status(user.userId, user.licenseData);
            if (success) {
                console.log(`✅ License set for user: ${user.userId}`);
            } else {
                console.log(`❌ Failed to set license for user: ${user.userId}`);
            }
        }

        console.log('✅ Test license setup completed!');
        return true;
    } catch (error) {
        console.error('❌ Error setting up test licenses:', error);
        return false;
    }
};

// Auto-run setup when this file is imported in development
if (import.meta.env.DEV) {
    console.log('Development mode detected. Setting up test licenses...');
    setupTestLicenses();
}
