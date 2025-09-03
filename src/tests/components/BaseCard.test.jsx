/**
 * BaseCard Component Tests
 *
 * Comprehensive test suite for the BaseCard component
 * Tests different card variants, animations, and accessibility
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Component under test
import BaseCard from '../../components/base/BaseCard';

// Mock dependencies
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) =>
      <div ref={ref} {...props}>{children}</div>,
    ),
  },
  AnimatePresence: ({ children }) => children,
}));

vi.mock('@mui/icons-material', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon">↗</div>,
  TrendingDown: () => <div data-testid="trending-down-icon">↘</div>,
  TrendingFlat: () => <div data-testid="trending-flat-icon">→</div>,
  Info: () => <div data-testid="info-icon">ℹ</div>,
  Warning: () => <div data-testid="warning-icon">⚠</div>,
  Error: () => <div data-testid="error-icon">❌</div>,
  CheckCircle: () => <div data-testid="check-icon">✓</div>,
}));

// Test utilities
const theme = createTheme();

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const mockStats = {
  total: 1250,
  active: 1100,
  inactive: 150,
  selected: 0,
};

const mockProgressConfig = {
  value: 75,
  max: 100,
  showPercentage: true,
};

// ============================================================================
// BASIC FUNCTIONALITY TESTS
// ============================================================================

describe('BaseCard - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <BaseCard title="Test Card" />
      </TestWrapper>,
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
  });

  test('displays title and value', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Revenue"
          value="$125,000"
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$125,000')).toBeInTheDocument();
  });

  test('displays subtitle when provided', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Orders"
          value="1,234"
          subtitle="Last 30 days"
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  test('displays custom content', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Custom Card"
          content={<div>Custom content here</div>}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Custom Card')).toBeInTheDocument();
    expect(screen.getByText('Custom content here')).toBeInTheDocument();
  });

  test('handles click events', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseCard
          title="Clickable Card"
          onClick={onClick}
        />
      </TestWrapper>,
    );

    const card = screen.getByRole('button');

    await user.click(card);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// CARD VARIANTS TESTS
// ============================================================================

describe('BaseCard - Variants', () => {
  test('renders stats variant correctly', () => {
    render(
      <TestWrapper>
        <BaseCard
          variant="stats"
          title="Total Products"
          value="1,250"
          stats={mockStats}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Total Products')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
    // Should have stats-specific styling
    expect(screen.getByText('Total Products').closest('.MuiCard-root')).toHaveClass('stats-card');
  });

  test('renders info variant with appropriate styling', () => {
    render(
      <TestWrapper>
        <BaseCard
          variant="info"
          type="info"
          title="Information"
          value="Important notice"
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    expect(screen.getByText('Information').closest('.MuiCard-root')).toHaveClass('info-card');
  });

  test('renders action variant as clickable card', () => {
    const onClick = vi.fn();

    render(
      <TestWrapper>
        <BaseCard
          variant="action"
          title="Add New Item"
          onClick={onClick}
        />
      </TestWrapper>,
    );

    const card = screen.getByRole('button');

    expect(card).toBeInTheDocument();
    expect(screen.getByText('Add New Item')).toBeInTheDocument();
  });

  test('renders metric variant with value emphasis', () => {
    render(
      <TestWrapper>
        <BaseCard
          variant="metric"
          title="Conversion Rate"
          value="3.4%"
          color="success"
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('3.4%')).toBeInTheDocument();
    expect(screen.getByText('3.4%')).toHaveClass('metric-value');
  });

  test('renders progress variant with progress bar', () => {
    render(
      <TestWrapper>
        <BaseCard
          variant="progress"
          title="Upload Progress"
          progress={mockProgressConfig}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Upload Progress')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});

// ============================================================================
// INFORMATION TYPES TESTS
// ============================================================================

describe('BaseCard - Information Types', () => {
  test('renders info type with info icon', () => {
    render(
      <TestWrapper>
        <BaseCard
          type="info"
          title="Information"
          value="This is an info message"
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    expect(screen.getByText('Information').closest('.MuiCard-root')).toHaveClass('MuiCard-colorInfo');
  });

  test('renders warning type with warning icon', () => {
    render(
      <TestWrapper>
        <BaseCard
          type="warning"
          title="Warning"
          value="This is a warning message"
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    expect(screen.getByText('Warning').closest('.MuiCard-root')).toHaveClass('MuiCard-colorWarning');
  });

  test('renders error type with error icon', () => {
    render(
      <TestWrapper>
        <BaseCard
          type="error"
          title="Error"
          value="This is an error message"
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    expect(screen.getByText('Error').closest('.MuiCard-root')).toHaveClass('MuiCard-colorError');
  });

  test('renders success type with success icon', () => {
    render(
      <TestWrapper>
        <BaseCard
          type="success"
          title="Success"
          value="This is a success message"
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    expect(screen.getByText('Success').closest('.MuiCard-root')).toHaveClass('MuiCard-colorSuccess');
  });
});

// ============================================================================
// TREND INDICATORS TESTS
// ============================================================================

describe('BaseCard - Trend Indicators', () => {
  test('displays upward trend correctly', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Sales"
          value="$50,000"
          trend="up"
          percentage={15.5}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    expect(screen.getByText('+15.5%')).toBeInTheDocument();
    expect(screen.getByText('+15.5%')).toHaveClass('trend-positive');
  });

  test('displays downward trend correctly', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Orders"
          value="234"
          trend="down"
          percentage={8.2}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
    expect(screen.getByText('-8.2%')).toBeInTheDocument();
    expect(screen.getByText('-8.2%')).toHaveClass('trend-negative');
  });

  test('displays flat trend correctly', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Customers"
          value="1,456"
          trend="flat"
          percentage={0}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('trending-flat-icon')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0%')).toHaveClass('trend-neutral');
  });

  test('handles trend without percentage', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Revenue"
          value="$75,000"
          trend="up"
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});

// ============================================================================
// PROGRESS FUNCTIONALITY TESTS
// ============================================================================

describe('BaseCard - Progress Functionality', () => {
  test('displays progress bar with correct value', () => {
    render(
      <TestWrapper>
        <BaseCard
          variant="progress"
          title="Task Completion"
          progress={mockProgressConfig}
        />
      </TestWrapper>,
    );

    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  test('handles progress without percentage display', () => {
    const progressConfig = {
      value: 60,
      max: 100,
      showPercentage: false,
    };

    render(
      <TestWrapper>
        <BaseCard
          variant="progress"
          title="Upload"
          progress={progressConfig}
        />
      </TestWrapper>,
    );

    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    expect(screen.queryByText('60%')).not.toBeInTheDocument();
  });

  test('handles custom progress maximum', () => {
    const progressConfig = {
      value: 75,
      max: 200,
      showPercentage: true,
    };

    render(
      <TestWrapper>
        <BaseCard
          variant="progress"
          title="Custom Scale"
          progress={progressConfig}
        />
      </TestWrapper>,
    );

    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    expect(progressBar).toHaveAttribute('aria-valuemax', '200');
    expect(screen.getByText('37.5%')).toBeInTheDocument(); // 75/200 * 100
  });
});

// ============================================================================
// LOADING STATE TESTS
// ============================================================================

describe('BaseCard - Loading State', () => {
  test('shows loading skeleton when loading', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Loading Card"
          loading={true}
        />
      </TestWrapper>,
    );

    expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Loading Card')).not.toBeInTheDocument();
  });

  test('shows content when not loading', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Loaded Card"
          value="Data here"
          loading={false}
        />
      </TestWrapper>,
    );

    expect(screen.queryByTestId('card-skeleton')).not.toBeInTheDocument();
    expect(screen.getByText('Loaded Card')).toBeInTheDocument();
    expect(screen.getByText('Data here')).toBeInTheDocument();
  });

  test('loading skeleton has proper accessibility', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Loading Card"
          loading={true}
        />
      </TestWrapper>,
    );

    const skeleton = screen.getByTestId('card-skeleton');

    expect(skeleton).toHaveAttribute('aria-busy', 'true');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('BaseCard - Accessibility', () => {
  test('has proper role when clickable', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Clickable Card"
          onClick={vi.fn()}
        />
      </TestWrapper>,
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('has proper role when not clickable', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Static Card"
        />
      </TestWrapper>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  test('has proper ARIA labels for progress', () => {
    render(
      <TestWrapper>
        <BaseCard
          variant="progress"
          title="File Upload"
          progress={mockProgressConfig}
        />
      </TestWrapper>,
    );

    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveAttribute('aria-label', 'File Upload progress');
    expect(progressBar).toHaveAttribute('aria-describedby');
  });

  test('supports keyboard navigation when clickable', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseCard
          title="Keyboard Card"
          onClick={onClick}
        />
      </TestWrapper>,
    );

    const card = screen.getByRawait user.keyboard('{Enter}');
    // Add small delay to prevent act warnings
    await new Promise(resolawait user.keyboard(' ');
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50)); 50));and press Enter
    card.focus();
    expect(card).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);

    // Press Space
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  test('has proper color contrast indicators', () => {
    render(
      <TestWrapper>
        <BaseCard
          type="error"
          title="Error Card"
          color="error"
        />
      </TestWrapper>,
    );

    const card = screen.getByRole('article');

    expect(card).toHaveClass('MuiCard-colorError');
    expect(card).toHaveAttribute('data-contrast-level', 'high');
  });
});

// ============================================================================
// DISMISS FUNCTIONALITY TESTS
// ============================================================================

describe('BaseCard - Dismiss Functionality', () => {
  test('shows dismiss button when dismissible', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Dismissible Card"
          dismissible={true}
          onDismiss={vi.fn()}
        />
      </TestWrapper>,
    );

    expect(screen.getByLabelText(/dismiss/i)).toBeInTheDocument();
  });

  test('calls onDismiss when dismiss button is clicked', async () => {
    const onDismiawait user.click(dismissButton);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));userEvent.setup();

    render(
      <TestWrapper>
        <BaseCard
          title="Dismissible Card"
          dismissible={true}
          onDismiss={onDismiss}
        />
      </TestWrapper>,
    );

    const dismissButton = screen.getByLabelText(/dismiss/i);

    await user.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('hides dismiss button when not dismissible', () => {
    render(
      <TestWrapper>
        <BaseCard
          title="Non-dismissible Card"
          dismissible={false}
        />
      </TestWrapper>,
    );

    expect(screen.queryByLabelText(/dismiss/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// CUSTOM ACTIONS TESTS
// ============================================================================

describe('BaseCard - Custom Actions', () => {
  test('renders custom actions', () => {
    const actions = (
      <div>
        <button>Edit</button>
        <button>Delete</button>
      </div>
    );

    render(
      <TestWrapper>
        <BaseCard
          title="Card with Actions"
          actions={actions}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('positions actions correctly', () => {
    const actions = <button>Action</button>;

    render(
      <TestWrapper>
        <BaseCard
          title="Card with Actions"
          actions={actions}
        />
      </TestWrapper>,
    );

    const actionsContainer = screen.getByText('Action').closest('.card-actions');

    expect(actionsContainer).toBeInTheDocument();
    expect(actionsContainer).toHaveClass('actions-top-right');
  });
});

// ============================================================================
// STATS CARD SPECIFIC TESTS
// ============================================================================

describe('BaseCard - Stats Card Specific', () => {
  test('displays stats data correctly', () => {
    render(
      <TestWrapper>
        <BaseCard
          variant="stats"
          title="Product Statistics"
          stats={mockStats}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Total: 1250')).toBeInTheDocument();
    expect(screen.getByText('Active: 1100')).toBeInTheDocument();
    expect(screen.getByText('Inactive: 150')).toBeInTheDocument();
  });

  test('highlights selected items in stats', () => {
    const statsWithSelection = { ...mockStats, selected: 5 };

    render(
      <TestWrapper>
        <BaseCard
          variant="stats"
          title="Product Statistics"
          stats={statsWithSelection}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Selected: 5')).toBeInTheDocument();
    expect(screen.getByText('Selected: 5')).toHaveClass('stats-selected');
  });

  test('uses stats config when provided', () => {
    const statsConfig = {
      stats: [
        { key: 'total', title: 'Total Items', color: 'primary' },
        { key: 'active', title: 'Active Items', color: 'success' },
      ],
    };

    render(
      <TestWrapper>
        <BaseCard
          variant="stats"
          config={statsConfig}
          stats={mockStats}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('Total Items: 1250')).toBeInTheDocument();
    expect(screen.getByText('Active Items: 1100')).toBeInTheDocument();
  });
});

// ============================================================================
// RESPONSIVE DESIGN TESTS
// ============================================================================

describe('BaseCard - Responsive Design', () => {
  test('adapts layout for mobile screens', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <TestWrapper>
        <BaseCard
          title="Responsive Card"
          value="$1,000"
          trend="up"
          percentage={5}
        />
      </TestWrapper>,
    );

    const card = screen.getByRole('article');

    expect(card).toHaveClass('mobile-layout');
  });

  test('stacks content vertically on small screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480,
    });

    render(
      <TestWrapper>
        <BaseCard
          title="Stacked Card"
          value="Data"
          subtitle="Subtitle"
          trend="up"
        />
      </TestWrapper>,
    );

    const card = screen.getByRole('article');

    expect(card).toHaveClass('vertical-layout');
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('BaseCard - Performance', () => {
  test('uses React.memo for optimization', () => {
    const TestComponent = () => {
      const [count, setCount] = React.useState(0);

      return (
        <div>
          <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
          <BaseCard title="Memoized Card" />
        </div>
      );
    };

    const { rerender } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    const card = screen.getByRole('article');
    const cardInstance = card;

    rerender(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Card should be memoized and not re-render unnecessarily
    expect(screen.getByRole('article')).toBe(cardInstance);
  });

  test('handles frequent progress updates efficiently', () => {
    const TestComponent = () => {
      const [progress, setProgress] = React.useState(0);

      React.useEffect(() => {
        const interval = setInterval(() => {
          setProgress(p => (p + 1) % 101);
        }, 10);

        return () => clearInterval(interval);
      }, []);

      return (
        <BaseCard
          variant="progress"
          title="Progress Test"
          progress={{ value: progress, max: 100, showPercentage: true }}
        />
      );
    };

    const startTime = performance.now();

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render efficiently even with frequent updates
    expect(renderTime).toBeLessThan(50);
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('BaseCard - Error Handling', () => {
  test('handles missing props gracefully', () => {
    render(
      <TestWrapper>
        <BaseCard />
      </TestWrapper>,
    );

    // Should render without crashing
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  test('handles invalid progress values gracefully', () => {
    const invalidProgress = {
      value: 'invalid',
      max: 100,
    };

    render(
      <TestWrapper>
        <BaseCard
          variant="progress"
          title="Invalid Progress"
          progress={invalidProgress}
        />
      </TestWrapper>,
    );

    // Should render without crashing and show 0 progress
    const progressBar = screen.getByRole('progressbar');

    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
  });

  test('handles null stats gracefully', () => {
    render(
      <TestWrapper>
        <BaseCard
          variant="stats"
          title="Null Stats"
          stats={null}
        />
      </TestWrapper>,
    );

    // Should render without crashing
    expect(screen.getByText('Null Stats')).toBeInTheDocument();
  });

  test('handles click errors gracefully', async () => {
    cawait user.click(card);
    // Add small delay to prevent act warnings
    await new Promise(resolve => setTimeout(resolve, 50));fn().mockImplementation(() => {
      throw new Error('Click error');
    });

    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseCard
          title="Error Card"
          onClick={errorOnClick}
        />
      </TestWrapper>,
    );

    const card = screen.getByRole('button');

    // Should not crash the component when click handler throws
    await user.click(card);

    expect(errorOnClick).toHaveBeenCalled();
    expect(screen.getByText('Error Card')).toBeInTheDocument();
  });
});
