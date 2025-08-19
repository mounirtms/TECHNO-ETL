/**
 * Format a number as currency
 * @param {number} value - The value to format
 * @param {string} [currency='USD'] - The currency code
 * @returns {string} The formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(value);
};

/**
 * Format a date string to localized date time
 * @param {string} dateString - The date string to format
 * @returns {string} The formatted date string
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
};

/**
 * Format a number with thousand separators
 * @param {number} value - The value to format
 * @returns {string} The formatted number string
 */
export const formatNumber = (value) => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-US').format(value);
};
