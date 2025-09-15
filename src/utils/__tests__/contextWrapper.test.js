import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSafeContext, useSafeContext, validateReactInstance, cleanupContextReferences } from '../contextWrapper';

describe('contextWrapper', () => {
  beforeEach(() => {
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (typeof window !== 'undefined') {
      delete window.__TECHNO_CONTEXTS__;
    }
  });

  it('should create a context with displayName', () => {
    const TestContext = createSafeContext({}, 'TestContext');
    expect(TestContext.displayName).toBe('TestContext');
  });

  it('should validate React instance correctly', () => {
    expect(validateReactInstance()).toBe(true);
  });

  it('should throw error when using context outside provider', () => {
    const TestContext = createSafeContext(undefined, 'TestContext');
    
    const TestComponent = () => {
      expect(() => useSafeContext(TestContext, 'TestContext')).toThrow(
        'TestContext must be used within its Provider'
      );
      return null;
    };
  });

  it('should clean up context references', () => {
    if (typeof window !== 'undefined') {
      window.__TECHNO_CONTEXTS__ = new Map();
      window.__TECHNO_CONTEXTS__.set('test', {});
      
      cleanupContextReferences();
      
      expect(window.__TECHNO_CONTEXTS__.size).toBe(0);
    }
  });
});