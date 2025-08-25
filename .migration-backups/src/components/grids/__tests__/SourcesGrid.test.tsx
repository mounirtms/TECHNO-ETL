import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SourcesGrid from '../SourcesGrid';
import { magentoApi } from '../../../services/magentoApi';

// Mock the magentoApi
jest.mock('../../../services/magentoApi', () => ({
    magentoApi: {
        getSources: jest.fn()
    }
}));

// Mock data
const mockSources = [
    {
        source_code: 'default',
        name: 'Default Source',
        enabled: true,
        description: 'Default source for the store',
        country_id: 'US',
        city: 'San Francisco',
        postcode: '94105'
    },
    {
        source_code: 'warehouse1',
        name: 'Warehouse 1',
        enabled: false,
        description: 'Main warehouse',
        country_id: 'US',
        city: 'Los Angeles',
        postcode: '90001'
    }
];

describe('SourcesGrid Component', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Setup default mock implementation
        magentoApi.getSources.mockResolvedValue({
            items: mockSources,
            total_count: mockSources.length
        });
    });

    it('renders without crashing', async () => {
        render(<SourcesGrid />);
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('displays loading state while fetching data', async () => {
        render(<SourcesGrid />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });
    });

    it('displays source data correctly', async () => {
        render(<SourcesGrid />);
        
        await waitFor(() => {
            expect(screen.getByText('Default Source')).toBeInTheDocument();
            expect(screen.getByText('Warehouse 1')).toBeInTheDocument();
        });
    });

    it('handles refresh correctly', async () => {
        render(<SourcesGrid />);
        
        const refreshButton = await screen.findByRole('button', { name: /refresh/i });
        fireEvent.click(refreshButton);
        
        expect(magentoApi.getSources).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('displays correct status for enabled/disabled sources', async () => {
        render(<SourcesGrid />);
        
        await waitFor(() => {
            expect(screen.getByText('Enabled')).toBeInTheDocument();
            expect(screen.getByText('Disabled')).toBeInTheDocument();
        });
    });

    it('displays correct statistics in grid cards', async () => {
        render(<SourcesGrid />);
        
        await waitFor(() => {
            expect(screen.getByText('Total Sources')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument(); // Total count
            expect(screen.getByText('1')).toBeInTheDocument(); // Active count
        });
    });

    it('handles API errors gracefully', async () => {
        // Mock API error
        magentoApi.getSources.mockRejectedValueOnce(new Error('API Error'));
        
        render(<SourcesGrid />);
        
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.getByText('Total Sources')).toBeInTheDocument();
            expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 when error occurs
        });
    });
});
