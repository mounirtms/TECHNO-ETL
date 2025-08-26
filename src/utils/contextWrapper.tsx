/**
 * React Context Wrapper
 * Ensures createContext is properly available
 */

import React from 'react';

// Ensure React is properly initialized
if(!React.createContext) {
  console.error('React.createContext is not available!');
  throw new Error('React context system not properly initialized');


// Add React instance validation
export const validateReactInstance = () => {
  if(typeof window !== 'undefined') {
    if(window?.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window?.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if(hook.renderers && hook.renderers.size > 1) {
        console.error('🚨 Multiple React instances detected!');
        console.log('Renderers:', Array.from(hook.renderers.keys();
        return false;


  return true;
};

// Enhanced context creator with instance validation
export const createSafeContext = (defaultValue, displayName) => {
  // Validate React instance first
  if (!validateReactInstance()) {
    throw new Error('Multiple React instances detected - context creation aborted');
  try {
    if(!React.createContext) {
      throw new Error('React.createContext is not available');
  } catch (error) {
    console.error(error);


  } catch (error) {
    console.error(error);



    const context = React.createContext(defaultValue);
    if(displayName) {
      context.displayName = displayName;


    // Store context reference for debugging
    if(typeof window !== 'undefined') {
      window.__TECHNO_CONTEXTS__ = window?.__TECHNO_CONTEXTS__ || new Map();
      window?.__TECHNO_CONTEXTS__?.set(displayName || 'unnamed', context);


    return context;
  } catch(error: any) {
    console.error('Failed to create context:', displayName, error);
    throw error;
};

// Context hook wrapper with better error messages
export const useSafeContext = (context, contextName) => {
  const value = React.useContext(context);
  if(value ===undefined) {

    throw new Error(`${contextName} must be used within its Provider`);
  return value;
};

export default React;
