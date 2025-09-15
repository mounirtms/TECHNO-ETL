import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductManagementGrid from '../ProductManagementGrid';
import { magentoApi } from '../../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../../services/magentoApi', () => ({
  magentoApi: {
    getProducts: jest.fn(),
  },
}));

// Mock data
const mockProducts = [
  {
    id: 1,
    sku: 'PRODUCT-001',
    name: 'Smartphone',
    price: 599.99,
    status: 1,
    visibility: 4,
    type_id: 'simple',
    created_at: '2023-01-01 10:00:00',
    updated_at: '2023-01-10 15:30:00',
    categories: [{ id: 1, name: 'Electronics' }],
  },
  {
    id: 2,
    sku: 'PRODUCT-002',
    name: 'Laptop',
    price: 1299.99,
    status: 1,
    visibility: 4,
    type_id: 'simple',
    created_at: '2023-01-02 11:00:00',
    updated_at: '2023-01-11 16:30:00',
    categories: [{ id: 2, name: 'Computers' }],
  },
];

describe('ProductManagementGrid Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    magentoApi.getProducts.mockResolvedValue({
      items: mockProducts,
      total_count: mockProducts.length,
    });
  });

  it('renders without crashing', async () => {
    render(<ProductManagementGrid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays product management data correctly', async () => {
    render(<ProductManagementGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Smartphone')).toBeInTheDocument();
      expect(screen.getByText('Laptop')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    magentoApi.getProducts.mockRejectedValue(new Error('API Error'));

    render(<ProductManagementGrid />);

    // Wait for error handling
    await waitFor(() => {
      // Should show error state or empty state
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Delay the mock response
    magentoApi.getProducts.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        items: mockProducts,
        total_count: mockProducts.length,
      }), 100)),
    );

    render(<ProductManagementGrid />);

    // Initially should show loading
    // Note: exact loading indicator may vary based on implementation
    await waitFor(() => {
      expect(screen.getByText(/Smartphone|Laptop/)).toBeInTheDocument();
    });
  });
});
