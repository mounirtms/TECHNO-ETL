/**
 * Standardized Error Handling Utilities
 * Provides consistent error handling across all components
 * 
 * @author Mounir Abderrahmani
 * @email mounir.ab@techno-dz.com
 * @contact mounir.webdev.tms@gmail.com
 */

import { toast } from 'react-toastify';

// Error types for categorization
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Categorize error based on status code and message
 */
export const categorizeError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  const status = error.status || error.response?.status;
  const message = error.message?.toLowerCase() || '';
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || !status) {
    return ERROR_TYPES.NETWORK;
  }
  
  // HTTP status code categorization
  switch (status) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      if (status >= 400 && status < 500) return ERROR_TYPES.CLIENT;
      if (status >= 500) return ERROR_TYPES.SERVER;
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Get error severity based on type and context
 */
export const getErrorSeverity = (errorType, context = {}) => {
  switch (errorType) {
    case ERROR_TYPES.AUTHENTICATION:
    case ERROR_TYPES.AUTHORIZATION:
      return ERROR_SEVERITY.HIGH;
    case ERROR_TYPES.SERVER:
      return ERROR_SEVERITY.CRITICAL;
    case ERROR_TYPES.NETWORK:
      return ERROR_SEVERITY.MEDIUM;
    case ERROR_TYPES.VALIDATION:
      return ERROR_SEVERITY.LOW;
    case ERROR_TYPES.NOT_FOUND:
      return context.critical ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.MEDIUM;
    default:
      return ERROR_SEVERITY.MEDIUM;
  }
};

/**
 * Generate user-friendly error message
 */
export const getUserFriendlyMessage = (error, context = {}) => {
  const errorType = categorizeError(error);
  const componentName = context.componentName || 'Component';
  
  const messages = {
    [ERROR_TYPES.NETWORK]: 'Unable to connect to the server. Please check your internet connection and try again.',
    [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
    [ERROR_TYPES.AUTHENTICATION]: 'Your session has expired. Please log in again.',
    [ERROR_TYPES.AUTHORIZATION]: 'You do not have permission to perform this action.',
    [ERROR_TYPES.NOT_FOUND]: `The requested ${context.resource || 'resource'} was not found.`,
    [ERROR_TYPES.SERVER]: 'A server error occurred. Our team has been notified. Please try again later.',
    [ERROR_TYPES.CLIENT]: 'An error occurred while processing your request. Please try again.',
    [ERROR_TYPES.UNKNOWN]: `An unexpected error occurred in ${componentName}. Please refresh the page and try again.`
  };
  
  return messages[errorType] || messages[ERROR_TYPES.UNKNOWN];
};

/**
 * Log error with context for debugging
 */
export const logError = (error, context = {}) => {
  const errorType = categorizeError(error);
  const severity = getErrorSeverity(errorType, context);
  
  const logData = {
    timestamp: new Date().toISOString(),
    type: errorType,
    severity,
    message: error.message,
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  // Console logging with appropriate level
  switch (severity) {
    case ERROR_SEVERITY.CRITICAL:
      console.error('🚨 CRITICAL ERROR:', logData);
      break;
    case ERROR_SEVERITY.HIGH:
      console.error('🔴 HIGH SEVERITY ERROR:', logData);
      break;
    case ERROR_SEVERITY.MEDIUM:
      console.warn('🟡 MEDIUM SEVERITY ERROR:', logData);
      break;
    case ERROR_SEVERITY.LOW:
      console.info('🔵 LOW SEVERITY ERROR:', logData);
      break;
    default:
      console.log('📝 ERROR LOG:', logData);
  }
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }
  
  return logData;
};

/**
 * Handle error with user notification
 */
export const handleError = (error, context = {}) => {
  const logData = logError(error, context);
  const userMessage = getUserFriendlyMessage(error, context);
  
  // Show user notification based on severity
  switch (logData.severity) {
    case ERROR_SEVERITY.CRITICAL:
    case ERROR_SEVERITY.HIGH:
      toast.error(userMessage, {
        autoClose: 8000,
        hideProgressBar: false
      });
      break;
    case ERROR_SEVERITY.MEDIUM:
      toast.warn(userMessage, {
        autoClose: 5000
      });
      break;
    case ERROR_SEVERITY.LOW:
      toast.info(userMessage, {
        autoClose: 3000
      });
      break;
    default:
      toast(userMessage);
  }
  
  return {
    type: logData.type,
    severity: logData.severity,
    message: userMessage,
    originalError: error
  };
};

/**
 * Create error handler for specific component
 */
export const createErrorHandler = (componentName, defaultContext = {}) => {
  return (error, additionalContext = {}) => {
    const context = {
      componentName,
      ...defaultContext,
      ...additionalContext
    };
    
    return handleError(error, context);
  };
};

/**
 * Async wrapper with error handling
 */
export const withErrorHandling = async (asyncFn, context = {}) => {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, context);
    throw error; // Re-throw for component-level handling
  }
};

/**
 * React hook for error handling
 */
export const useErrorHandler = (componentName) => {
  const handleComponentError = createErrorHandler(componentName);
  
  return {
    handleError: handleComponentError,
    withErrorHandling: (asyncFn, additionalContext = {}) => 
      withErrorHandling(asyncFn, { componentName, ...additionalContext })
  };
};

/**
 * Default fallback data generators
 */
export const getFallbackData = (dataType) => {
  const fallbacks = {
    list: [],
    object: {},
    string: '',
    number: 0,
    boolean: false,
    roadmap: {
      in_progress: [],
      approved: [],
      completed: [],
      rejected: [],
      on_hold: []
    },
    voting: {
      features: [],
      totalVotes: 0,
      userVotes: []
    },
    bugs: {
      bugs: [],
      stats: { totalBugs: 0, totalRewards: 0 },
      leaderboard: []
    }
  };
  
  return fallbacks[dataType] || null;
};

export default {
  ERROR_TYPES,
  ERROR_SEVERITY,
  categorizeError,
  getErrorSeverity,
  getUserFriendlyMessage,
  logError,
  handleError,
  createErrorHandler,
  withErrorHandling,
  useErrorHandler,
  getFallbackData
};
