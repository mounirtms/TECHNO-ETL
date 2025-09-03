import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BaseGrid from '../BaseGrid';

// Mock data
const mockColumns = [
  { field: 'id', headerName: 'ID', width: 100 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
];

const mockRows = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

describe('BaseGrid Component', () => {
  it('renders without crashing', () => {
    render(<BaseGrid columns={mockColumns} rows={mockRows} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('displays correct number of rows', () => {
    render(<BaseGrid columns={mockColumns} rows={mockRows} />);
    const rows = screen.getAllByRole('row');

    // +1 for header row
    expect(rows).toHaveLength(mockRows.length + 1);
  });

  it('displays column headers correctly', () => {
    render(<BaseGrid columns={mockColumns} rows={mockRows} />);
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('handles empty rows correctly', () => {
    render(<BaseGrid columns={mockColumns} rows={[]} />);
    expect(screen.getByRole('grid')).toBeInTheDocument();
    // Only header row should be present
    const rows = screen.getAllByRole('row');

    expect(rows).toHaveLength(1);
  });

  it('applies custom props correctly', () => {
    render(
      <BaseGrid
        columns={mockColumns}
        rows={mockRows}
        loading={true}
        pageSize={10}
      />,
    );
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
