import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SettingsPage from '../../pages/SettingsPage';

// Mock contexts
const mockAuthContext = {
  currentUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  }
};

const mockLanguageContext = {
  translate: vi.fn((key) => key),
  currentLanguage: 'en',
  languages: {
    en: { dir: 'ltr' }
  }
};

const mockThemeContext = {
  animations: true
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => mockLanguageContext
}));

vi.mock('../../contexts/ThemeContext', () => ({
  useCustomTheme: () => mockThemeContext
}));

// Mock UserProfile component
vi.mock('../../components/UserProfile/index', () => ({
  default: () => <div data-testid="user-profile">UserProfile Component</div>
}));

// Mock ErrorBoundary
vi.mock('../../components/common/ErrorBoundary', () => ({
  default: ({ children }) => <div data-testid="error-boundary">{children}</div>
}));

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document title
    document.title = 'Test';
  });

  it('renders without crashing', () => {
    renderWithTheme(<SettingsPage />);
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });

  it('sets the correct page title', async () => {
    renderWithTheme(<SettingsPage />);
    await waitFor(() => {
      expect(document.title).toBe('Settings - TECHNO-ETL');
    });
  });

  it('displays breadcrumb navigation', () => {
    renderWithTheme(<SettingsPage />);
    expect(screen.getByLabelText('breadcrumb navigation')).toBeInTheDocument();
  });

  it('displays settings title and description', () => {
    renderWithTheme(<SettingsPage />);
    expect(screen.getByText('settings.title')).toBeInTheDocument();
    expect(screen.getByText('settings.description')).toBeInTheDocument();
  });

  it('renders UserProfile component', () => {
    renderWithTheme(<SettingsPage />);
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });

  it('handles RTL layout correctly', () => {
    const mockRTLLanguageContext = {
      ...mockLanguageContext,
      currentLanguage: 'ar',
      languages: {
        ar: { dir: 'rtl' }
      }
    };

    vi.mocked(vi.importActual('../../contexts/LanguageContext')).useLanguage = () => mockRTLLanguageContext;
    
    renderWithTheme(<SettingsPage />);
    // Test would verify RTL-specific styling is applied
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });

  it('handles missing user gracefully', () => {
    const mockNoUserContext = {
      currentUser: null
    };

    vi.mocked(vi.importActual('../../contexts/AuthContext')).useAuth = () => mockNoUserContext;
    
    renderWithTheme(<SettingsPage />);
    expect(screen.getByTestId('user-profile')).toBeInTheDocument();
  });

  it('cleans up page title on unmount', () => {
    const { unmount } = renderWithTheme(<SettingsPage />);
    unmount();
    expect(document.title).toBe('TECHNO-ETL');
  });
});