import React from 'react';
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
export const check_license_status = async(userId) => {
    try {
        // Validate input
        if(!userId || typeof userId !== 'string') {
            console.warn('Invalid userId provided to check_license_status:', userId);
            return false;
        // For localhost development, always return true
        if(typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('🔓 Development mode: License check bypassed for localhost');
            return true;
        const sanitizedUserId = sanitizeKey(userId);
        const licenseRef = ref(database, `licenses/${sanitizedUserId}`);
        const snapshot = await get(licenseRef);

        if (snapshot.exists()) {
            const licenseData = snapshot.val();
            
            // Enhanced validation with better error handling
            const isValid = Boolean(licenseData.isValid);
            const expiryDate = licenseData.expiryDate ? new Date(licenseData.expiryDate) : null;
            const now = new Date();

            // Check expiry date validity
            const isNotExpired = !expiryDate || (expiryDate instanceof Date && !isNaN(expiryDate.getTime()) && expiryDate > now);
            
            // Additional license data validation
            const hasRequiredFields = licenseData.createdAt && licenseData.licenseType;
            
            if(isValid && isNotExpired && hasRequiredFields) {
                console.log('✅ Valid license found for user:', userId);
                return true;
            } else {
                console.log('❌ License validation failed:', {
                    isValid,
                    isNotExpired,
                    hasRequiredFields,
                    expiryDate: expiryDate?.toISOString()
                });
        } else {
            console.log('📄 No license found for user:', userId);
        return false;

    } catch(error: any) {
        console.error('❌ Error checking license status:', error);
        // For development, be more lenient with errors
        if(typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.warn('🔧 Development mode: Allowing access despite license check error');
            return true;
        return false;
};

/**
 * Set license status for a user (for admin/testing purposes)
 * @param {string} userId - The user ID
 * @param {object} licenseData - License data including isValid, expiryDate, etc.
 * @returns {Promise<boolean>} - Returns true if successfully set
 */
export const set_license_status = async (userId: string, licenseData: any) => {
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
    } catch(error: any) {
        console.error('Error setting license status:', error);
        return false;
};

/**
 * Get license details for a user
 * @param {string} userId - The user ID
 * @returns {Promise<object|null>} - Returns license data or null
 */
export const get_license_details = async(userId: string) => {
    try {
        const sanitizedUserId = sanitizeKey(userId);
        const licenseRef = ref(database, `licenses/${sanitizedUserId}`);
        const snapshot = await get(licenseRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        return null;
    } catch(error: any) {
        console.error('Error getting license details:', error);
        return null;
};
