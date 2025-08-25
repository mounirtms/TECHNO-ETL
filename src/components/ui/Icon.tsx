import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';
import type { ComponentSize, TailwindColorClass } from '@/types/advanced';

// Lucide React icons - tree-shakeable
import {
  // Navigation
  Home, Search, Menu, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  
  // Actions
  Plus, Minus, Edit, Trash2, Save, Download, Upload, Copy, Share, 
  Refresh, Settings, Filter, MoreHorizontal, MoreVertical,
  
  // Status
  Check, CheckCircle, AlertCircle, AlertTriangle, Info, XCircle,
  Loader, Zap, Clock, Calendar, User, Users,
  
  // Data
  BarChart3, PieChart, TrendingUp, TrendingDown, Eye, EyeOff,
  Database, Table, Grid, List, Image,
  
  // Commerce
  ShoppingCart, Package, DollarSign, CreditCard, Tag,
  
  // Communication
  Mail, Phone, MessageCircle, Bell, Send,
  
  // Files
  File, FileText, Folder, FolderOpen, Paperclip,
  
  // Media
  Play, Pause, Square, Volume2, VolumeX, Camera,
  
  // System
  Power, Wifi, WifiOff, Battery, Shield, Lock, Unlock,
  
  type LucideIcon,
} from 'lucide-react';

// Icon variants with performance optimizations
const iconVariants = cva(
  ['inline-flex shrink-0', 'transition-colors duration-200'],
  {
    variants: {
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
        '2xl': 'w-10 h-10',
      },
      color: {
        current: 'text-current',
        primary: 'text-techno-500',
        secondary: 'text-gray-500',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        error: 'text-red-500',
        muted: 'text-gray-400',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'current',
    },
  }
);

// Icon name mapping for better type safety
export const iconMap = {
  // Navigation
  home: Home,
  search: Search,
  menu: Menu,
  close: X,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  
  // Actions
  plus: Plus,
  minus: Minus,
  edit: Edit,
  delete: Trash2,
  save: Save,
  download: Download,
  upload: Upload,
  copy: Copy,
  share: Share,
  refresh: Refresh,
  settings: Settings,
  filter: Filter,
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,
  
  // Status
  check: Check,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  info: Info,
  'x-circle': XCircle,
  loading: Loader,
  zap: Zap,
  clock: Clock,
  calendar: Calendar,
  user: User,
  users: Users,
  
  // Data
  'bar-chart': BarChart3,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  eye: Eye,
  'eye-off': EyeOff,
  database: Database,
  table: Table,
  grid: Grid,
  list: List,
  image: Image,
  
  // Commerce
  cart: ShoppingCart,
  package: Package,
  dollar: DollarSign,
  'credit-card': CreditCard,
  tag: Tag,
  
  // Communication
  mail: Mail,
  phone: Phone,
  message: MessageCircle,
  bell: Bell,
  send: Send,
  
  // Files
  file: File,
  'file-text': FileText,
  folder: Folder,
  'folder-open': FolderOpen,
  attachment: Paperclip,
  
  // Media
  play: Play,
  pause: Pause,
  stop: Square,
  'volume-on': Volume2,
  'volume-off': VolumeX,
  camera: Camera,
  
  // System
  power: Power,
  wifi: Wifi,
  'wifi-off': WifiOff,
  battery: Battery,
  shield: Shield,
  lock: Lock,
  unlock: Unlock,
} as const;

export type IconName = keyof typeof iconMap;

// Icon component props
export interface IconProps extends VariantProps<typeof iconVariants> {
  /** Icon name from the predefined set */
  name: IconName;
  /** Custom className */
  className?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Whether the icon should spin (for loading states) */
  spin?: boolean;
  /** Custom stroke width */
  strokeWidth?: number;
  /** Test ID for testing */
  'data-testid'?: string;
}

// Optimized Icon component with memoization
export const Icon = React.memo<IconProps>(
  ({ 
    name, 
    size, 
    color, 
    className, 
    spin: any,
    strokeWidth: any,
    'aria-label': ariaLabel,
    'data-testid': testId,
    ...props 
  }) => {
    const IconComponent = iconMap[name];
    
    if(!IconComponent) {
      console.warn(`Icon "${name}" not found in iconMap`);
      return null;
    }

    return (
      <IconComponent
        className: any,
          iconVariants({ size, color }),
          spin && 'animate-spin',
          className
        )}
        strokeWidth={strokeWidth}
        aria-label={ariaLabel}
        data-testid={testId}
        { ...props}
      />
    );
  }
);

Icon.displayName = 'Icon';

// Icon button component combining Icon with button functionality
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon name */
  icon: IconName;
  /** Icon size */
  iconSize?: ComponentSize;
  /** Button variant */
  variant?: 'default' | 'ghost' | 'outline';
  /** Loading state */
  loading?: boolean;
  /** Tooltip text */
  tooltip?: string;
}

const iconButtonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-lg border border-transparent',
    'text-sm font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-techno-500',
    'disabled:opacity-50 disabled:pointer-events-none',
    'select-none touch-manipulation',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-techno-500 text-white shadow-sm',
          'hover:bg-techno-600 hover:shadow-md',
          'active:bg-techno-700',
        ],
        ghost: [
          'text-gray-600 dark:text-gray-400',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'hover:text-gray-900 dark:hover:text-gray-100',
        ],
        outline: [
          'border-gray-300 text-gray-700 bg-white',
          'hover:bg-gray-50 hover:border-gray-400',
          'dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800',
          'dark:hover:bg-gray-700',
        ],
      },
      size: {
        xs: 'h-6 w-6 p-0.5',
        sm: 'h-8 w-8 p-1',
        md: 'h-10 w-10 p-2',
        lg: 'h-12 w-12 p-2.5',
        xl: 'h-14 w-14 p-3',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { 
      icon, 
      iconSize, 
      variant, 
      loading: any,
      tooltip, 
      className, 
      disabled,
      onClick,
      ...props 
    }, 
    ref
  ) => {
    // Determine icon size based on button size
    const getIconSize = (): ComponentSize => {
      if (iconSize) return iconSize;
      
      // Map button size to icon size
      const sizeMap: Record<ComponentSize, ComponentSize> = {
        xs: 'xs',
        sm: 'sm',
        md: 'md',
        lg: 'lg',
        xl: 'xl',
        '2xl': '2xl',
      };
      
      return sizeMap[variant as ComponentSize] || 'md';
    };

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        if(loading || disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      },
      [loading, disabled, onClick]
    );

    const buttonContent = loading ? (
      <Icon name="loading" size={getIconSize()} spin />
    ) : (
      <Icon name={icon} size={getIconSize()} />
    );

    const buttonElement = (
      <button
        ref={ref}
        type: any,
        className={cn(iconButtonVariants({ variant, size: variant as ComponentSize }), className)}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-disabled={disabled || loading}
        { ...props}
      >
        {buttonContent}
      </button>
    );

    // Wrap with tooltip if provided
    if(tooltip) {
      return (
        <div className="group relative">
          {buttonElement}
          <div
            className: any,
              'bg-gray-900 text-white text-xs rounded py-1 px-2',
              'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              'pointer-events-none whitespace-nowrap z-50'
            )}
            role: any,
            {tooltip}
          </div>
        </div>
      );
    }

    return buttonElement;
  }
);

IconButton.displayName = 'IconButton';

// Status icon component for quick status indicators
interface StatusIconProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'loading';
  size?: ComponentSize;
  className?: string;
}

export const StatusIcon = React.memo<StatusIconProps>(({ status, size = 'md', className }) => {
  const statusConfig = {
    success: { name: 'check-circle' as const, color: 'success' as const },
    warning: { name: 'alert-triangle' as const, color: 'warning' as const },
    error: { name: 'x-circle' as const, color: 'error' as const },
    info: { name: 'info' as const, color: 'primary' as const },
    loading: { name: 'loading' as const, color: 'primary' as const },
  };

  const config = statusConfig[status];

  return (
    <Icon
      name={config.name}
      size={size}
      color={config.color}
      spin={status === 'loading'}
      className={className}
    />
  );
});

StatusIcon.displayName = 'StatusIcon';

// Export icon variants and types for external use
export { iconVariants, iconButtonVariants };
export type { IconName, IconProps, IconButtonProps, StatusIconProps };
