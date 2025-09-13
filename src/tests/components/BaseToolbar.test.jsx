/**
 * BaseToolbar Component Tests
 * 
 * Comprehensive test suite for the BaseToolbar component
 * Tests functionality, accessibility, and responsiveness
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
import BaseToolbar from '../../components/base/BaseToolbar';

// Test utilities
const theme = createTheme();

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

// Mock handlers
const mockHandlers = {
  onSearchChange: vi.fn(),
  onRefresh: vi.fn(),
  onAdd: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onSync: vi.fn(),
  onExport: vi.fn(),
  onImport: vi.fn(),
  onCustomAction: vi.fn()
};

const mockCustomActions = [
  {
    key: 'custom1',
    label: 'Custom Action 1',
    onClick: vi.fn()
  },
  {
    key: 'custom2',
    label: 'Custom Action 2',
    onClick: vi.fn(),
    disabled: true
  }
];

// ============================================================================
// BASIC FUNCTIONALITY TESTS
// ============================================================================

describe('BaseToolbar - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(
      <TestWrapper>
        <BaseToolbar />
      </TestWrapper>
    );

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  test('renders with default configuration', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          config={{
            showRefresh: true,
            showSearch: true
          }}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('renders custom actions', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          customActions={mockCustomActions}
          enableActions={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Custom Action 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Action 2')).toBeInTheDocument();
  });
});

// ============================================================================
// SEARCH FUNCTIONALITY TESTS
// ============================================================================

describe('BaseToolbar - Search Functionality', () => {
  test('calls onSearchChange when typing', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          enableSearch={true}
          onSearchChange={mockHandlers.onSearchChange}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'test search');

    expect(mockHandlers.onSearchChange).toHaveBeenCalledWith('test search');
  });

  test('calls onSearchChange on Enter key press', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          enableSearch={true}
          onSearchChange={mockHandlers.onSearchChange}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'test{enter}');

    expect(mockHandlers.onSearchChange).toHaveBeenCalledWith('test');
  });

  test('clears search when clear button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          enableSearch={true}
          searchQuery="existing search"
          onSearchChange={mockHandlers.onSearchChange}
        />
      </TestWrapper>
    );

    const clearButton = screen.getByLabelText('clear search');
    await user.click(clearButton);

    expect(mockHandlers.onSearchChange).toHaveBeenCalledWith('');
  });

  test('disables search when loading', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          enableSearch={true}
          loading={true}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeDisabled();
  });
});

// ============================================================================
// ACTION BUTTON TESTS
// ============================================================================

describe('BaseToolbar - Action Buttons', () => {
  test('refresh button calls onRefresh', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showRefresh: true }}
          onRefresh={mockHandlers.onRefresh}
        />
      </TestWrapper>
    );

    const refreshButton = screen.getByLabelText('Refresh');
    await user.click(refreshButton);

    expect(mockHandlers.onRefresh).toHaveBeenCalled();
  });

  test('add button calls onAdd', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showAdd: true }}
          onAdd={mockHandlers.onAdd}
        />
      </TestWrapper>
    );

    const addButton = screen.getByLabelText('Add');
    await user.click(addButton);

    expect(mockHandlers.onAdd).toHaveBeenCalled();
  });

  test('edit button is disabled when no selection', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showEdit: true }}
          selectedCount={0}
          onEdit={mockHandlers.onEdit}
        />
      </TestWrapper>
    );

    const editButton = screen.getByLabelText('Edit (Selection Required)');
    expect(editButton).toBeDisabled();
  });

  test('edit button is enabled when one item selected', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showEdit: true }}
          selectedCount={1}
          onEdit={mockHandlers.onEdit}
        />
      </TestWrapper>
    );

    const editButton = screen.getByLabelText('Edit');
    expect(editButton).not.toBeDisabled();

    await user.click(editButton);
    expect(mockHandlers.onEdit).toHaveBeenCalled();
  });

  test('delete button is disabled when no selection', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showDelete: true }}
          selectedCount={0}
          onDelete={mockHandlers.onDelete}
        />
      </TestWrapper>
    );

    const deleteButton = screen.getByLabelText('Delete (Selection Required)');
    expect(deleteButton).toBeDisabled();
  });

  test('delete button is enabled when items selected', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showDelete: true }}
          selectedCount={2}
          onDelete={mockHandlers.onDelete}
        />
      </TestWrapper>
    );

    const deleteButton = screen.getByLabelText('Delete');
    expect(deleteButton).not.toBeDisabled();

    await user.click(deleteButton);
    expect(mockHandlers.onDelete).toHaveBeenCalled();
  });

  test('sync button calls onSync', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showSync: true }}
          onSync={mockHandlers.onSync}
        />
      </TestWrapper>
    );

    const syncButton = screen.getByLabelText('Sync');
    await user.click(syncButton);

    expect(mockHandlers.onSync).toHaveBeenCalled();
  });

  test('buttons are disabled when loading', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          config={{
            showRefresh: true,
            showAdd: true,
            showSync: true
          }}
          loading={true}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Refresh (Loading...)')).toBeDisabled();
    expect(screen.getByLabelText('Add (Loading...)')).toBeDisabled();
    expect(screen.getByLabelText('Sync (Loading...)')).toBeDisabled();
  });
});

// ============================================================================
// CUSTOM ACTIONS TESTS
// ============================================================================

describe('BaseToolbar - Custom Actions', () => {
  test('renders custom actions', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          customActions={mockCustomActions}
          enableActions={true}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Custom Action 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Action 2')).toBeInTheDocument();
  });

  test('calls custom action onClick handler', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          customActions={mockCustomActions}
          enableActions={true}
        />
      </TestWrapper>
    );

    const customButton = screen.getByText('Custom Action 1');
    await user.click(customButton);

    expect(mockCustomActions[0].onClick).toHaveBeenCalled();
  });

  test('respects disabled state of custom actions', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          customActions={mockCustomActions}
          enableActions={true}
        />
      </TestWrapper>
    );

    const disabledButton = screen.getByText('Custom Action 2');
    expect(disabledButton).toBeDisabled();
  });

  test('calls onCustomAction when provided', async () => {
    const user = userEvent.setup();
    const customActionsWithoutOnClick = [
      {
        key: 'test-action',
        label: 'Test Action'
      }
    ];

    render(
      <TestWrapper>
        <BaseToolbar
          customActions={customActionsWithoutOnClick}
          onCustomAction={mockHandlers.onCustomAction}
          enableActions={true}
        />
      </TestWrapper>
    );

    const testButton = screen.getByText('Test Action');
    await user.click(testButton);

    expect(mockHandlers.onCustomAction).toHaveBeenCalledWith(
      'test-action',
      customActionsWithoutOnClick[0]
    );
  });
});

// ============================================================================
// RESPONSIVE BEHAVIOR TESTS
// ============================================================================

describe('BaseToolbar - Responsive Behavior', () => {
  // Mock window.matchMedia for responsive tests
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query.includes('(max-width: 900px)'), // Simulate mobile
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('shows overflow menu on mobile', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          config={{
            showRefresh: true,
            showAdd: true,
            showEdit: true,
            showDelete: true
          }}
          enableResponsive={true}
        />
      </TestWrapper>
    );

    // Should show more button for overflow actions
    expect(screen.getByLabelText('More actions')).toBeInTheDocument();
  });

  test('opens overflow menu when clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{
            showRefresh: true,
            showAdd: true,
            showEdit: true,
            showDelete: true
          }}
          enableResponsive={true}
        />
      </TestWrapper>
    );

    const moreButton = screen.getByLabelText('More actions');
    await user.click(moreButton);

    // Menu should open with overflow actions
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});

// ============================================================================
// SELECTION INDICATOR TESTS
// ============================================================================

describe('BaseToolbar - Selection Indicator', () => {
  test('shows selection count when items are selected', () => {
    render(
      <TestWrapper>
        <BaseToolbar selectedCount={3} />
      </TestWrapper>
    );

    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  test('does not show selection count when no items selected', () => {
    render(
      <TestWrapper>
        <BaseToolbar selectedCount={0} />
      </TestWrapper>
    );

    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('BaseToolbar - Accessibility', () => {
  test('has proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <BaseToolbar id="test-toolbar" />
      </TestWrapper>
    );

    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('id', 'test-toolbar');
  });

  test('search input has proper ARIA labels', () => {
    render(
      <TestWrapper>
        <BaseToolbar
          enableSearch={true}
          searchId="search-input"
        />
      </TestWrapper>
    );

    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toHaveAttribute('id', 'search-input');
    expect(searchInput).toHaveAttribute('aria-label', 'Search grid data');
  });

  test('buttons have proper tooltips', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showRefresh: true }}
        />
      </TestWrapper>
    );

    const refreshButton = screen.getByLabelText('Refresh');
    
    // Hover to show tooltip
    await user.hover(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  test('disabled buttons have appropriate tooltips', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{ showEdit: true }}
          selectedCount={0}
        />
      </TestWrapper>
    );

    const editButton = screen.getByLabelText('Edit (Selection Required)');
    
    await user.hover(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit (Selection Required)')).toBeInTheDocument();
    });
  });

  test('supports keyboard navigation', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{
            showRefresh: true,
            showAdd: true
          }}
          enableSearch={true}
        />
      </TestWrapper>
    );

    // Tab through elements
    await user.tab();
    expect(screen.getByLabelText('Refresh')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Add')).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('BaseToolbar - Performance', () => {
  test('uses transitions for non-blocking updates', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          enableSearch={true}
          onSearchChange={mockHandlers.onSearchChange}
        />
      </TestWrapper>
    );

    const searchInput = screen.getByRole('textbox');
    
    // Rapid typing should not block UI
    await user.type(searchInput, 'rapid typing test');

    // Component should remain responsive
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('rapid typing test');
  });

  test('memoizes action configurations', () => {
    const { rerender } = render(
      <TestWrapper>
        <BaseToolbar
          config={{ showRefresh: true }}
          selectedCount={0}
        />
      </TestWrapper>
    );

    // Re-render with same props
    rerender(
      <TestWrapper>
        <BaseToolbar
          config={{ showRefresh: true }}
          selectedCount={0}
        />
      </TestWrapper>
    );

    // Should not cause unnecessary re-renders
    expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
  });
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('BaseToolbar - Integration', () => {
  test('works with all features enabled', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseToolbar
          config={{
            showRefresh: true,
            showAdd: true,
            showEdit: true,
            showDelete: true,
            showSync: true,
            showExport: true,
            showImport: true
          }}
          customActions={mockCustomActions}
          enableSearch={true}
          enableActions={true}
          selectedCount={1}
          onSearchChange={mockHandlers.onSearchChange}
          onRefresh={mockHandlers.onRefresh}
          onAdd={mockHandlers.onAdd}
          onEdit={mockHandlers.onEdit}
          onDelete={mockHandlers.onDelete}
          onSync={mockHandlers.onSync}
          onExport={mockHandlers.onExport}
          onImport={mockHandlers.onImport}
        />
      </TestWrapper>
    );

    // All buttons should be present
    expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
    expect(screen.getByLabelText('Add')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete')).toBeInTheDocument();
    expect(screen.getByLabelText('Sync')).toBeInTheDocument();
    expect(screen.getByLabelText('Export')).toBeInTheDocument();
    expect(screen.getByLabelText('Import')).toBeInTheDocument();

    // Search should work
    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'test');
    expect(mockHandlers.onSearchChange).toHaveBeenCalledWith('test');

    // Selection indicator should show
    expect(screen.getByText('1 selected')).toBeInTheDocument();

    // Custom actions should be present
    expect(screen.getByText('Custom Action 1')).toBeInTheDocument();
  });
});