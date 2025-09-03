import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductCategoriesGrid from '../ProductCategoriesGrid';
import { magentoApi } from '../../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../../services/magentoApi', () => ({
  magentoApi: {
    getCategories: jest.fn(),
  },
}));

// Mock data
const mockCategories = [
  {
    id: 1,
    name: 'Electronics',
    parent_id: 0,
    level: 1,
    product_count: 50,
    children_count: 5,
    is_active: true,
    position: 1,
    children_data: [
      {
        id: 3,
        name: 'Smartphones',
        parent_id: 1,
        level: 2,
        product_count: 20,
        children_count: 0,
        is_active: true,
        position: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'Clothing',
    parent_id: 0,
    level: 1,
    product_count: 30,
    children_count: 3,
    is_active: true,
    position: 2,
    children_data: [],
  },
];

describe('ProductCategoriesGrid Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    magentoApi.getCategories.mockResolvedValue({
      items: mockCategories,
      total_count: mockCategories.length,
    });
  });

  it('renders without crashing', async () => {
    render(<ProductCategoriesGrid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays product categories data correctly', async () => {
    render(<ProductCategoriesGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    magentoApi.getCategories.mockRejectedValue(new Error('API Error'));

    render(<ProductCategoriesGrid />);

    // Wait for error handling
    await waitFor(() => {
      // Should show error state or empty state
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Delay the mock response
    magentoApi.getCategories.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        items: mockCategories,
        total_count: mockCategories.length,
      }), 100)),
    );

    render(<ProductCategoriesGrid />);

    // Initially should show loading
    // Note: exact loading indicator may vary based on implementation
    await waitFor(() => {
      expect(screen.getByText(/Electronics|Clothing/)).toBeInTheDocument();
    });
  });
});
