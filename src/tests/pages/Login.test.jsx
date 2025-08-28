/**
 * Login Page Tests
 * 
 * Comprehensive tests for the Login page
 * Tests authentication, form validation, and user flows
 * 
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Login from '../../pages/Login';

// Mock dependencies
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn()
  };
});

vi.mock('../../services/authApi', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    validateToken: vi.fn(),
    refreshToken: vi.fn()
  }
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  }
}));

// Test utilities
const theme = createTheme();

const renderLogin = (props = {}) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Login {...props} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

// Mock data
const validCredentials = {
  email: 'test@techno-dz.com',
  password: 'TestPassword123!'
};

const invalidCredentials = {
  email: 'invalid@email.com',
  password: 'wrongpassword'
};

const mockUser = {
  id: 1,
  email: 'test@techno-dz.com',
  name: 'Test User',
  role: 'admin',
  permissions: ['read', 'write', 'delete']
};

// ============================================================================
// LOGIN PAGE TESTS
// ============================================================================

describe('Login Page', () => {
  let mockAuth;
  let mockNavigate;
  let mockLocation;
  let mockAuthApi;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    mockAuth = {
      login: vi.fn(),
      logout: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    };
    
    mockNavigate = vi.fn();
    mockLocation = { pathname: '/login', search: '', state: null };
    
    const { useAuth } = require('../../contexts/AuthContext');
    const { useNavigate, useLocation } = require('react-router-dom');
    
    useAuth.mockReturnValue(mockAuth);
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue(mockLocation);
    
    mockAuthApi = require('../../services/authApi').default;
    mockAuthApi.login.mockResolvedValue({
      user: mockUser,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // RENDERING TESTS
  // ============================================================================

  describe('Rendering', () => {
    it('renders login form without crashing', () => {
      renderLogin();
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('displays login form elements', () => {
      renderLogin();
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('displays company branding', () => {
      renderLogin();
      
      expect(screen.getByText(/techno-etl/i)).toBeInTheDocument();
      expect(screen.getByAltText(/company logo/i)).toBeInTheDocument();
    });

    it('displays welcome message', () => {
      renderLogin();
      
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
    });

    it('displays forgot password link', () => {
      renderLogin();
      
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });

    it('displays remember me checkbox', () => {
      renderLogin();
      
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // FORM VALIDATION TESTS
  // ============================================================================

  describe('Form Validation', () => {
    it('validates email field is required', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });

    it('validates password field is required', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, validCredentials.email);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('validates password minimum length', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, '123'); // Too short
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
    });

    it('clears validation errors when user types', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      // Trigger validation error
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      
      // Start typing
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test');
      
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // AUTHENTICATION TESTS
  // ============================================================================

  describe('Authentication', () => {
    it('submits login form with valid credentials', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      // Fill form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuth.login).toHaveBeenCalledWith({
          email: validCredentials.email,
          password: validCredentials.password,
          rememberMe: false
        });
      });
    });

    it('shows loading state during authentication', async () => {
      const user = userEvent.setup();
      
      // Make login slow
      mockAuth.login.mockImplementation(() => new Promise(() => {}));
      mockAuth.isLoading = true;
      
      renderLogin();
      
      // Fill and submit form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('handles successful login', async () => {
      const user = userEvent.setup();
      
      mockAuth.login.mockResolvedValue(mockUser);
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;
      
      renderLogin();
      
      // Fill and submit form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('handles login errors', async () => {
      const user = userEvent.setup();
      const error = new Error('Invalid credentials');
      
      mockAuth.login.mockRejectedValue(error);
      mockAuth.error = 'Invalid credentials';
      
      renderLogin();
      
      // Fill and submit form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, invalidCredentials.email);
      await user.type(passwordInput, invalidCredentials.password);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('remembers user preference', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      // Fill form and check remember me
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberCheckbox = screen.getByLabelText(/remember me/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      await user.click(rememberCheckbox);
      
      // Submit
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuth.login).toHaveBeenCalledWith({
          email: validCredentials.email,
          password: validCredentials.password,
          rememberMe: true
        });
      });
    });
  });

  // ============================================================================
  // NAVIGATION TESTS
  // ============================================================================

  describe('Navigation', () => {
    it('redirects to dashboard after successful login', async () => {
      const user = userEvent.setup();
      
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;
      
      renderLogin();
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('redirects to intended page from location state', async () => {
      const user = userEvent.setup();
      
      mockLocation.state = { from: '/products' };
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;
      
      renderLogin();
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/products');
      });
    });

    it('navigates to forgot password page', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      await user.click(forgotPasswordLink);
      
      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });

    it('prevents access when already authenticated', () => {
      mockAuth.isAuthenticated = true;
      mockAuth.user = mockUser;
      
      renderLogin();
      
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  // ============================================================================
  // KEYBOARD NAVIGATION TESTS
  // ============================================================================

  describe('Keyboard Navigation', () => {
    it('submits form on Enter key', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      // Fill form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      
      // Press Enter
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockAuth.login).toHaveBeenCalled();
      });
    });

    it('focuses password field after email', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.keyboard('{Tab}');
      
      expect(passwordInput).toHaveFocus();
    });

    it('supports keyboard navigation to checkbox and button', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const rememberCheckbox = screen.getByLabelText(/remember me/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      
      // Tab through form elements
      await user.click(emailInput);
      await user.keyboard('{Tab}');
      expect(passwordInput).toHaveFocus();
      
      await user.keyboard('{Tab}');
      expect(rememberCheckbox).toHaveFocus();
      
      await user.keyboard('{Tab}');
      expect(submitButton).toHaveFocus();
    });
  });

  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      renderLogin();
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    });

    it('has proper ARIA attributes', () => {
      renderLogin();
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-labelledby');
      
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });

    it('announces validation errors to screen readers', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      const errorMessage = screen.getByText(/email is required/i);
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('has proper heading structure', () => {
      renderLogin();
      
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent(/sign in/i);
      
      const subHeading = screen.getByRole('heading', { level: 2 });
      expect(subHeading).toHaveTextContent(/welcome/i);
    });

    it('supports high contrast mode', () => {
      renderLogin();
      
      const form = screen.getByRole('form');
      expect(form).toHaveClass('high-contrast-support');
    });
  });

  // ============================================================================
  // SECURITY TESTS
  // ============================================================================

  describe('Security', () => {
    it('masks password input', () => {
      renderLogin();
      
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('provides toggle for password visibility', async () => {
      const user = userEvent.setup();
      renderLogin();
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByLabelText(/show password/i);
      
      // Initially hidden
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Toggle visibility
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Toggle back
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('prevents form submission with invalid CSRF token', async () => {
      const user = userEvent.setup();
      
      // Mock CSRF validation failure
      mockAuth.login.mockRejectedValue(new Error('CSRF token mismatch'));
      
      renderLogin();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/csrf token mismatch/i)).toBeInTheDocument();
      });
    });

    it('clears sensitive data on unmount', () => {
      const { unmount } = renderLogin();
      
      // Fill password field
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'sensitive-password' } });
      
      // Unmount component
      unmount();
      
      // Password should be cleared from memory
      expect(passwordInput.value).toBe('');
    });
  });

  // ============================================================================
  // ERROR RECOVERY TESTS
  // ============================================================================

  describe('Error Recovery', () => {
    it('allows retry after network error', async () => {
      const user = userEvent.setup();
      
      // First attempt fails
      mockAuth.login.mockRejectedValueOnce(new Error('Network error'));
      // Second attempt succeeds
      mockAuth.login.mockResolvedValueOnce(mockUser);
      
      renderLogin();
      
      // Fill and submit form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(emailInput, validCredentials.email);
      await user.type(passwordInput, validCredentials.password);
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      // Error should be shown
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
      
      // Retry
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuth.login).toHaveBeenCalledTimes(2);
      });
    });

    it('clears errors when form is modified', async () => {
      const user = userEvent.setup();
      
      mockAuth.login.mockRejectedValue(new Error('Invalid credentials'));
      mockAuth.error = 'Invalid credentials';
      
      renderLogin();
      
      // Submit to trigger error
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
      
      // Modify form
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'new');
      
      // Error should clear
      mockAuth.error = null;
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });
});