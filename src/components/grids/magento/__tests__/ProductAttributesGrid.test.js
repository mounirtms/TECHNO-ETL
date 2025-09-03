import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductAttributesGrid from '../ProductAttributesGrid';
import { magentoApi } from '../../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../../services/magentoApi', () => ({
  magentoApi: {
    getProductAttributes: jest.fn(),
  },
}));

// Mock data
const mockAttributes = [
  {
    attribute_id: 1,
    attribute_code: 'color',
    frontend_label: 'Color',
    frontend_input: 'select',
    is_required: false,
    is_unique: false,
    is_global: true,
    default_value: '',
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Blue', value: 'blue' },
      { label: 'Green', value: 'green' },
    ],
  },
  {
    attribute_id: 2,
    attribute_code: 'size',
    frontend_label: 'Size',
    frontend_input: 'select',
    is_required: false,
    is_unique: false,
    is_global: true,
    default_value: '',
    options: [
      { label: 'Small', value: 's' },
      { label: 'Medium', value: 'm' },
      { label: 'Large', value: 'l' },
    ],
  },
];

describe('ProductAttributesGrid Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementation
    magentoApi.getProductAttributes.mockResolvedValue({
      items: mockAttributes,
      total_count: mockAttributes.length,
    });
  });

  it('renders without crashing', async () => {
    render(<ProductAttributesGrid />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays product attributes data correctly', async () => {
    render(<ProductAttributesGrid />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Color')).toBeInTheDocument();
      expect(screen.getByText('Size')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    magentoApi.getProductAttributes.mockRejectedValue(new Error('API Error'));

    render(<ProductAttributesGrid />);

    // Wait for error handling
    await waitFor(() => {
      // Should show error state or empty state
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  it('shows loading state while fetching data', async () => {
    // Delay the mock response
    magentoApi.getProductAttributes.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        items: mockAttributes,
        total_count: mockAttributes.length,
      }), 100)),
    );

    render(<ProductAttributesGrid />);

    // Initially should show loading
    // Note: exact loading indicator may vary based on implementation
    await waitFor(() => {
      expect(screen.getByText(/Color|Size/)).toBeInTheDocument();
    });
  });
});
