import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../../theme';
import BaseGrid from '../BaseGrid';
import '@testing-library/jest-dom';

// Mock the i18next hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { changeLanguage: jest.fn() }
    })
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

describe('BaseGrid Component', () => {
    const mockData = [
        { id: 1, name: 'Test 1', price: 100 },
        { id: 2, name: 'Test 2', price: 200 }
    ];

    const mockColumns = [
        { field: 'id', headerName: 'ID' },
        { field: 'name', headerName: 'Name' },
        { field: 'price', headerName: 'Price' }
    ];

    const defaultProps = {
        data: mockData,
        columns: mockColumns,
        gridName: 'test-grid',
        loading: false
    };

    const renderWithTheme = (component) => {
        return render(
            <ThemeProvider theme={theme}>
                {component}
            </ThemeProvider>
        );
    };

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        expect(() => {
            renderWithTheme(<BaseGrid {...defaultProps} />);
        }).not.toThrow();
    });

    it('handles empty data gracefully', () => {
        renderWithTheme(<BaseGrid {...defaultProps} data={[]} />);
        expect(screen.getByText('No rows')).toBeInTheDocument();
    });

    it('handles null data gracefully', () => {
        renderWithTheme(<BaseGrid {...defaultProps} data={null} />);
        expect(screen.getByText('No rows')).toBeInTheDocument();
    });

    it('switches between list and grid views', async () => {
        renderWithTheme(<BaseGrid {...defaultProps} />);
        
        // Find and click grid view button
        const gridViewButton = screen.getByLabelText('grid view');
        fireEvent.click(gridViewButton);

        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith('test-grid_viewMode', 'grid');
        });

        // Switch back to list view
        const listViewButton = screen.getByLabelText('list view');
        fireEvent.click(listViewButton);

        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith('test-grid_viewMode', 'list');
        });
    });

    it('handles refresh callback', async () => {
        const mockRefresh = jest.fn();
        renderWithTheme(<BaseGrid {...defaultProps} onRefresh={mockRefresh} />);

        const refreshButton = screen.getByTitle('Refresh');
        fireEvent.click(refreshButton);

        expect(mockRefresh).toHaveBeenCalled();
    });

    it('handles loading state correctly', () => {
        renderWithTheme(<BaseGrid {...defaultProps} loading={true} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('handles error states gracefully', () => {
        const mockError = new Error('Test error');
        const mockOnError = jest.fn();

        renderWithTheme(
            <BaseGrid 
                {...defaultProps} 
                onError={mockOnError}
                data={() => { throw mockError; }}
            />
        );

        expect(mockOnError).toHaveBeenCalledWith(mockError);
    });

    it('preserves view mode preference', () => {
        localStorage.getItem.mockReturnValue('grid');
        renderWithTheme(<BaseGrid {...defaultProps} />);
        
        expect(localStorage.getItem).toHaveBeenCalledWith('test-grid_viewMode');
    });

    it('handles window resize events', async () => {
        const { unmount } = renderWithTheme(<BaseGrid {...defaultProps} />);

        // Simulate window resize
        act(() => {
            global.innerHeight = 1000;
            global.dispatchEvent(new Event('resize'));
        });

        // Clean up
        unmount();
    });

    it('handles row double click', () => {
        const mockDoubleClick = jest.fn();
        renderWithTheme(<BaseGrid {...defaultProps} onRowDoubleClick={mockDoubleClick} />);

        const row = screen.getByRole('row', { name: /Test 1/i });
        fireEvent.doubleClick(row);

        expect(mockDoubleClick).toHaveBeenCalled();
    });

    describe('Error Boundary Tests', () => {
        const ErrorComponent = () => {
            throw new Error('Test error boundary');
        };

        it('catches rendering errors', () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            
            renderWithTheme(
                <BaseGrid 
                    {...defaultProps}
                    components={{
                        NoRowsOverlay: ErrorComponent
                    }}
                />
            );

            expect(errorSpy).toHaveBeenCalled();
            errorSpy.mockRestore();
        });
    });
});
