/**
 * Simplified unit tests for LicenseManager service
 * Focuses on core functionality without complex Firebase mocking
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { USER_ROLES } from '../../config/firebaseDefaults';

// Mock Firebase completely
vi.mock('../../config/firebase', () => ({
  database: {},
}));

vi.mock('firebase/database', () => ({
  ref: vi.fn(() => ({})),
  get: vi.fn(),
  set: vi.fn(),
  onValue: vi.fn(),
  off: vi.fn(),
}));

describe('LicenseManager Core Functionality', () => {
  let LicenseManager;

  beforeEach(async () => {
    // Import after mocking
    const module = await import('../LicenseManager');

    LicenseManager = module.default;

    // Clear cache
    LicenseManager.cache.clear();
    LicenseManager.listeners.clear();
  });

  describe('sanitizeUserId', () => {
    it('should sanitize user ID for Firebase keys', () => {
      const userId = 'user.test#123$[array]';
      const sanitized = LicenseManager.sanitizeUserId(userId);

      expect(sanitized).toBe('user_test_123__array_');
    });

    it('should handle normal user IDs without changes', () => {
      const userId = 'normaluser123';
      const sanitized = LicenseManager.sanitizeUserId(userId);

      expect(sanitized).toBe('normaluser123');
    });

    it('should handle empty string', () => {
      const sanitized = LicenseManager.sanitizeUserId('');

      expect(sanitized).toBe('');
    });
  });

  describe('determineLicenseLevel', () => {
    it('should return admin for admin roles', () => {
      const licenseData = { licenseType: 'basic' };
      const result = LicenseManager.determineLicenseLevel(licenseData, USER_ROLES.ADMIN);

      expect(result).toBe('admin');
    });

    it('should return admin for super admin roles', () => {
      const licenseData = { licenseType: 'basic' };
      const result = LicenseManager.determineLicenseLevel(licenseData, USER_ROLES.SUPER_ADMIN);

      expect(result).toBe('admin');
    });

    it('should map license types correctly', () => {
      const testCases = [
        { licenseType: 'free', expected: 'basic' },
        { licenseType: 'basic', expected: 'basic' },
        { licenseType: 'professional', expected: 'professional' },
        { licenseType: 'enterprise', expected: 'enterprise' },
      ];

      testCases.forEach(({ licenseType, expected }) => {
        const result = LicenseManager.determineLicenseLevel(
          { licenseType },
          USER_ROLES.USER,
        );

        expect(result).toBe(expected);
      });
    });

    it('should default to basic for unknown license types', () => {
      const result = LicenseManager.determineLicenseLevel(
        { licenseType: 'unknown' },
        USER_ROLES.USER,
      );

      expect(result).toBe('basic');
    });

    it('should handle missing license type', () => {
      const result = LicenseManager.determineLicenseLevel(
        {},
        USER_ROLES.USER,
      );

      expect(result).toBe('basic');
    });
  });

  describe('extractPermissions', () => {
    it('should extract basic permissions for user role', () => {
      const licenseData = {};
      const userData = { role: USER_ROLES.USER };

      const permissions = LicenseManager.extractPermissions(licenseData, userData);

      expect(permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ resource: '*', actions: ['view'] }),
          expect.objectContaining({ resource: '*', actions: ['view', 'edit'] }),
        ]),
      );
    });

    it('should extract manager permissions', () => {
      const licenseData = {};
      const userData = { role: USER_ROLES.MANAGER };

      const permissions = LicenseManager.extractPermissions(licenseData, userData);

      expect(permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ resource: '*', actions: ['view'] }),
          expect.objectContaining({ resource: '*', actions: ['view', 'edit'] }),
          expect.objectContaining({ resource: '*', actions: ['view', 'edit', 'delete'] }),
        ]),
      );
    });

    it('should extract admin permissions', () => {
      const licenseData = {};
      const userData = { role: USER_ROLES.ADMIN };

      const permissions = LicenseManager.extractPermissions(licenseData, userData);

      expect(permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ resource: '*', actions: ['view', 'edit', 'delete', 'add'] }),
        ]),
      );
    });

    it('should handle program permissions', () => {
      const licenseData = {
        programPermissions: {
          'test_program': {
            enabled: true,
            permissions: {
              'read': true,
              'write': false,
            },
          },
        },
      };
      const userData = { role: USER_ROLES.USER };

      const permissions = LicenseManager.extractPermissions(licenseData, userData);

      expect(permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            resource: 'test_program',
            actions: ['read'],
            conditions: { licenseRequired: true },
          }),
        ]),
      );
    });

    it('should handle missing user data', () => {
      const licenseData = {};
      const userData = null;

      const permissions = LicenseManager.extractPermissions(licenseData, userData);

      expect(permissions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ resource: '*', actions: ['view'] }),
        ]),
      );
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      LicenseManager.cache.set('test', 'value');
      expect(LicenseManager.cache.size).toBe(1);

      LicenseManager.cleanup();
      expect(LicenseManager.cache.size).toBe(0);
    });

    it('should clear listeners', () => {
      LicenseManager.listeners.set('test', { ref: {}, listener: vi.fn() });
      expect(LicenseManager.listeners.size).toBe(1);

      LicenseManager.cleanup();
      expect(LicenseManager.listeners.size).toBe(0);
    });
  });
});
