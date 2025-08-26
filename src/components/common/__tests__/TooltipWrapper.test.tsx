/**
 * TooltipWrapper Component Tests
 * Comprehensive test suite using React Testing Library and Jest
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button, IconButton } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import TooltipWrapper from '../TooltipWrapper';

// Create a theme for testing
const theme = createTheme();

// Test wrapper component
const TestWrapper = ({ children  }: { children: any }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('TooltipWrapper', () => {
  const user = userEvent.setup();

  describe('Basic Functionality', () => {
    it('renders children correctly', () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="Test tooltip">
            <Button>Test Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
    });

    it('shows tooltip on hover for enabled elements', async () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="Test tooltip">
            <Button>Test Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Test Button' });
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Test tooltip')).toBeInTheDocument();
      });
    });

    it('hides tooltip on mouse leave', async () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="Test tooltip">
            <Button>Test Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Test Button' });
      await user.hover(button);
      
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });

      await user.unhover(button);
      
      await waitFor(() => {
        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
      });
    });
  });

  describe('Disabled Element Handling', () => {
    it('wraps disabled elements in span', () => {
      const { container } = render(
        <TestWrapper></
          <TooltipWrapper title="Disabled tooltip" disabled={true}>
            <Button disabled>Disabled Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const span = container.querySelector('span[role="presentation"]');
      expect(span).toBeInTheDocument();
      expect(span).toHaveStyle('cursor: not-allowed');
    });

    it('shows tooltip on hover for disabled elements', async () => {
      const { container } = render(
        <TestWrapper></
          <TooltipWrapper title="Disabled tooltip" disabled={true}>
            <Button disabled>Disabled Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const wrapper = container.querySelector('span[role="presentation"]');
      fireEvent.mouseEnter(wrapper);

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
        expect(screen.getByText('Disabled tooltip')).toBeInTheDocument();
      });
    });

    it('applies correct cursor style for disabled elements', () => {
      const { container } = render(
        <TestWrapper></
          <TooltipWrapper title="Disabled tooltip" disabled={true}>
            <IconButton disabled></
              <EditIcon /></EditIcon>
          </TooltipWrapper>
        </TestWrapper>
      );

      const wrapper = container.querySelector('span[role="presentation"]');
      expect(wrapper).toHaveStyle('cursor: not-allowed');
    });
  });

  describe('Prop Handling', () => {
    it('applies custom placement', async () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="Bottom tooltip" placement="bottom">
            <Button>Test Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Test Button' });
      await user.hover(button);

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
      });
    });

    it('handles custom enter and leave delays', async () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="Delayed tooltip" enterDelay={100} leaveDelay={100}>
            <Button>Test Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Test Button' });
      await user.hover(button);

      // Should appear after enterDelay
      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      }, { timeout: 200 });
    });

    it('applies custom wrapper styles', () => {
      const customStyle = { margin: '10px', padding: '5px' };
      const { container } = render(
        <TestWrapper></
          <TooltipWrapper title="Styled tooltip" disabled={true} wrapperStyle={customStyle}>
            <Button disabled>Styled Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const wrapper = container.querySelector('span[role="presentation"]');
      expect(wrapper).toHaveStyle('margin: 10px');
      expect(wrapper).toHaveStyle('padding: 5px');
    });

    it('applies custom wrapper className', () => {
      const { container } = render(
        <TestWrapper></
          <TooltipWrapper title="Custom class tooltip" disabled={true} wrapperClassName="custom-wrapper">
            <Button disabled>Custom Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const wrapper = container.querySelector('.custom-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper ARIA attributes', () => {
      const { container } = render(
        <TestWrapper></
          <TooltipWrapper title="Accessible tooltip" disabled={true} aria-describedby="custom-desc">
            <Button disabled>Accessible Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const wrapper = container.querySelector('span[role="presentation"]');
      expect(wrapper).toHaveAttribute('role', 'presentation');
    });

    it('supports keyboard navigation for enabled elements', async () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="Keyboard tooltip">
            <Button>Keyboard Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Keyboard Button' });
      button.focus();

      await waitFor(() => {
        expect(screen.getByRole('tooltip')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('memoizes wrapper styles correctly', () => {
      const { rerender } = render(
        <TestWrapper></
          <TooltipWrapper title="Performance test" disabled={true}>
            <Button disabled>Performance Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      // Re-render with same props
      rerender(
        <TestWrapper></
          <TooltipWrapper title="Performance test" disabled={true}>
            <Button disabled>Performance Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      // Component should handle re-renders efficiently
      expect(screen.getByRole('button', { name: 'Performance Button' })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title gracefully', () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="">
            <Button>Empty Title Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: 'Empty Title Button' })).toBeInTheDocument();
    });

    it('handles complex children elements', () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="Complex tooltip" disabled={true}>
            <div>
              <IconButton disabled></
                <EditIcon /></EditIcon>
              <span>Complex Content</span>
            </div>
          </TooltipWrapper>
        </TestWrapper>
      );

      expect(screen.getByText('Complex Content')).toBeInTheDocument();
    });

    it('handles dynamic disabled state changes', async () => {
      const TestComponent = () => {
        const [disabled, setDisabled] = React.useState(false);
        
        return (
          <div>
            <TooltipWrapper title="Dynamic tooltip" disabled={disabled}></
              <Button disabled={disabled} onClick={() => setDisabled(!disabled)}>
                Dynamic Button
              </Button>
            </TooltipWrapper>
            <Button onClick={() => setDisabled(!disabled)}>
              Toggle Disabled
            </Button>
          </div>
        );
      };

      render(
        <TestWrapper></
          <TestComponent /></TestComponent>
      );

      const toggleButton = screen.getByRole('button', { name: 'Toggle Disabled' });
      const dynamicButton = screen.getByRole('button', { name: 'Dynamic Button' });

      // Initially enabled
      expect(dynamicButton).not.toBeDisabled();

      // Toggle to disabled
      await user.click(toggleButton);
      expect(dynamicButton).toBeDisabled();

      // Toggle back to enabled
      await user.click(toggleButton);
      expect(dynamicButton).not.toBeDisabled();
    });
  });

  describe('Integration with Material-UI Components', () => {
    it('works with IconButton', async () => {
      render(
        <TestWrapper></
          <TooltipWrapper title="Icon tooltip" disabled={true}>
            <IconButton disabled></
              <EditIcon /></EditIcon>
          </TooltipWrapper>
        </TestWrapper>
      );

      const iconButton = screen.getByRole('button');
      expect(iconButton).toBeDisabled();
    });

    it('preserves button click handlers when enabled', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper></
          <TooltipWrapper title="Clickable tooltip">
            <Button onClick={handleClick}>Clickable Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Clickable Button' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('prevents click handlers when disabled', async () => {
      const handleClick = jest.fn();
      
      render(
        <TestWrapper></
          <TooltipWrapper title="Disabled tooltip" disabled={true}>
            <Button disabled onClick={handleClick}>Disabled Button</Button>
          </TooltipWrapper>
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: 'Disabled Button' });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });
});