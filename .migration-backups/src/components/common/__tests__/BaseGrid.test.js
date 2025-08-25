import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseGrid from '../BaseGrid';

// Mock child components
jest.mock('../CustomGridToolbar', () => {
    return function MockCustomGridToolbar() {
        return <div data-testid="custom-grid-toolbar">CustomGridToolbar</div>;
    };
});

jest.mock('../GridCardView', () => {
    return function MockGridCardView() {
        return <div data-testid="grid-card-view">GridCardView</div>;
    };
});

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

describe('BaseGrid Component', () => {
    const defaultProps = {
        gridName: 'test-grid',
        columns: [
            { field: 'id', headerName: 'ID' },
            { field: 'name', headerName: 'Name' }
        ],
        data: [
            { id: 1, name: 'Test 1' },
            { id: 2, name: 'Test 2' }
        ]
    };

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('renders in list view mode by default', () => {
        render(<BaseGrid {...defaultProps} />);
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('switches to grid view mode', () => {
        render(<BaseGrid {...defaultProps} />);
        
        const gridViewButton = screen.getByLabelText('grid view');
        fireEvent.click(gridViewButton);

        expect(screen.getByTestId('grid-card-view')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
        render(<BaseGrid {...defaultProps} data={[]} />);
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('shows loading state', () => {
        render(<BaseGrid {...defaultProps} loading={true} />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('preserves view mode in localStorage', () => {
        render(<BaseGrid {...defaultProps} />);
        
        const gridViewButton = screen.getByLabelText('grid view');
        fireEvent.click(gridViewButton);

        expect(localStorage.setItem).toHaveBeenCalledWith('test-grid_viewMode', 'grid');
    });

    it('loads saved view mode from localStorage', () => {
        localStorage.getItem.mockReturnValue('grid');
        render(<BaseGrid {...defaultProps} />);
        
        expect(screen.getByTestId('grid-card-view')).toBeInTheDocument();
    });

    it('handles refresh callback', () => {
        const onRefresh = jest.fn();
        render(<BaseGrid {...defaultProps} onRefresh={onRefresh} />);
        
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        fireEvent.click(refreshButton);
        
        expect(onRefresh).toHaveBeenCalled();
    });
});
