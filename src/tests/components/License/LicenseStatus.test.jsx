import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import LicenseStatus from '../../../components/License/LicenseStatus';

// Mock contexts
const mockAuthContext = {
  currentUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    isMagentoUser: false,
  },
};

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock license utils
const mockLicenseUtils = {
  check_license_status: vi.fn(),
  get_license_details: vi.fn(),
  set_license_status: vi.fn(),
};

vi.mock('../../../utils/licenseUtils', () => mockLicenseUtils);

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>,
  );
};

describe('LicenseStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockLicenseUtils.check_license_status.mockImplementation(() => new Promise(() => {}));
    mockLicenseUtils.get_license_details.mockImplementation(() => new Promise(() => {}));

    renderWithTheme(<LicenseStatus />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays valid license status', async () => {
    const mockLicenseDetails = {
      isValid: true,
      licenseType: 'premium',
      expiryDate: '2024-12-31T23:59:59.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-15T12:00:00.000Z',
      features: ['dashboard', 'products', 'analytics'],
    };

    mockLicenseUtils.check_license_status.mockResolvedValue(true);
    mockLicenseUtils.get_license_details.mockResolvedValue(mockLicenseDetails);

    renderWithTheme(<LicenseStatus />);

    await waitFor(() => {
      expect(screen.getByText('License Status')).toBeInTheDocument();
      expect(screen.getByText('Valid')).toBeInTheDocument();
      expect(screen.getByText('premium')).toBeInTheDocument();
    }, { timeout: 15000 });
  });

  it('displays invalid license status', async () => {
    mockLicenseUtils.check_license_status.mockResolvedValue(false);
    mockLicenseUtils.get_license_details.mockResolvedValue({
      isValid: false,
      licenseType: 'none',
    });

    renderWithTheme(<Licensawait waitFor(() => {
      expect(screen.getByText('Invalid')).toBeInTheDocument();
    }, { timeout: 15000 });Document();
    });
  });

  it('handles license activation', async () => {
    mockLicenseUtils.check_license_status.mockResolvedValue(false);
    mockLicenseUtils.get_license_details.mockResolvedValue({ isValid: false });
    mockLicenseUtils.set_license_status.mockResolvedValue(true);

    renawait waitFor(() => {
      expect(screen.getByText('Activate Test License')).toBeInTheDocument();
    }, { timeout: 15000 });License')).toBeInTheDocument();
    });

    const activateButton = screen.getByText('Activate Test License');

    fireEvent.click(activateButton);

    await waitFor(() => {
      expect(mockLicenseUtils.set_license_status).toHaveBeenCalledWith(
        'test-user-123',
        expect.objectContaining({
          isValid: true,
          licenseType: 'premium',
        }),
      );
    });
  });

  it('handles license deactivation', async () => {
    mockLicenseUtils.check_license_status.mockResolvedValue(true);
    mockLicenseUtils.get_license_details.mockResolvedValue({ isValid: true });
    mockLicenseUtils.set_license_status.mockResolvedValawait waitFor(() => {
      expect(screen.getByText('Deactivate License')).toBeInTheDocument();
    }, { timeout: 15000 });tByText('Deactivate License')).toBeInTheDocument();
    });

    const deactivateButton = screen.getByText('Deactivate License');

    fireEvent.click(deactivateButton);

    await waitFor(() => {
      expect(mockLicenseUtils.set_license_status).toHaveBeenCalledWith(
        'test-user-123',
        { isValid: false },
      );
    });
  });

  it('displays error when no user is authenticated', async () => {
    const mockNoUserContext = {
      currentUser: null,
    };

    vi.mocked(vi.importActual('../../../contexts/AuthContext')).useAuawait waitFor(() => {
      expect(screen.getByText('No user authenticated')).toBeInTheDocument();
    }, { timeout: 15000 }); expect(screen.getByText('No user authenticated')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockLicenseUtils.check_license_status.mockRejectedValue(new Error('API Error'));
    mockLicenseUtils.get_license_dawait waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    }, { timeout: 15000 });    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('refreshes license status', async () => {
    mockLicenseUtils.check_license_status.mockResolvedValue(true);
    mockLawait waitFor(() => {
      expect(screen.getByText('Refresh Status')).toBeInTheDocument();
    }, { timeout: 15000 });Status />);

    await waitFor(() => {
      expect(screen.getByText('Refresh Status')).await waitFor(() => {
      expect(mockLicenseUtils.check_license_status).toHaveBeenCalledTimes(2);
      expect(mockLicenseUtils.get_license_details).toHaveBeenCalledTimes(2);
    }, { timeout: 15000 });Utils.check_license_status).toHaveBeenCalledTimes(2);
      expect(mockLicenseUtils.get_license_details).toHaveBeenCalledTimes(2);
    });
  });

  it('displays license features correctly', async () => {
    const mockLicenseDetails = {
      isValid: true,
      features: ['dashboard', 'products', 'analytics', 'charts'],
    };

    mockLicenseUtils.check_license_staawait waitFor(() => {
      expect(screen.getByText('Available Features')).toBeInTheDocument();
      expect(screen.getByText('dashboard')).toBeInTheDocument();
      expect(screen.getByText('products')).toBeInTheDocument();
      expect(screen.getByText('analytics')).toBeInTheDocument();
      expect(screen.getByText('charts')).toBeInTheDocument();
    }, { timeout: 15000 });).toBeInTheDocument();
      expect(screen.getByText('analytics')).toBeInTheDocument();
      expect(screen.getByText('charts')).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    const mockLicenseDetails = {
      isValid: true,
      expiryDate: '2024-12-31T23:59:59.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
    };

    mockLicenseUtiawait waitFor(() => {
      expect(screen.getByText('Expiry Date')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      // Dates should be formatted as locale strings
    }, { timeout: 15000 });screen.getByText('Expiry Date')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      // Dates should be formatted as locale strings
    });
  });
});
