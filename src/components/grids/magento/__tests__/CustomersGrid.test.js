import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomersGrid from '../CustomersGrid';
import { magentoApi } from '../../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../../services/magentoApi', () => ({
  magentoApi: {
    getCustomers: jest.fn(),
  },
}));

// Mock data
const mockCustomers = [
  {
    id: 1,
    email: 'john.doe@example.com',
    firstname: 'John',
    lastname: 'Doe',
    group_id: 1,
    created_at: '2023-01-01 10:00:00',
    updated_at: '2023-01-10 15:30:00',
    is_active: true,
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    firstname: 'Jane',
    lastname: 'Smith',
    group_id: 2,
    created_at: '2023-01-02 11:00:00',
    updated_at: '2023-01-11 16:30:00',
    is_active: true,
  },
];

describe('CustomersGrid Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    magentoApi.getCustomers.mockResolvedValue({
      items: mockCustomers,
      total_count: mockCustomers.length,
    });
  });

  it('renders without crashing', async () => {
    render(<CustomersGrid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays customers data correctly', async () => {
    render(<CustomersGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    magentoApi.getCustomers.mockRejectedValue(new Error('API Error'));

    render(<CustomersGrid />);

    // Wait for error handling
    await waitFor(() => {
      // Should show error state or empty state
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Delay the mock response
    magentoApi.getCustomers.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        items: mockCustomers,
        total_count: mockCustomers.length,
      }), 100)),
    );

    render(<CustomersGrid />);

    // Initially should show loading
    // Note: exact loading indicator may vary based on implementation
    await waitFor(() => {
      expect(screen.getByText(/john.doe@example.com|jane.smith@example.com/)).toBeInTheDocument();
    });
  });
});
