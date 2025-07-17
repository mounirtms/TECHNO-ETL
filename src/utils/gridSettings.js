// src/utils/gridSettings.js

/**
 * Saves the grid settings for a specific grid to local storage.
 * @param {string} gridName - The unique identifier for the grid.
 * @param {object} settings - The settings object to save.
 */
export const saveGridSettings = (gridName, settings) => {
    try {
        const serializedSettings = JSON.stringify(settings);
        localStorage.setItem(`gridSettings_${gridName}`, serializedSettings);
    } catch (error) {
        console.error(`Error saving grid settings for ${gridName}:`, error);
    }
};

/**
 * Loads the grid settings for a specific grid from local storage.
 * @param {string} gridName - The unique identifier for the grid.
 * @returns {object|null} The loaded settings object, or null if not found or on error.
 */
export const loadGridSettings = (gridName) => {
    try {
        const serializedSettings = localStorage.getItem(`gridSettings_${gridName}`);
        if (serializedSettings === null) {
            return null;
        }
        return JSON.parse(serializedSettings);
    } catch (error) {
        console.error(`Error loading grid settings for ${gridName}:`, error);
        return null;
    }
};