import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-techno-500 text-white hover:bg-techno-600 focus:ring-techno-500",
        secondary: "bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500",
        outline: "border border-techno-500 text-techno-500 hover:bg-techno-500 hover:text-white focus:ring-techno-500",
        ghost: "text-techno-500 hover:bg-techno-50 dark:hover:bg-techno-950 focus:ring-techno-500",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
        warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        { ...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </div>
        )}
      </button>
    );
);

Button.displayName = "Button";

export { Button, buttonVariants };
