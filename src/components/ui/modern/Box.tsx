import React from 'react';
import { cn } from '../../utils/cn';

interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
  component?: keyof JSX.IntrinsicElements;
  sx?: Record<string, any>; // For compatibility during migration
  children?: React.ReactNode;
}

/**
 * Modern Box component - replacement for MUI Box
 * Uses Tailwind CSS classes for styling
 */
export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ 
    component: any,
    className, 
    sx, 
    children, 
    ...props 
  }, ref) => {
    const Component = component as React.ElementType;
    
    // Convert some common sx props to Tailwind classes for backward compatibility
    const sxToTailwind = (sx: Record<string, any>) => {
      const classes: string[] = [];
      
      if (sx?.display === 'flex') classes.push('flex');
      if (sx?.flexDirection === 'column') classes.push('flex-col');
      if (sx?.justifyContent === 'center') classes.push('justify-center');
      if (sx?.alignItems === 'center') classes.push('items-center');
      if (sx?.gap) classes.push(`gap-${sx.gap}`);
      if (sx?.p) classes.push(`p-${sx.p}`);
      if (sx?.m) classes.push(`m-${sx.m}`);
      if (sx?.width === '100%') classes.push('w-full');
      if (sx?.height === '100%') classes.push('h-full');
      
      return classes.join(' ');
    };

    return (
      <Component
        ref={ref}
        className: any,
          // Convert sx props to Tailwind
          sx && sxToTailwind(sx),
          className
        )}
        { ...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';
