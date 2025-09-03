
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { toast } from 'react-toastify';

// Mock services
vi.mock('../../services/magentoService', () => ({
  default: {
    login: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('../../services/firebaseSyncService', () => ({
  default: {
    syncUserOnLogin: vi.fn(),
  },
}));

vi.mock('../../services/LicenseManager', () => ({
  default: {
    checkUserLicense: vi.fn().mockResolvedValue({ isValid: true }),
    validateFeatureAccess: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../../services/PermissionService', () => ({
  default: {
    initialize: vi.fn(),
    getPermissions: vi.fn().mockResolvedValue([]),
    hasPermission: vi.fn().mockReturnValue(true),
  },
}));

// Mock Firebase
vi.mock('../../config/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
  },
  database: {},
}));

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

const TestComponent = () => {
  const auth = useAuth();

  return (
    <div>
      <div data-testid="loading">{auth.loading ? 'Loading...' : 'Loaded'}</div>
      <div data-testid="currentUser">{auth.currentUser ? auth.currentUser.email : 'No User'}</div>
      <button onClick={auth.signInWithGoogle}>Sign In Google</button>
      <button onClick={() => auth.signInWithMagento('test', 'password')}>Sign In Magento</button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock onAuthStateChanged to immediately call back with no user
    const { onAuthStateChanged } = require('firebase/auth');

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);

      return vi.fn(); // return unsubscribe function
    });
  });

  it('should provide loading state and no user initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
    expect(screen.getByTestId('currentUser')).toHaveTextContent('No User');
  });

  it('should handle Google sign-in', async () => {
    const { signInWithPopup } = require('firebase/auth');
    const user = { uid: 'google-user', email: 'google@example.com', displayName: 'Google User' };

    signInWithPopup.mockResolvedValue({ user });

    const { onAuthStateChanged } = require('firebase/auth');

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(user);

      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const signInButton = screen.getByText('Sign In Google');

    await act(async () => {
      signInButton.click();
    });

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });

  it('should handle Magento sign-in', async () => {
    const magentoApi = require('../../services/magentoService').default;

    magentoApi.login.mockResolvedValue('magento-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    const signInButton = screen.getByText('Sign In Magento');

    await act(async () => {
      signInButton.click();
    });

    await waitFor(() => {
      expect(magentoApi.login).toHaveBeenCalledWith('test', 'password');
      expect(screen.getByTestId('currentUser')).toHaveTextContent('test');
      expect(toast.success).toHaveBeenCalledWith('Successfully logged in!');
    });
  });

  it('should handle logout', async () => {
    // Mock a logged-in user
    const { onAuthStateChanged } = require('firebase/auth');
    const user = { uid: 'test-user', email: 'test@example.com', displayName: 'Test User' };

    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(user);

      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('currentUser')).toHaveTextContent('test@example.com');
    });

    const logoutButton = screen.getByText('Logout');
    const { signOut } = require('firebase/auth');

    signOut.mockResolvedValue();

    await act(async () => {
      logoutButton.click();
    });

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Successfully logged out');
    });
  });
});
