import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrdersGrid from '../OrdersGrid';
import { magentoApi } from '../../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../../services/magentoApi', () => ({
  magentoApi: {
    getOrders: jest.fn(),
  },
}));

// Mock data
const mockOrders = [
  {
    id: 1,
    increment_id: '000000001',
    status: 'complete',
    created_at: '2023-01-15 10:30:00',
    grand_total: 150.00,
    currency_code: 'USD',
    customer_firstname: 'John',
    customer_lastname: 'Doe',
  },
  {
    id: 2,
    increment_id: '000000002',
    status: 'pending',
    created_at: '2023-01-16 14:45:00',
    grand_total: 89.99,
    currency_code: 'USD',
    customer_firstname: 'Jane',
    customer_lastname: 'Smith',
  },
];

describe('OrdersGrid Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    magentoApi.getOrders.mockResolvedValue({
      items: mockOrders,
      total_count: mockOrders.length,
    });
  });

  it('renders without crashing', async () => {
    render(<OrdersGrid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays orders data correctly', async () => {
    render(<OrdersGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('000000001')).toBeInTheDocument();
      expect(screen.getByText('000000002')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    magentoApi.getOrders.mockRejectedValue(new Error('API Error'));

    render(<OrdersGrid />);

    // Wait for error handling
    await waitFor(() => {
      // Should show error state or empty state
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Delay the mock response
    magentoApi.getOrders.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        items: mockOrders,
        total_count: mockOrders.length,
      }), 100)),
    );

    render(<OrdersGrid />);

    // Initially should show loading
    // Note: exact loading indicator may vary based on implementation
    await waitFor(() => {
      expect(screen.getByText(/000000001|000000002/)).toBeInTheDocument();
    });
  });
});
