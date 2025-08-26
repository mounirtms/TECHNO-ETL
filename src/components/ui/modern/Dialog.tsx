import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { X } from 'lucide-react';

// Dialog context
interface DialogContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
const DialogContext = React.createContext<DialogContextType | null>(null);

// Dialog Root
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
export const Dialog: React.FC<DialogProps> = ({
  open
  onOpenChange,
  defaultOpen
  children,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if(isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open: isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

// Dialog Content
const dialogVariants = cva(
  'fixed z-50 gap-4 bg-white dark:bg-gray-900 p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        full: 'max-w-full w-full h-full',
      },
    },
    defaultVariants: {
      size: 'md',
    },
);

interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogVariants> {
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, size, children, showCloseButton = true, maxWidth, ...props }, ref) => {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error('DialogContent must be used within Dialog');

    const { open, onOpenChange } = context;

    React.useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if(event.key === 'Escape') {
          onOpenChange(false);
      };

      if(open) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }, [open, onOpenChange]);

    if (!open) return null;

    // Map maxWidth to size for compatibility
    const finalSize = maxWidth ? 
      (maxWidth === 'xs' ? 'sm' : 
       maxWidth
        {/* Backdrop */}
        <div
          className
          onClick={() => onOpenChange(false)}
        />
        
        {/* Dialog */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            ref={ref}
            className
              dialogVariants({ size: finalSize }),
              'relative rounded-lg border border-gray-200 dark:border-gray-700',
              className
            )}
            { ...props}
          >
            {showCloseButton && (
              <button
                onClick={() => onOpenChange(false)}
                className
            )}
            {children}
          </div>
        </div>
      </>
    );
);

DialogContent.displayName = 'DialogContent';

// Dialog Header
interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
export const DialogHeader: React.FC<DialogHeaderProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className
      className
    )}
    { ...props}
  >
    {children}
  </div>
);

// Dialog Title
interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
export const DialogTitle: React.FC<DialogTitleProps> = ({
  className,
  children,
  ...props
}) => (
  <h2
    className
      className
    )}
    { ...props}
  >
    {children}
  </h2>
);

// Dialog Actions
interface DialogActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
export const DialogActions: React.FC<DialogActionsProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className
      className
    )}
    { ...props}
  >
    {children}
  </div>
);

// Dialog Trigger (for convenience)
interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  asChild?: boolean;
export const DialogTrigger: React.FC<DialogTriggerProps> = ({
  children,
  asChild
  ...props
}) => {
  const context = React.useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within Dialog');

  const { onOpenChange } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
      ...children.props,
    });
  return (
    <button onClick={() => onOpenChange(true)} { ...props}>
      {children}
    </button>
  );
};
