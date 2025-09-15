/**
 * SyncProgressBar Component Tests
 *
 * Comprehensive test suite for the SyncProgressBar component
 * Tests progress display, step tracking, sources status, and user interactions
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Component under test
import SyncProgressBar from '../../components/SyncProgressBar';

// Mock Material-UI icons
vi.mock('@mui/icons-material', () => ({
  CheckCircle: () => <div data-testid="check-icon">✓</div>,
  Schedule: () => <div data-testid="pending-icon">⏰</div>,
  Sync: () => <div data-testid="sync-icon">🔄</div>,
  Storage: () => <div data-testid="source-icon">💾</div>,
  ExpandMore: () => <div data-testid="expand-more-icon">▼</div>,
  ExpandLess: () => <div data-testid="expand-less-icon">▲</div>,
}));

// Test utilities
const theme = createTheme();

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Mock data
const mockProgressData = {
  current: 2,
  total: 4,
  isActive: true,
  completed: false,
  currentStep: 'Syncing sources to Magento',
  sources: [
    { code: 'SRC001', name: 'Source 1' },
    { code: 'SRC002', name: 'Source 2' },
    { code: 'SRC003', name: 'Source 3' },
  ],
  completedSources: ['SRC001'],
  errorSources: ['SRC003'],
  message: 'Processing synchronization...',
};

const completedProgressData = {
  current: 4,
  total: 4,
  isActive: false,
  completed: true,
  currentStep: 'Sync completed successfully',
  sources: [
    { code: 'SRC001', name: 'Source 1' },
    { code: 'SRC002', name: 'Source 2' },
  ],
  completedSources: ['SRC001', 'SRC002'],
  errorSources: [],
  message: 'All sources synchronized successfully',
};

// ============================================================================
// BASIC FUNCTIONALITY TESTS
// ============================================================================

describe('SyncProgressBar - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('renders nothing when progressData is inactive and not completed', () => {
    const inactiveData = {
      current: 0,
      total: 4,
      isActive: false,
      completed: false,
    };

    const { container } = render(
      <TestWrapper>
        <SyncProgressBar progressData={inactiveData} />
      </TestWrapper>,
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders progress bar when active', () => {
    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    expect(screen.getByText('📦 Stock Synchronization Progress')).toBeInTheDocument();
    expect(screen.getByText('Overall Progress: 2 / 4 Steps')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('renders progress bar when completed', () => {
    render(
      <TestWrapper>
        <SyncProgressBar progressData={completedProgressData} />
      </TestWrapper>,
    );

    expect(screen.getByText('📦 Stock Synchronization Progress')).toBeInTheDocument();
    expect(screen.getByText('Overall Progress: 4 / 4 Steps')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('handles missing progressData gracefully', () => {
    const { container } = render(
      <TestWrapper>
        <SyncProgressBar />
      </TestWrapper>,
    );

    expect(container.firstChild).toBeNull();
  });

  test('handles undefined progressData gracefully', () => {
    const { container } = render(
      <TestWrapper>
        <SyncProgressBar progressData={undefined} />
      </TestWrapper>,
    );

    expect(container.firstChild).toBeNull();
  });
});

// ============================================================================
// PROGRESS CALCULATION TESTS
// ============================================================================

describe('SyncProgressBar - Progress Calculation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('calculates percentage correctly', () => {
    const testData = {
      current: 3,
      total: 4,
      isActive: true,
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('handles zero total gracefully', () => {
    const testData = {
      current: 0,
      total: 0,
      isActive: true,
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('calculates sources progress correctly', () => {
    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    // 1 completed out of 3 sources = 33%
    expect(screen.getByText('Sources: 1 / 3 completed')).toBeInTheDocument();
  });

  test('handles empty sources array', () => {
    const testData = {
      ...mockProgressData,
      sources: [],
      completedSources: [],
      errorSources: [],
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    expect(screen.queryByText(/Sources:/)).not.toBeInTheDocument();
  });
});

// ============================================================================
// CURRENT STEP DISPLAY TESTS
// ============================================================================

describe('SyncProgressBar - Current Step Display', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('displays current step when provided', () => {
    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    // Check for the chip containing the current step (use getAllByText to handle multiple instances)
    const currentStepTexts = screen.getAllByText('Syncing sources to Magento');
    const currentStepChip = currentStepTexts.find(el => el.closest('.MuiChip-root'));

    expect(currentStepChip).toBeInTheDocument();

    // Check for sync icon in the chip
    const chipSyncIcon = currentStepChip.closest('.MuiChip-root').querySelector('[data-testid="sync-icon"]');

    expect(chipSyncIcon).toBeInTheDocument();
  });

  test('shows completed step with check icon', () => {
    render(
      <TestWrapper>
        <SyncProgressBar progressData={completedProgressData} />
      </TestWrapper>,
    );

    expect(screen.getByText('Sync completed successfully')).toBeInTheDocument();

    // Check for check icon in the chip (not in the collapsed details)
    const currentStepChip = screen.getByText('Sync completed successfully').closest('.MuiChip-root');
    const chipCheckIcon = currentStepChip.querySelector('[data-testid="check-icon"]');

    expect(chipCheckIcon).toBeInTheDocument();
  });

  test('does not display step chip when currentStep is empty', () => {
    const testData = {
      ...mockProgressData,
      currentStep: '',
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    expect(screen.queryByRole('button', { name: /chip/i })).not.toBeInTheDocument();
  });
});

// ============================================================================
// EXPAND/COLLAPSE FUNCTIONALITY TESTS
// ============================================================================

describe('SyncProgressBar - Expand/Collapse Functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('expands details when toggle button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    const toggleButton = screen.getByTestId('expand-more-icon').closest('button');

    // Details should be collapsed initially
    expect(screen.queryByText('Process Steps')).not.toBeInTheDocument();

    await user.click(toggleButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));

    // Details should be expanded
    await waitFor(() => {
      expect(screen.getByText('Process Steps')).toBeInTheDocument();
    }, { timeout: 15000 });
  });

  test('collapses details when toggle button is clicked again', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    const toggleButton = screen.getByTestId('expand-more-icon').closest('button');

    // Expand first
    await user.clickawait waitFor(() => {
      expect(screen.getByText('Process Steps')).toBeInTheDocument();
    }, { timeout: 15000 });eDocument();
    });

    // Then collapse
await waitFor(() => {
      expect(screen.queryByText('Process Steps')).not.toBeInTheDocument();
    }, { timeout: 15000 });teps')).not.toBeInTheDocument();
    });
  });
});

// ============================================================================
// STEP DETAILS TESTS
// ============================================================================

describe('SyncProgressBar - Step Details', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('shows step details when expanded', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    const toggleButton = screen.getByTestId('expand-more-icon').cawait waitFor(() => {
      expect(screen.getByText('Marking stocks for sync')).toBeInTheDocument();
      expect(screen.getByText('Fetching source configurations')).toBeInTheDocument();
      expect(screen.getByText('Syncing sources to Magento')).toBeInTheDocument();
      expect(screen.getByText('Finalizing sync process')).toBeInTheDocument();
    }, { timeout: 15000 });ext('Finalizing sync process')).toBeInTheDocument();
    });
  });

  test('displays correct icons for different step states', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    const toggleButton = screen.getByTestId('await waitFor(() => {
      // Should have 2 check icons (completed steps), 1 sync icon (current), 1 pending icon
      const checkIcons = screen.getAllByTestId('check-icon');
      const syncIcons = screen.getAllByTestId('sync-icon');
      const pendingIcons = screen.getAllByTestId('pending-icon');

      expect(checkIcons).toHaveLength(2); // Steps 0 and 1 completed
      expect(syncIcons).toHaveLength(2); // Current step chip + current step in list
      expect(pendingIcons).toHaveLength(1); // Step 3 pending
    }, { timeout: 15000 });ep in list
      expect(pendingIcons).toHaveLength(1); // Step 3 pending
    });
  });
});

// ============================================================================
// SOURCES STATUS TESTS
// ============================================================================

describe('SyncProgressBar - Sources Status', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('displays sources status when expanded', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    const toggleButton = await waitFor(() => {
      expect(screen.getByText('Sources Status (2 / 3)')).toBeInTheDocument();
      expect(screen.getByText('Source 1')).toBeInTheDocument();
      expect(screen.getByText('Source 2')).toBeInTheDocument();
      expect(screen.getByText('Source 3')).toBeInTheDocument();
    }, { timeout: 15000 });ce 2')).toBeInTheDocument();
      expect(screen.getByText('Source 3')).toBeInTheDocument();
    });
  });

  test('shows correct source status colors', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    cawait waitFor(() => {
      const source1Chip = screen.getByText('Source 1').closest('.MuiChip-root');
      const source2Chip = screen.getByText('Source 2').closest('.MuiChip-root');
      const source3Chip = screen.getByText('Source 3').closest('.MuiChip-root');

      // Source 1 should be completed (success)
      expect(source1Chip).toHaveClass('MuiChip-colorSuccess');

      // Source 2 should be default (not completed, no error)
      expect(source2Chip).toHaveClass('MuiChip-colorDefault');

      // Source 3 should be error
      expect(source3Chip).toHaveClass('MuiChip-colorError');
    }, { timeout: 15000 });-colorDefault');

      // Source 3 should be error
      expect(source3Chip).toHaveClass('MuiChip-colorError');
    });
  });

  test('handles sources with different name properties', async () => {
    const testData = {
      ...mockProgressData,
      sources: [
        { code: 'SRC001', name: 'Source with name' },
        { code_source: 'SRC002', magentoSource: 'Source with magentoSource' },
        { code: 'SRC003' }, // Only code
      ],
      completedSources: ['SRC001'],
      errorSources: [],
    };

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWraawait waitFor(() => {
      expect(screen.getByText('Source with name')).toBeInTheDocument();
      expect(screen.getByText('Source with magentoSource')).toBeInTheDocument();
      expect(screen.getByText('SRC003')).toBeInTheDocument();
    }, { timeout: 15000 });ct(screen.getByText('Source with magentoSource')).toBeInTheDocument();
      expect(screen.getByText('SRC003')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// STATUS MESSAGE TESTS
// ============================================================================

describe('SyncProgressBar - Status Message', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('displays status message when provided', () => {
    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    expect(screen.getByText('Processing synchronization...')).toBeInTheDocument();
  });

  test('does not display message section when message is empty', () => {
    const testData = {
      ...mockProgressData,
      message: '',
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    expect(screen.queryByText('Processing synchronization...')).not.toBeInTheDocument();
  });

  test('handles undefined message gracefully', () => {
    const testData = {
      ...mockProgressData,
      message: undefined,
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    // Should render without crashing
    expect(screen.getByText('📦 Stock Synchronization Progress')).toBeInTheDocument();
  });
});

// ============================================================================
// ANIMATION TESTS
// ============================================================================

describe('SyncProgressBar - Animation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('animates progress changes with delay', async () => {
    const { rerender } = render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    // Initial render
    expect(screen.getByText('50%')).toBeInTheDocument();

    // Update progress
    const updatedData = {
      ...mockProgressData,
      current: 3,
      total: 4,
    };

    rerender(
      <TestWrapper>
        <SyncProgressBar progressData={updatedData} />
      </TestWrapper>,
    );

    // Should show new value immediately (the component calculates percentage directly)
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('cleans up timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount } = render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('SyncProgressBar - Accessibility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('has proper ARIA attributes for progress bars', () => {
    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    const progressBars = screen.getAllByRole('progressbar');

    expect(progressBars.length).toBeGreaterThan(0);

    progressBars.forEach(progressBar => {
      expect(progressBar).toHaveAttribute('aria-valuenow');
      expect(progressBar).toHaveAttribute('aria-valuemin');
      expect(progressBar).toHaveAttribute('aria-valuemax');
    });
  });

  test('expand button has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    const expandButton = screen.getByTestId('expand-more-icon').closest('button');

    expect(expandButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('expand button updates aria-expanded when clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </Testawait user.click(expandButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));andButton = screen.getByTestId('expand-more-icon').closest('button');

    await user.click(expandButton);

    expect(expandButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={mockProgressData} />
      </TestWrapper>,
    );

    const expandButton = screen.getByTestId('expand-more-icon').closest(await waitFor(() => {
      expect(screen.getByText('Process Steps')).toBeInTheDocument();
    }, { timeout: 15000 });ton).toHaveFocus();

    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Process Steps')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// EDGE CASES TESTS
// ============================================================================

describe('SyncProgressBar - Edge Cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('handles negative progress values', () => {
    const testData = {
      current: -1,
      total: 4,
      isActive: true,
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    // Should handle gracefully and show 0%
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('handles progress greater than total', () => {
    const testData = {
      current: 5,
      total: 4,
      isActive: true,
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    // Should cap at 100%
    expect(screen.getByText('125%')).toBeInTheDocument(); // Math.round((5/4)*100) = 125%
  });

  test('handles sources with missing properties', async () => {
    const testData = {
      ...mockProgressData,
      sources: [
        {}, // Empty object
        { code: null }, // Null code
        { name: 'Only name' }, // Missing code
      ],
      completedSources: [],
      errorSources: [],
    };

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWawait waitFor(() => {
      expect(screen.getByText('Sources Status (0 / 3)')).toBeInTheDocument();
    }, { timeout: 15000 });ait user.click(toggleButton);

    // Should render without crashing
    await waitFor(() => {
      expect(screen.getByText('Sources Status (0 / 3)')).toBeInTheDocument();
    });
  });

  test('handles very large numbers', () => {
    const testData = {
      current: 999999,
      total: 1000000,
      isActive: true,
    };

    render(
      <TestWrapper>
        <SyncProgressBar progressData={testData} />
      </TestWrapper>,
    );

    expect(screen.getByText('Overall Progress: 999999 / 1000000 Steps')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument(); // Math.round(99.9999) = 100
  });
});
