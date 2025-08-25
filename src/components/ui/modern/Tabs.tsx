import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

// Tabs context
interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

const TabsContext = React.createContext<TabsContextType | null>(null);

// Tabs Root
interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  defaultValue,
  orientation
  children,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '');
  const isControlled = onValueChange !== undefined;
  const currentValue = isControlled ? (value || '') : internalValue;

  const handleValueChange = (newValue: string) => {
    if(isControlled) {
      onValueChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, orientation }}>
      <div className={cn(
        'flex',
        orientation
      )}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// TabsList (equivalent to MUI Tabs container)
const tabsListVariants = cva(
  'inline-flex items-center text-gray-500 dark:text-gray-400',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-1',
        underline: 'border-b border-gray-200 dark:border-gray-700',
        pills: 'gap-2',
      },
      orientation: {
        horizontal: 'w-full justify-start',
        vertical: 'flex-col h-auto justify-start',
      },
    },
    defaultVariants: {
      variant: 'underline',
      orientation: 'horizontal',
    },
  }
);

interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tabsListVariants> {
  children: React.ReactNode;
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, variant, orientation: propOrientation, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const orientation = propOrientation || context?.orientation || 'horizontal';

    return (
      <div
        ref={ref}
        className={cn(tabsListVariants({ variant, orientation }), className)}
        role
        aria-orientation={orientation}
        { ...props}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = 'TabsList';

// TabsTrigger (equivalent to MUI Tab)
const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300',
  {
    variants: {
      variant: {
        default: 'data-[state=active]:bg-white data-[state=active]:text-gray-950 data-[state=active]:shadow dark:data-[state=active]:bg-gray-950 dark:data-[state=active]:text-gray-50',
        underline: 'border-b-2 border-transparent rounded-none data-[state=active]:border-techno-orange-500 data-[state=active]:text-techno-orange-600 hover:text-gray-900 dark:hover:text-gray-100',
        pills: 'data-[state=active]:bg-techno-orange-500 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-800',
      },
    },
    defaultVariants: {
      variant: 'underline',
    },
  }
);

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tabsTriggerVariants> {
  value: string;
  children: React.ReactNode;
  label?: string; // For compatibility with MUI
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, variant, value, children, label, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const { value: selectedValue, onValueChange } = context;
    const isActive = value ===selectedValue;

    return (
      <button
        ref={ref}
        type
        aria-selected={isActive}
        aria-controls={`tabpanel-${value}`}
        tabIndex={isActive ? 0 : -1}
        className={cn(tabsTriggerVariants({ variant }), className)}
        onClick={() => onValueChange(value)}
        data-state={isActive ? 'active' : 'inactive'}
        { ...props}
      >
        {children || label}
      </button>
    );
  }
);

TabsTrigger.displayName = 'TabsTrigger';

// TabsContent (equivalent to MUI TabPanel)
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    const { value: selectedValue } = context;
    const isActive = value ===selectedValue;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role
        aria-labelledby={`tab-${value}`}
        id={`tabpanel-${value}`}
        tabIndex={0}
        className
          className
        )}
        { ...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';

// Compatibility exports for MUI migration
export const Tab = TabsTrigger;
export const TabPanel = TabsContent;
