/**
 * BaseDialog Component Tests
 * 
 * Comprehensive test suite for the BaseDialog component
 * Tests React 18 features, form handling, and accessibility
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
import BaseDialog from '../../components/base/BaseDialog';

// Mock dependencies
vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children, fallback: FallbackComponent, onError }) => {
    try {
      return children;
    } catch (error) {
      return <FallbackComponent error={error} resetErrorBoundary={() => {}} />;
    }
  }
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ children, ...props }, ref) => 
      <div ref={ref} {...props}>{children}</div>
    ),
    form: React.forwardRef(({ children, ...props }, ref) => 
      <form ref={ref} {...props}>{children}</form>
    )
  },
  AnimatePresence: ({ children }) => children
}));

// Test utilities
const theme = createTheme();

const TestWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

const mockFormFields = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    required: true
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: true
  },
  {
    key: 'description',
    label: 'Description',
    type: 'text',
    multiline: true,
    rows: 4
  }
];

const mockValidationRules = {
  name: {
    type: 'required',
    message: 'Name is required'
  },
  email: {
    type: 'email',
    message: 'Invalid email format'
  }
};

const mockData = {
  name: 'John Doe',
  email: 'john@example.com',
  description: 'Test description'
};

// ============================================================================
// BASIC FUNCTIONALITY TESTS
// ============================================================================

describe('BaseDialog - Basic Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders when open is true', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
        />
      </TestWrapper>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  test('does not render when open is false', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={false}
          onClose={vi.fn()}
          title="Test Dialog"
        />
      </TestWrapper>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('displays custom content', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
          content={<div>Custom content here</div>}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Custom content here')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={onClose}
          title="Test Dialog"
        />
      </TestWrapper>
    );

    const closeButton = screen.getByLabelText(/close/i);
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={onClose}
          title="Test Dialog"
        />
      </TestWrapper>
    );

    // Click on backdrop (outside the dialog content)
    const backdrop = screen.getByRole('presentation').firstChild;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// DIALOG TYPES TESTS
// ============================================================================

describe('BaseDialog - Dialog Types', () => {
  test('renders add dialog correctly', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="add"
          onClose={vi.fn()}
          fields={mockFormFields}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/add/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  test('renders edit dialog correctly', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="edit"
          onClose={vi.fn()}
          fields={mockFormFields}
          data={mockData}
        />
      </TestWrapper>
    );

    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });

  test('renders delete dialog correctly', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="delete"
          onClose={vi.fn()}
          config={{
            title: 'Delete Item',
            confirmMessage: 'Are you sure you want to delete this item?'
          }}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  test('renders confirm dialog correctly', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="confirm"
          onClose={vi.fn()}
          title="Confirm Action"
          content={<div>Do you want to proceed?</div>}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Do you want to proceed?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
});

// ============================================================================
// FORM HANDLING TESTS
// ============================================================================

describe('BaseDialog - Form Handling', () => {
  test('renders form fields correctly', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          fields={mockFormFields}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  test('handles different field types correctly', () => {
    const fields = [
      { key: 'text', label: 'Text Field', type: 'text' },
      { key: 'email', label: 'Email Field', type: 'email' },
      { key: 'password', label: 'Password Field', type: 'password' },
      { key: 'number', label: 'Number Field', type: 'number' },
      { key: 'textarea', label: 'Textarea Field', type: 'text', multiline: true }
    ];

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          fields={fields}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Text Field')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Email Field')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Password Field')).toHaveAttribute('type', 'password');
    expect(screen.getByLabelText('Number Field')).toHaveAttribute('type', 'number');
    expect(screen.getByLabelText('Textarea Field')).toHaveAttribute('rows', '4');
  });

  test('validates required fields', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          onSubmit={onSubmit}
          fields={mockFormFields}
          validationRules={mockValidationRules}
        />
      </TestWrapper>
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('validates email format', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          fields={mockFormFields}
          validationRules={mockValidationRules}
        />
      </TestWrapper>
    );

    const emailField = screen.getByLabelText('Email');
    await user.type(emailField, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="add"
          onClose={vi.fn()}
          onSubmit={onSubmit}
          fields={mockFormFields}
        />
      </TestWrapper>
    );

    // Fill out the form
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.type(screen.getByLabelText('Description'), 'Test description');

    // Submit
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        description: 'Test description'
      }, 'add');
    });
  });

  test('shows loading state during submission', async () => {
    const onSubmit = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          onSubmit={onSubmit}
          fields={[{ key: 'name', label: 'Name', type: 'text' }]}
        />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText('Name'), 'Test');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles form submission errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          onSubmit={onSubmit}
          fields={[{ key: 'name', label: 'Name', type: 'text' }]}
        />
      </TestWrapper>
    );

    await user.type(screen.getByLabelText('Name'), 'Test');

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('BaseDialog - Accessibility', () => {
  test('has proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
        />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('focuses on dialog when opened', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
        />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(document.activeElement).toBe(dialog);
  });

  test('traps focus within dialog', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
          fields={[
            { key: 'field1', label: 'Field 1', type: 'text' },
            { key: 'field2', label: 'Field 2', type: 'text' }
          ]}
        />
      </TestWrapper>
    );

    const field1 = screen.getByLabelText('Field 1');
    const field2 = screen.getByLabelText('Field 2');
    const closeButton = screen.getByLabelText(/close/i);

    // Tab through elements
    await user.tab();
    expect(field1).toHaveFocus();

    await user.tab();
    expect(field2).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /save/i })).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    // Tab should cycle back to beginning
    await user.tab();
    expect(field1).toHaveFocus();
  });

  test('closes on Escape key press', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={onClose}
          title="Test Dialog"
        />
      </TestWrapper>
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('prevents escape key closure when disabled', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={onClose}
          title="Test Dialog"
          disableEscapeKeyDown={true}
        />
      </TestWrapper>
    );

    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });

  test('has proper form labels and error associations', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          fields={mockFormFields}
          validationRules={mockValidationRules}
        />
      </TestWrapper>
    );

    const nameField = screen.getByLabelText('Name');
    expect(nameField).toHaveAttribute('aria-required', 'true');

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByText('Name is required');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(nameField).toHaveAttribute('aria-describedby');
    });
  });
});

// ============================================================================
// CONFIGURATION TESTS
// ============================================================================

describe('BaseDialog - Configuration', () => {
  test('applies custom maxWidth', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
          maxWidth="lg"
        />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.closest('.MuiDialog-paper')).toHaveClass('MuiDialog-paperMaxWidthLg');
  });

  test('applies fullWidth when specified', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
          fullWidth={true}
        />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.closest('.MuiDialog-paper')).toHaveClass('MuiDialog-paperFullWidth');
  });

  test('displays custom submit button text', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          fields={[{ key: 'test', label: 'Test', type: 'text' }]}
          config={{
            submitLabel: 'Create Item',
            submitColor: 'success'
          }}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: 'Create Item' });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveClass('MuiButton-colorSuccess');
  });

  test('shows dangerous action styling', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="delete"
          onClose={vi.fn()}
          config={{
            dangerous: true
          }}
        />
      </TestWrapper>
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toHaveClass('MuiButton-colorError');
  });
});

// ============================================================================
// RESPONSIVE DESIGN TESTS
// ============================================================================

describe('BaseDialog - Responsive Design', () => {
  test('adapts to mobile screen size', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
        />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.closest('.MuiDialog-paper')).toHaveClass('MuiDialog-paperFullScreen');
  });

  test('uses scroll body on mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
          fields={Array.from({ length: 20 }, (_, i) => ({
            key: `field${i}`,
            label: `Field ${i}`,
            type: 'text'
          }))}
        />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog.closest('.MuiDialog-root')).toHaveClass('MuiDialog-scrollBody');
  });
});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

describe('BaseDialog - Performance', () => {
  test('uses React.memo for optimization', () => {
    const TestComponent = () => {
      const [count, setCount] = React.useState(0);
      return (
        <div>
          <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
          <BaseDialog
            open={true}
            onClose={vi.fn()}
            title="Test Dialog"
          />
        </div>
      );
    };

    const { rerender } = render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const dialog = screen.getByRole('dialog');
    const dialogInstance = dialog;

    rerender(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Dialog should be memoized and not re-render unnecessarily
    expect(screen.getByRole('dialog')).toBe(dialogInstance);
  });

  test('handles large forms efficiently', () => {
    const largeFieldSet = Array.from({ length: 100 }, (_, i) => ({
      key: `field${i}`,
      label: `Field ${i}`,
      type: 'text'
    }));

    const startTime = performance.now();

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          fields={largeFieldSet}
        />
      </TestWrapper>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within reasonable time (less than 100ms)
    expect(renderTime).toBeLessThan(100);
    
    // All fields should be present
    expect(screen.getByLabelText('Field 0')).toBeInTheDocument();
    expect(screen.getByLabelText('Field 99')).toBeInTheDocument();
  });
});

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('BaseDialog - Error Handling', () => {
  test('handles missing field configuration gracefully', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          fields={null}
        />
      </TestWrapper>
    );

    // Should render without crashing
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('handles invalid validation rules gracefully', async () => {
    const user = userEvent.setup();
    const invalidRules = {
      name: null // Invalid rule
    };

    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          type="form"
          onClose={vi.fn()}
          fields={[{ key: 'name', label: 'Name', type: 'text' }]}
          validationRules={invalidRules}
        />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /save/i });
    
    // Should not crash when validation runs
    await user.click(submitButton);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('displays error messages properly', () => {
    render(
      <TestWrapper>
        <BaseDialog
          open={true}
          onClose={vi.fn()}
          title="Test Dialog"
          error="Something went wrong"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});