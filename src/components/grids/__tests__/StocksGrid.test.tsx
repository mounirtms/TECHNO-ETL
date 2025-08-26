import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StocksGrid from '../StocksGrid';
import { magentoApi } from '../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../services/magentoApi', () => ({
    magentoApi: {
        getStocks: jest.fn()
}));

// Mock data
const mockStocks = [
    {
        stock_id: 1,
        name: 'Default Stock',
        sales_channels: [
            { type: 'website', code: 'base' }
        ],
        source_codes: ['default']
    },
    {
        stock_id: 2,
        name: 'East Coast Stock',
        sales_channels: [
            { type: 'website', code: 'east_store' }
        ],
        source_codes: []
];

describe('StocksGrid Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Setup default mock implementation
        magentoApi.getStocks.mockResolvedValue({
            items: mockStocks,
            total_count: mockStocks.length
        });
    });

    it('renders without crashing', async () => {
        render(<StocksGrid />);
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('displays loading state while fetching data', async () => {
        render(<StocksGrid />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    it('displays stock data correctly', async () => {
        render(<StocksGrid />);
        
        await waitFor(() => {
            expect(screen.getByText('Default Stock')).toBeInTheDocument();
            expect(screen.getByText('East Coast Stock')).toBeInTheDocument();
        });
    });

    it('handles refresh correctly', async () => {
        render(<StocksGrid />);
        
        const refreshButton = await screen.findByRole('button', { name: /refresh/i });
        fireEvent.click(refreshButton);
        
        expect(magentoApi.getStocks).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('displays sales channels correctly', async () => {
        render(<StocksGrid />);
        
        await waitFor(() => {
            expect(screen.getByText('website: base')).toBeInTheDocument();
            expect(screen.getByText('website: east_store')).toBeInTheDocument();
        });
    });

    it('displays source codes correctly', async () => {
        render(<StocksGrid />);
        
        await waitFor(() => {
            expect(screen.getByText('default')).toBeInTheDocument();
            expect(screen.getByText('No sources assigned')).toBeInTheDocument();
        });
    });

    it('displays correct statistics in grid cards', async () => {
        render(<StocksGrid />);
        
        await waitFor(() => {
            expect(screen.getByText('Total Stocks')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument(); // Total count
            expect(screen.getByText('1')).toBeInTheDocument(); // Stocks with sources count
        });
    });

    it('handles API errors gracefully', async () => {
        // Mock API error
        magentoApi.getStocks.mockRejectedValueOnce(new Error('API Error'));
        
        render(<StocksGrid />);
        
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.getByText('Total Stocks')).toBeInTheDocument();
            expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 when error occurs
        });
    });
});
