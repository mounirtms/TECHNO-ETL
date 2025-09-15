
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SyncProgressBar from '../SyncProgressBar';
import '@testing-library/jest-dom';

const mockProgressData = {
  isActive: true,
  completed: false,
  current: 1,
  total: 4,
  currentStep: 'Fetching source configurations',
  sources: [
    { code: 'source1', name: 'Source 1' },
    { code: 'source2', name: 'Source 2' },
    { code: 'source3', name: 'Source 3' },
  ],
  completedSources: ['source1'],
  errorSources: [],
  message: 'Sync in progress...',
};

describe('SyncProgressBar', () => {
  it('renders the progress bar with correct data', () => {
    render(<SyncProgressBar progressData={mockProgressData} />);

    expect(screen.getByText('📦 Stock Synchronization Progress')).toBeInTheDocument();
    expect(screen.getByText('Overall Progress: 1 / 4 Steps')).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('Fetching source configurations')).toBeInTheDocument();
    expect(screen.getByText('Sources: 1 / 3 completed')).toBeInTheDocument();
    expect(screen.getByText('Sync in progress...')).toBeInTheDocument();
  });

  it('does not render if not active and not completed', () => {
    const { container } = render(<SyncProgressBar progressData={{ isActive: false, completed: false }} />);

    expect(container.firstChild).toBeNull();
  });

  it('expands and collapses the details section', () => {
    render(<SyncProgressBar progressData={mockProgressData} />);

    const expandButton = screen.getByLabelText('Toggle details');

    expect(screen.queryByText('Process Steps')).not.toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.getByText('Process Steps')).toBeInTheDocument();
    expect(screen.getByText('Sources Status (1 / 3)')).toBeInTheDocument();

    fireEvent.click(expandButton);
    expect(screen.queryByText('Process Steps')).not.toBeInTheDocument();
  });

  it('displays the correct status for each source', () => {
    render(<SyncProgressBar progressData={mockProgressData} />);
    const expandButton = screen.getByLabelText('Toggle details');

    fireEvent.click(expandButton);

    expect(screen.getByText('Source 1').closest('.MuiChip-filledSuccess')).toBeInTheDocument();
    expect(screen.getByText('Source 2').closest('.MuiChip-outlined')).toBeInTheDocument();
    expect(screen.getByText('Source 3').closest('.MuiChip-outlined')).toBeInTheDocument();
  });

  it('shows error status for sources with errors', () => {
    const errorData = {
      ...mockProgressData,
      errorSources: ['source2'],
    };

    render(<SyncProgressBar progressData={errorData} />);
    const expandButton = screen.getByLabelText('Toggle details');

    fireEvent.click(expandButton);

    expect(screen.getByText('Source 2').closest('.MuiChip-filledError')).toBeInTheDocument();
  });
});
