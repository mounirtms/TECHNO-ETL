import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// TextField variants
const textFieldVariants = cva(
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400',
  {
    variants: {
      variant: {
        outlined: 'border-gray-300 focus:border-techno-orange-500 focus:ring-techno-orange-500',
        filled: 'bg-gray-50 border-0 focus:bg-white focus:ring-techno-orange-500 dark:bg-gray-700 dark:focus:bg-gray-800',
        standard: 'border-0 border-b-2 rounded-none px-0 bg-transparent focus:ring-0 focus:border-techno-orange-500',
      },
      size: {
        small: 'h-8 text-xs px-2',
        medium: 'h-10 text-sm px-3',
        large: 'h-12 text-base px-4',
      },
      error: {
        true: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'outlined',
      size: 'medium',
      error: false,
    },
  }
);

// FormControl wrapper
interface FormControlProps {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const FormControl: React.FC<FormControlProps> = ({
  children,
  className,
  error = false,
  disabled = false,
  required = false,
  fullWidth = false,
  size = 'medium',
}) => {
  return (
    <div 
      className={cn(
        'flex flex-col gap-1',
        fullWidth && 'w-full',
        className
      )}
      data-error={error}
      data-disabled={disabled}
      data-required={required}
      data-size={size}
    >
      {children}
    </div>
  );
};

// InputLabel component
interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  required?: boolean;
  error?: boolean;
  shrink?: boolean;
}

export const InputLabel: React.FC<InputLabelProps> = ({
  children,
  required = false,
  error = false,
  shrink = false,
  className,
  ...props
}) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300',
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// FormHelperText component
interface FormHelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  error?: boolean;
}

export const FormHelperText: React.FC<FormHelperTextProps> = ({
  children,
  error = false,
  className,
  ...props
}) => {
  return (
    <p
      className={cn(
        'text-xs',
        error ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

// Main TextField component
interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof textFieldVariants> {
  label?: string;
  helperText?: string;
  error?: boolean;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
  maxRows?: number;
  InputProps?: {
    startAdornment?: React.ReactNode;
    endAdornment?: React.ReactNode;
  };
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({
    className,
    variant,
    size,
    error = false,
    label,
    helperText,
    fullWidth = false,
    multiline = false,
    rows,
    maxRows,
    InputProps,
    required = false,
    ...props
  }, ref) => {
    const hasAdornments = InputProps?.startAdornment || InputProps?.endAdornment;

    const inputElement = multiline ? (
      <textarea
        className={cn(
          textFieldVariants({ variant, size, error }),
          'resize-none',
          hasAdornments && 'pl-10 pr-10',
          className
        )}
        ref={ref as any}
        rows={rows}
        style={{ maxHeight: maxRows ? `${maxRows * 1.5}rem` : undefined }}
        {...(props as any)}
      />
    ) : (
      <input
        className={cn(
          textFieldVariants({ variant, size, error }),
          hasAdornments && 'pl-10 pr-10',
          className
        )}
        ref={ref}
        {...props}
      />
    );

    const field = hasAdornments ? (
      <div className="relative">
        {InputProps?.startAdornment && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {InputProps.startAdornment}
          </div>
        )}
        {inputElement}
        {InputProps?.endAdornment && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {InputProps.endAdornment}
          </div>
        )}
      </div>
    ) : (
      inputElement
    );

    if (label || helperText) {
      return (
        <FormControl 
          error={error} 
          fullWidth={fullWidth} 
          size={size}
          required={required}
        >
          {label && (
            <InputLabel required={required} error={error}>
              {label}
            </InputLabel>
          )}
          {field}
          {helperText && (
            <FormHelperText error={error}>
              {helperText}
            </FormHelperText>
          )}
        </FormControl>
      );
    }

    return field;
  }
);

TextField.displayName = 'TextField';
