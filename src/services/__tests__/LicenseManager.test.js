/**
 * Unit tests for LicenseManager service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import LicenseManager from '../LicenseManager';
import { USER_ROLES, LICENSE_TYPES } from '../../config/firebaseDefaults';

// Mock Firebase
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

// Import mocked functions
import { ref, get, set, onValue, off } from 'firebase/database';

describe('LicenseManager', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Clear cache
    LicenseManager.cache.clear();
    LicenseManager.listeners.clear();
  });

  afterEach(() => {
    LicenseManager.cleanup();
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
  });

  describe('checkUserLicense', () => {
    it('should return cached license status if available and fresh', async () => {
      const userId = 'testuser';
      const cachedData = {
        isValid: true,
        level: 'professional',
        features: ['feature1', 'feature2'],
      };

      // Set cache
      LicenseManager.cache.set(`license_${userId}`, {
        data: cachedData,
        timestamp: Date.now(),
      });

      const result = await LicenseManager.checkUserLicense(userId);

      expect(result).toEqual(cachedData);
      expect(get).not.toHaveBeenCalled();
    });

    it('should fetch from Firebase if cache is stale', async () => {
      const userId = 'testuser';
      const licenseData = {
        isValid: true,
        licenseType: 'professional',
        features: ['feature1'],
        expiryDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      };

      const userData = {
        role: USER_ROLES.USER,
        email: 'test@example.com',
      };

      // Set stale cache
      LicenseManager.cache.set(`license_${userId}`, {
        data: { isValid: false },
        timestamp: Date.now() - (10 * 60 * 1000), // 10 minutes ago
      });

      // Mock Firebase responses
      get.mockImplementation(() => {
        return Promise.resolve({
          exists: () => true,
          val: () => licenseData,
        });
      });

      // Mock ref to return different values based on path
      ref.mockImplementation((db, path) => ({ path }));

      const result = await LicenseManager.checkUserLicense(userId);

      expect(result.isValid).toBe(true);
      expect(result.level).toBe('professional');
      expect(result.features).toEqual(['feature1']);
    });

    it('should create default license if none exists', async () => {
      const userId = 'newuser';
      const userData = {
        role: USER_ROLES.USER,
        email: 'newuser@example.com',
      };

      // Mock Firebase responses - no license exists
      get.mockImplementation((ref) => {
        if (ref.toString().includes('licenses')) {
          return Promise.resolve({
            exists: () => false,
            val: () => null,
          });
        } else if (ref.toString().includes('users')) {
          return Promise.resolve({
            exists: () => true,
            val: () => userData,
          });
        }
      });

      set.mockResolvedValue();

      const result = await LicenseManager.checkUserLicense(userId);

      expect(result.isValid).toBe(true);
      expect(result.level).toBe('basic');
      expect(result.licenseType).toBe('free');
      expect(set).toHaveBeenCalledTimes(1);
    });

    it('should handle expired licenses', async () => {
      const userId = 'expireduser';
      const licenseData = {
        isValid: true,
        licenseType: 'professional',
        features: ['feature1'],
        expiryDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      };

      const userData = {
        role: USER_ROLES.USER,
        email: 'expired@example.com',
      };

      get.mockImplementation((ref) => {
        if (ref.toString().includes('licenses')) {
          return Promise.resolve({
            exists: () => true,
            val: () => licenseData,
          });
        } else if (ref.toString().includes('users')) {
          return Promise.resolve({
            exists: () => true,
            val: () => userData,
          });
        }
      });

      const result = await LicenseManager.checkUserLicense(userId);

      expect(result.isValid).toBe(false);
      expect(result.level).toBe('professional');
    });

    it('should return admin level for admin users', async () => {
      const userId = 'adminuser';
      const licenseData = {
        isValid: true,
        licenseType: 'basic',
        features: ['feature1'],
      };

      const userData = {
        role: USER_ROLES.ADMIN,
        email: 'admin@example.com',
      };

      get.mockImplementation((ref) => {
        if (ref.toString().includes('licenses')) {
          return Promise.resolve({
            exists: () => true,
            val: () => licenseData,
          });
        } else if (ref.toString().includes('users')) {
          return Promise.resolve({
            exists: () => true,
            val: () => userData,
          });
        }
      });

      const result = await LicenseManager.checkUserLicense(userId);

      expect(result.level).toBe('admin');
      expect(result.role).toBe(USER_ROLES.ADMIN);
    });

    it('should handle errors gracefully', async () => {
      const userId = 'erroruser';

      get.mockRejectedValue(new Error('Firebase error'));

      const result = await LicenseManager.checkUserLicense(userId);

      expect(result.isValid).toBe(false);
      expect(result.level).toBe('basic');
      expect(result.features).toEqual([]);
    });
  });

  describe('validateFeatureAccess', () => {
    it('should allow access for admin users', async () => {
      const userId = 'adminuser';

      // Mock checkUserLicense to return admin status
      vi.spyOn(LicenseManager, 'checkUserLicense').mockResolvedValue({
        isValid: true,
        role: USER_ROLES.ADMIN,
        features: [],
      });

      const result = await LicenseManager.validateFeatureAccess('any_feature', userId);

      expect(result).toBe(true);
    });

    it('should check feature list for regular users', async () => {
      const userId = 'regularuser';

      vi.spyOn(LicenseManager, 'checkUserLicense').mockResolvedValue({
        isValid: true,
        role: USER_ROLES.USER,
        features: ['feature1', 'feature2'],
      });

      const result1 = await LicenseManager.validateFeatureAccess('feature1', userId);

      expect(result1).toBe(true);

      const result2 = await LicenseManager.validateFeatureAccess('feature3', userId);

      expect(result2).toBe(false);
    });

    it('should deny access for invalid licenses', async () => {
      const userId = 'invaliduser';

      vi.spyOn(LicenseManager, 'checkUserLicense').mockResolvedValue({
        isValid: false,
        role: USER_ROLES.USER,
        features: ['feature1'],
      });

      const result = await LicenseManager.validateFeatureAccess('feature1', userId);

      expect(result).toBe(false);
    });
  });

  describe('updateLicenseStatus', () => {
    it('should update license status in Firebase', async () => {
      const userId = 'testuser';
      const newLicense = {
        isValid: true,
        licenseType: 'professional',
        features: ['new_feature'],
      };

      const currentLicense = {
        isValid: false,
        licenseType: 'basic',
        createdAt: '2023-01-01T00:00:00.000Z',
      };

      get.mockResolvedValue({
        exists: () => true,
        val: () => currentLicense,
      });

      set.mockResolvedValue();

      await LicenseManager.updateLicenseStatus(userId, newLicense);

      expect(set).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...currentLicense,
          ...newLicense,
          updatedBy: 'system',
        }),
      );

      // Check that cache was cleared
      expect(LicenseManager.cache.has(`license_${userId}`)).toBe(false);
    });

    it('should handle Firebase errors', async () => {
      const userId = 'erroruser';
      const newLicense = { isValid: true };

      get.mockRejectedValue(new Error('Firebase error'));

      await expect(LicenseManager.updateLicenseStatus(userId, newLicense))
        .rejects.toThrow('Firebase error');
    });
  });

  describe('listenToLicenseChanges', () => {
    it('should set up Firebase listener and return unsubscribe function', () => {
      const userId = 'testuser';
      const callback = vi.fn();

      onValue.mockImplementation((ref, listener) => {
        // Simulate immediate callback
        listener({
          exists: () => true,
          val: () => ({ isValid: true }),
        });
      });

      const unsubscribe = LicenseManager.listenToLicenseChanges(userId, callback);

      expect(onValue).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({ isValid: true });
      expect(typeof unsubscribe).toBe('function');

      // Test unsubscribe
      unsubscribe();
      expect(off).toHaveBeenCalled();
    });
  });

  describe('determineLicenseLevel', () => {
    it('should return admin for admin roles', () => {
      const licenseData = { licenseType: 'basic' };
      const result = LicenseManager.determineLicenseLevel(licenseData, USER_ROLES.ADMIN);

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
  });

  describe('getAllUsersWithLicenses', () => {
    it('should return all users with their license status', async () => {
      const usersData = {
        'user1': { email: 'user1@example.com', role: USER_ROLES.USER },
        'user2': { email: 'user2@example.com', role: USER_ROLES.ADMIN },
      };

      const licensesData = {
        'user1': { isValid: true, licenseType: 'basic' },
        'user2': { isValid: true, licenseType: 'enterprise' },
      };

      get.mockImplementation((ref) => {
        if (ref.toString().includes('users')) {
          return Promise.resolve({
            exists: () => true,
            val: () => usersData,
          });
        } else if (ref.toString().includes('licenses')) {
          return Promise.resolve({
            exists: () => true,
            val: () => licensesData,
          });
        }
      });

      // Mock checkUserLicense for each user
      vi.spyOn(LicenseManager, 'checkUserLicense')
        .mockImplementation((userId) => {
          return Promise.resolve({
            isValid: true,
            level: userId === 'user2' ? 'admin' : 'basic',
            role: usersData[userId].role,
          });
        });

      const result = await LicenseManager.getAllUsersWithLicenses();

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe('user1');
      expect(result[1].userId).toBe('user2');
      expect(result[1].licenseStatus.level).toBe('admin');
    });
  });
});
