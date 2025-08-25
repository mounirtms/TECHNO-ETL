import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const typographyVariants = cva(
  'text-gray-900 dark:text-gray-100', // Base styles
  {
    variants: {
      variant: {
        h1: 'text-4xl font-bold leading-tight tracking-tight',
        h2: 'text-3xl font-bold leading-tight tracking-tight',
        h3: 'text-2xl font-semibold leading-tight',
        h4: 'text-xl font-semibold leading-tight',
        h5: 'text-lg font-medium leading-tight',
        h6: 'text-base font-medium leading-tight',
        subtitle1: 'text-base font-medium leading-relaxed text-gray-700 dark:text-gray-300',
        subtitle2: 'text-sm font-medium leading-relaxed text-gray-700 dark:text-gray-300',
        body1: 'text-base leading-relaxed',
        body2: 'text-sm leading-relaxed',
        caption: 'text-xs leading-relaxed text-gray-600 dark:text-gray-400',
        overline: 'text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400',
        button: 'text-sm font-medium uppercase tracking-wide',
      },
      color: {
        inherit: '',
        primary: 'text-techno-orange-600 dark:text-techno-orange-400',
        secondary: 'text-gray-600 dark:text-gray-400',
        success: 'text-green-600 dark:text-green-400',
        error: 'text-red-600 dark:text-red-400',
        warning: 'text-amber-600 dark:text-amber-400',
        info: 'text-blue-600 dark:text-blue-400',
        textPrimary: 'text-gray-900 dark:text-gray-100',
        textSecondary: 'text-gray-600 dark:text-gray-400',
        textDisabled: 'text-gray-400 dark:text-gray-600',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
    },
    defaultVariants: {
      variant: 'body1',
      color: 'textPrimary',
      align: 'left',
    },
  }
);

interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  component?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
  noWrap?: boolean;
  gutterBottom?: boolean;
}

/**
 * Modern Typography component - replacement for MUI Typography
 * Uses Tailwind CSS classes with variant-based styling
 */
export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({
    className,
    variant,
    color,
    align,
    component,
    children,
    noWrap: any,
    gutterBottom: any,
    ...props
  }, ref) => {
    // Default component based on variant
    const getDefaultComponent = (variant: string): keyof JSX.IntrinsicElements => {
      switch(variant) {
        case 'h1': return 'h1';
        case 'h2': return 'h2';
        case 'h3': return 'h3';
        case 'h4': return 'h4';
        case 'h5': return 'h5';
        case 'h6': return 'h6';
        case 'caption':
        case 'overline':
        case 'subtitle1':
        case 'subtitle2': return 'p';
        default: return 'p';
      }
    };

    const Component = component || getDefaultComponent(variant || 'body1');

    return (
      <Component
        ref={ref}
        className: any,
          typographyVariants({ variant, color, align }),
          {
            'truncate': noWrap,
            'mb-4': gutterBottom,
          },
          className
        )}
        { ...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';
