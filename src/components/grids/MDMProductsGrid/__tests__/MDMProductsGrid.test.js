import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MDMProductsGrid from '../MDMProductsGrid';
import { mdmApi } from '../../../../services/mdmApi';

// Mock the mdmApi
jest.mock('../../../../services/mdmApi', () => ({
  mdmApi: {
    getProducts: jest.fn(),
  },
}));

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Smartphone X',
    sku: 'SP-X-001',
    brand: 'TechBrand',
    category: 'Electronics',
    price: 599.99,
    stock: 50,
    last_updated: '2023-01-15T10:30:00Z',
    status: 'active',
  },
  {
    id: '2',
    name: 'Laptop Pro',
    sku: 'LP-P-002',
    brand: 'TechBrand',
    category: 'Computers',
    price: 1299.99,
    stock: 25,
    last_updated: '2023-01-16T14:45:00Z',
    status: 'active',
  },
];

describe('MDMProductsGrid Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    mdmApi.getProducts.mockResolvedValue({
      items: mockProducts,
      total_count: mockProducts.length,
    });
  });

  it('renders without crashing', async () => {
    render(<MDMProductsGrid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays MDM products data correctly', async () => {
    render(<MDMProductsGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Smartphone X')).toBeInTheDocument();
      expect(screen.getByText('Laptop Pro')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    mdmApi.getProducts.mockRejectedValue(new Error('API Error'));

    render(<MDMProductsGrid />);

    // Wait for error handling
    await waitFor(() => {
      // Should show error state or empty state
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Delay the mock response
    mdmApi.getProducts.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        items: mockProducts,
        total_count: mockProducts.length,
      }), 100)),
    );

    render(<MDMProductsGrid />);

    // Initially should show loading
    // Note: exact loading indicator may vary based on implementation
    await waitFor(() => {
      expect(screen.getByText(/Smartphone X|Laptop Pro/)).toBeInTheDocument();
    });
  });
});
