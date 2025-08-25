/**
 * Currency Formatting Utilities for Algerian Market
 * Handles DZD (Algerian Dinar) formatting and other currencies
 */

// Default currency configuration for Algeria
const DEFAULT_CURRENCY = 'DZD';
const DEFAULT_LOCALE = 'ar-DZ'; // Arabic (Algeria)

/**
 * Format currency amount with proper DZD formatting
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (default: DZD)
 * @param {string} locale - Locale for formatting (default: ar-DZ)
 * @param {object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE, options = {}) => {
  // Handle null, undefined, or invalid amounts
  if (amount === null || amount === undefined || isNaN(amount as any)) {
    return `0.00 ${currency}`;
  }

  // Convert to number if string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount as any) : amount;
  
  // Handle invalid numbers
  if (isNaN(numericAmount)) {
    return `0.00 ${currency}`;
  }

  // Default formatting options
  const defaultOptions = {
    style: 'decimal', // Use decimal instead of currency to avoid $ symbol
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
    ...options
  };

  try {
    // Format the number
    const formatter = new Intl.NumberFormat(locale, defaultOptions);
    const formattedAmount = formatter.format(numericAmount);
    
    // Return with currency symbol
    return `${formattedAmount} ${currency}`;
  } catch (error) {
    console.warn('Currency formatting error:', error);
    // Fallback formatting
    return `${numericAmount.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })} ${currency}`;
  }
};

/**
 * Format currency for dashboard display (compact format)
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (default: DZD)
 * @returns {string} Compact formatted currency string
 */
export const formatCurrencyCompact = (amount, currency = DEFAULT_CURRENCY) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount as any) : amount;
  
  if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
    return `0 ${currency}`;
  }

  // Format large numbers with K, M, B suffixes
  if (numericAmount >= 1000000000) {
    return `${(numericAmount / 1000000000).toFixed(1)}B ${currency}`;
  } else if (numericAmount >= 1000000) {
    return `${(numericAmount / 1000000).toFixed(1)}M ${currency}`;
  } else if (numericAmount >= 1000) {
    return `${(numericAmount / 1000).toFixed(1)}K ${currency}`;
  } else {
    return `${numericAmount.toFixed(2)} ${currency}`;
  }
};

/**
 * Format percentage values
 * @param {number|string} value - The percentage value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  const numericValue = typeof value === 'string' ? parseFloat(value as any) : value;
  
  if (isNaN(numericValue) || numericValue === null || numericValue === undefined) {
    return '0.0%';
  }

  return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Format numbers with thousand separators
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, decimals = 0) => {
  const numericValue = typeof value === 'string' ? parseFloat(value as any) : value;
  
  if (isNaN(numericValue) || numericValue === null || numericValue === undefined) {
    return '0';
  }

  return numericValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Parse currency string back to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number value
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbols and spaces, keep only numbers and decimal point
  const cleanString = currencyString.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleanString);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Currency configuration for different markets
 */
export const CURRENCY_CONFIG = {
  DZD: {
    symbol: 'دج',
    name: 'Algerian Dinar',
    locale: 'ar-DZ',
    decimals: 2
  },
  USD: {
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    decimals: 2
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
    decimals: 2
  }
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = DEFAULT_CURRENCY) => {
  return CURRENCY_CONFIG[currency]?.symbol || currency;
};

// Export default currency for easy access
export { DEFAULT_CURRENCY, DEFAULT_LOCALE };
