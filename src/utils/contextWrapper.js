/**
 * React Context Wrapper
 * Ensures createContext is properly available
 */

import React from 'react';

// Add React instance validation - optimized to reduce console noise
export const validateReactInstance = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

      if (hook.renderers && hook.renderers.size > 1) {
        console.error('🚨 Multiple React instances detected!');
        return false;
      }
    }
  }

  return true;
};

// Enhanced context creator with instance validation
export const createSafeContext = (defaultValue, displayName) => {
  // Validate React instance first
  if (!validateReactInstance()) {
    throw new Error('Multiple React instances detected - context creation aborted');
  }

  try {
    const context = React.createContext(defaultValue);

    if (displayName) {
      context.displayName = displayName;
    }

    // Store context reference for debugging only in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      window.__TECHNO_CONTEXTS__ = window.__TECHNO_CONTEXTS__ || new Map();
      window.__TECHNO_CONTEXTS__.set(displayName || 'unnamed', context);
    }

    return context;
  } catch (error) {
    console.error('Failed to create context:', displayName, error);
    throw error;
  }
};

// Context hook wrapper with better error messages
export const useSafeContext = (context, contextName) => {
  if (!context) {
    throw new Error(`Invalid context provided to useSafeContext: ${contextName}`);
  }
  
  const value = React.useContext(context);

  if (value === undefined) {
    throw new Error(`${contextName} must be used within its Provider`);
  }

  return value;
};

// Helper to clean up context references
export const cleanupContextReferences = () => {
  if (typeof window !== 'undefined' && window.__TECHNO_CONTEXTS__) {
    window.__TECHNO_CONTEXTS__.clear();
  }
};

export default React;
