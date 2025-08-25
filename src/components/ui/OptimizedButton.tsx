import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import type { ComponentWithoutRef } from '@/types/advanced';

// Enhanced button variants with advanced TypeScript patterns
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
    'select-none touch-manipulation',
    'relative overflow-hidden',
    // Performance optimizations
    'will-change-transform',
    'transform-gpu',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-techno-500 to-techno-600',
          'text-white shadow-lg shadow-techno-500/25',
          'hover:from-techno-600 hover:to-techno-700',
          'hover:shadow-xl hover:shadow-techno-500/30',
          'active:scale-[0.98]',
          'focus:ring-techno-500',
        ],
        secondary: [
          'bg-gradient-to-r from-gray-500 to-gray-600',
          'text-white shadow-lg shadow-gray-500/25',
          'hover:from-gray-600 hover:to-gray-700',
          'hover:shadow-xl hover:shadow-gray-500/30',
          'active:scale-[0.98]',
          'focus:ring-gray-500',
        ],
        outline: [
          'border-2 border-techno-500 text-techno-600',
          'bg-white dark:bg-transparent',
          'hover:bg-techno-500 hover:text-white',
          'hover:shadow-lg hover:shadow-techno-500/25',
          'active:scale-[0.98]',
          'focus:ring-techno-500',
          'dark:text-techno-400 dark:border-techno-400',
          'dark:hover:bg-techno-400 dark:hover:text-gray-900',
        ],
        ghost: [
          'text-techno-600 dark:text-techno-400',
          'hover:bg-techno-50 dark:hover:bg-techno-950',
          'hover:text-techno-700 dark:hover:text-techno-300',
          'active:bg-techno-100 dark:active:bg-techno-900',
          'focus:ring-techno-500',
        ],
        destructive: [
          'bg-gradient-to-r from-red-500 to-red-600',
          'text-white shadow-lg shadow-red-500/25',
          'hover:from-red-600 hover:to-red-700',
          'hover:shadow-xl hover:shadow-red-500/30',
          'active:scale-[0.98]',
          'focus:ring-red-500',
        ],
      },
      size: {
        xs: 'h-7 px-2.5 text-xs gap-1',
        sm: 'h-8 px-3 text-sm gap-1.5',
        md: 'h-10 px-4 text-base gap-2',
        lg: 'h-12 px-6 text-lg gap-2.5',
        xl: 'h-14 px-8 text-xl gap-3',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

// Enhanced props interface using advanced TypeScript features
export interface OptimizedButtonProps
  extends ComponentWithoutRef<'button'>,
  VariantProps<typeof buttonVariants> {
  /** Loading state with spinner */
  loading?: boolean;
  /** Icon displayed before the text */
  leftIcon?: React.ReactNode;
  /** Icon displayed after the text */
  rightIcon?: React.ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Performance optimization - prevent unnecessary re-renders */
  'data-testid'?: string;
  /** Accessibility label */
  'aria-label'?: string;
}

// Loading spinner component with optimized animations
const LoadingSpinner = React.memo(({ size }: { size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | null }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  } as const;

  const actualSize = size || 'md';

  return (
    <svg
      className
        sizeClasses[actualSize],
        'text-current'
      )}
      fill
});

LoadingSpinner.displayName = 'LoadingSpinner';

// Main component using React.forwardRef with advanced TypeScript patterns
export const OptimizedButton = React.forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  (
    {
      className,
      variant,
      size="small"
      loading
      leftIcon,
      rightIcon,
      children,
      disabled,
      tooltip,
      type
      onClick,
      ...props
    },
    ref
  ) => {
    // Performance optimization: memoize click handler
    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      [loading, disabled, onClick]
    );

    // Performance optimization: memoize button content
    const buttonContent = React.useMemo(() => {
      if (loading) {
        return (
          <>
            <LoadingSpinner size={size || 'md'} />
            <span className="opacity-70">Loading...</span>
          </>
        );
      }

      return Boolean((
        <>
          {leftIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {children && <span className="truncate">{children}</span>}
          {rightIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )))));
    }, [loading, size, leftIcon, children, rightIcon]);

    const buttonElement = (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    );

    // Conditionally wrap with tooltip
    if (tooltip) {
      return (
        <div className="group relative">
          {buttonElement}
          <div
            className
              'bg-gray-900 text-white text-xs rounded py-1 px-2',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'pointer-events-none whitespace-nowrap z-50',
              'before:content-[""] before:absolute before:top-full before:left-1/2',
              'before:-translate-x-1/2 before:border-4 before:border-transparent',
              'before:border-t-gray-900'
            )}
            role
            {tooltip}
          </div>
        </div>
      );
    }

    return buttonElement;
  }
);

OptimizedButton.displayName = 'OptimizedButton';

// Export variants for external use
export { buttonVariants };

// Advanced hook for button state management
export function useButtonState(initialLoading = false) {
  const [loading, setLoading] = React.useState(initialLoading);

  const withLoading = React.useCallback(async (asyncFn: () => Promise<void>) => {
    setLoading(true);
    try {
      await asyncFn();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    setLoading,
    withLoading,
  } as const;
}

// Type-safe button group component
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const ButtonGroup = React.memo<ButtonGroupProps>(
  ({ children, orientation = 'horizontal', spacing = 'md', className }) => {
    const spacingClasses = {
      none: '',
      sm: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
      md: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
      lg: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
    } as const;

    return (
      <div
        className
          orientation
          spacingClasses[spacing],
          className
        )}
        role
        {children}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';
