import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva(
  "rounded-xl border transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 shadow-soft",
        elevated: "bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 shadow-medium hover:shadow-hard",
        outlined: "bg-transparent border-gray-300 dark:border-dark-600",
        ghost: "bg-transparent border-transparent",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  footer?: React.ReactNode;
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    padding, 
    title, 
    subtitle, 
    actions, 
    headerClassName,
    contentClassName,
    footerClassName,
    footer,
    children, 
    ...props 
  }, ref) => {
    const hasHeader = Boolean(title || subtitle || actions);

    return (
      <div
        className={cn(cardVariants({ variant, padding: hasHeader || footer ? "none" : padding, className }))}
        ref={ref}
        { ...props}
      >
        {hasHeader && (
          <div className={cn(
            "border-b border-gray-200 dark:border-dark-700 p-6 pb-4",
            headerClassName
          )}>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className={cn(
          (hasHeader || footer) && "p-6",
          contentClassName
        )}>
          {children}
        </div>
        
        {footer && (
          <div className={cn(
            "border-t border-gray-200 dark:border-dark-700 p-6 pt-4",
            footerClassName
          )}>
            {footer}
          </div>
        )}
      </div>
    );
);

Card.displayName = "Card";

// Card subcomponents
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className
      className
    )}
    { ...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6", className)}
    { ...props}
  />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className
      className
    )}
    { ...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, cardVariants };
