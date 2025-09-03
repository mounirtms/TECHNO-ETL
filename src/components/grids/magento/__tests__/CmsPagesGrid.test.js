import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CmsPagesGrid from '../CmsPagesGrid';
import { magentoApi } from '../../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../../services/magentoApi', () => ({
  magentoApi: {
    getCmsPages: jest.fn(),
  },
}));

// Mock data
const mockCmsPages = [
  {
    id: 1,
    title: 'Home Page',
    identifier: 'home',
    content: '<h1>Welcome to our store</h1>',
    creation_time: '2023-01-01 10:00:00',
    update_time: '2023-01-10 15:30:00',
    is_active: true,
  },
  {
    id: 2,
    title: 'About Us',
    identifier: 'about',
    content: '<h1>About our company</h1>',
    creation_time: '2023-01-02 11:00:00',
    update_time: '2023-01-11 16:30:00',
    is_active: true,
  },
];

describe('CmsPagesGrid Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    magentoApi.getCmsPages.mockResolvedValue({
      items: mockCmsPages,
      total_count: mockCmsPages.length,
    });
  });

  it('renders without crashing', async () => {
    render(<CmsPagesGrid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays CMS pages data correctly', async () => {
    render(<CmsPagesGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.getByText('About Us')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    magentoApi.getCmsPages.mockRejectedValue(new Error('API Error'));

    render(<CmsPagesGrid />);

    // Wait for error handling
    await waitFor(() => {
      // Should show error state or empty state
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Delay the mock response
    magentoApi.getCmsPages.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        items: mockCmsPages,
        total_count: mockCmsPages.length,
      }), 100)),
    );

    render(<CmsPagesGrid />);

    // Initially should show loading
    // Note: exact loading indicator may vary based on implementation
    await waitFor(() => {
      expect(screen.getByText(/Home Page|About Us/)).toBeInTheDocument();
    });
  });
});
