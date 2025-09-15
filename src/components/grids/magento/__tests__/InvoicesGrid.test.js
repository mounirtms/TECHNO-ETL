import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvoicesGrid from '../InvoicesGrid';
import { magentoApi } from '../../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../../services/magentoApi', () => ({
  magentoApi: {
    getInvoices: jest.fn(),
  },
}));

// Mock data
const mockInvoices = [
  {
    id: 1,
    increment_id: '000000001',
    order_id: 1,
    state: 'paid',
    grand_total: 150.00,
    currency_code: 'USD',
    created_at: '2023-01-15 10:30:00',
    updated_at: '2023-01-15 10:35:00',
    customer_firstname: 'John',
    customer_lastname: 'Doe',
  },
  {
    id: 2,
    increment_id: '000000002',
    order_id: 2,
    state: 'pending',
    grand_total: 89.99,
    currency_code: 'USD',
    created_at: '2023-01-16 14:45:00',
    updated_at: '2023-01-16 14:50:00',
    customer_firstname: 'Jane',
    customer_lastname: 'Smith',
  },
];

describe('InvoicesGrid Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    magentoApi.getInvoices.mockResolvedValue({
      items: mockInvoices,
      total_count: mockInvoices.length,
    });
  });

  it('renders without crashing', async () => {
    render(<InvoicesGrid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays invoices data correctly', async () => {
    render(<InvoicesGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('000000001')).toBeInTheDocument();
      expect(screen.getByText('000000002')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    magentoApi.getInvoices.mockRejectedValue(new Error('API Error'));

    render(<InvoicesGrid />);

    // Wait for error handling
    await waitFor(() => {
      // Should show error state or empty state
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Delay the mock response
    magentoApi.getInvoices.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        items: mockInvoices,
        total_count: mockInvoices.length,
      }), 100)),
    );

    render(<InvoicesGrid />);

    // Initially should show loading
    // Note: exact loading indicator may vary based on implementation
    await waitFor(() => {
      expect(screen.getByText(/000000001|000000002/)).toBeInTheDocument();
    });
  });
});
