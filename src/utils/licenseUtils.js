import { database } from '../config/firebase';
import { ref, get, set } from 'firebase/database';

/**
 * Sanitize user ID to be used as Firebase key
 * Firebase keys cannot contain: . # $ [ ]
 * @param {string} userId - The user ID to sanitize
 * @returns {string} - Sanitized user ID
 */
const sanitizeKey = (userId) => {
    return userId.replace(/[.#$\[\]]/g, '_');
};

/**
 * Check_license_status - Function to check if a user has a valid license
 * @param {string} userId - The user ID whose license status needs to be verified.
 * @returns {Promise<boolean>} - Returns true if the user has a valid license, false otherwise.
 */
export const check_license_status = async (userId) => {
    try {
        const sanitizedUserId = sanitizeKey(userId);
        const licenseRef = ref(database, `licenses/${sanitizedUserId}`);
        const snapshot = await get(licenseRef);

        if (snapshot.exists()) {
            const licenseData = snapshot.val();
            // Check if license is valid and not expired
            const isValid = licenseData.isValid;
            const expiryDate = licenseData.expiryDate ? new Date(licenseData.expiryDate) : null;
            const now = new Date();

            if (isValid && (!expiryDate || expiryDate > now)) {
                return true;
            }
        }
        return false;

    } catch (error) {
        console.error('Error checking license status:', error);
        return false;
    }
};

/**
 * Set license status for a user (for admin/testing purposes)
 * @param {string} userId - The user ID
 * @param {object} licenseData - License data including isValid, expiryDate, etc.
 * @returns {Promise<boolean>} - Returns true if successfully set
 */
export const set_license_status = async (userId, licenseData) => {
    try {
        const sanitizedUserId = sanitizeKey(userId);
        const licenseRef = ref(database, `licenses/${sanitizedUserId}`);
        await set(licenseRef, {
            isValid: licenseData.isValid || false,
            expiryDate: licenseData.expiryDate || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            licenseType: licenseData.licenseType || 'standard',
            ...licenseData
        });
        return true;
    } catch (error) {
        console.error('Error setting license status:', error);
        return false;
    }
};

/**
 * Get license details for a user
 * @param {string} userId - The user ID
 * @returns {Promise<object|null>} - Returns license data or null
 */
export const get_license_details = async (userId) => {
    try {
        const sanitizedUserId = sanitizeKey(userId);
        const licenseRef = ref(database, `licenses/${sanitizedUserId}`);
        const snapshot = await get(licenseRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error('Error getting license details:', error);
        return null;
    }
};
