import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';

export const saveUserSettings = async (userId, settings) => {
    try {
        const userRef = ref(database, `users/${userId}/settings`);
        await set(userRef, settings);
        return true;
    } catch (error) {
        console.error('Error saving user settings:', error);
        return false;
    }
};

export const getUserSettings = async (userId) => {
    try {
        const userRef = ref(database, `users/${userId}/settings`);
        const snapshot = await get(userRef);
        return snapshot.val() || {};
    } catch (error) {
        console.error('Error getting user settings:', error);
        return {};
    }
};

export const defaultUserSettings = {
    language: 'en',
    theme: 'light',
    notifications: true,
    profile: {
        name: '',
        email: '',
        phone: '',
        position: '',
        avatar: '/src/resources/imgs/customer01.jpg',
    }
};
