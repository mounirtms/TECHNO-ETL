/**
 * Advanced TypeScript Types using Latest TS 5.3+ Features
 * Includes: satisfies operator, const type parameters, template literal types
 */

// Template Literal Types for CSS Classes
export type TailwindColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'gray' | 'techno';
export type TailwindShade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';
export type TailwindColorClass = `${TailwindColor}-${TailwindShade}`;
export type TailwindBgClass = `bg-${TailwindColorClass}`;
export type TailwindTextClass = `text-${TailwindColorClass}`;

// Component Size Template Literals
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type SpacingSize = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16' | '20' | '24';
export type PaddingClass = `p-${SpacingSize}` | `px-${SpacingSize}` | `py-${SpacingSize}`;
export type MarginClass = `m-${SpacingSize}` | `mx-${SpacingSize}` | `my-${SpacingSize}`;

// Branded Types for Type Safety
export type UserId = string & { readonly __brand: 'UserId' };
export type ProductId = string & { readonly __brand: 'ProductId' };
export type CategoryId = string & { readonly __brand: 'CategoryId' };
export type Timestamp = number & { readonly __brand: 'Timestamp' };

// Helper functions for branded types
export const createUserId = (id: string): UserId => id as UserId;
export const createProductId = (id: string): ProductId => id as ProductId;
export const createCategoryId = (id: string): CategoryId => id as CategoryId;
export const createTimestamp = (ts: number): Timestamp => ts as Timestamp;

// Advanced Conditional Types
export type ExtractArrayType<T> = T extends (infer U)[] ? U : never;
export type KeysOfType<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? K : never }[keyof T];

// Mapped Types for Component Props
export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Const Type Parameters (TS 5.3+)
export interface ConstArray<T extends readonly unknown[]> {
  readonly items: T;
  readonly length: T['length'];
  get<K extends keyof T>(index: K): T[K];
// Advanced Component Props with Template Literals
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
  id?: string;
// Utility Types for Component Variants
export type VariantConfig<T extends Record<string, Record<string, string>>> = {
  [K in keyof T]: keyof T[K];
};

// Advanced Event Handler Types
export type EventHandlerMap = {
  click: MouseEvent;
  change: Event;
  input: InputEvent;
  submit: SubmitEvent;
  keydown: KeyboardEvent;
  keyup: KeyboardEvent;
};

export type EventHandler<T extends keyof EventHandlerMap> = (
  event: EventHandlerMap[T]
) => void;

// Component State Management Types
export type StateUpdater<T> = T | ((prev: T) => T);
export type StateAction<T> = 
  | { type: 'SET'; payload: T }
  | { type: 'UPDATE'; payload: Partial<T> }
  | { type: 'RESET' };

// API Response Types with Discriminated Unions
export type ApiResponse<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };

// Advanced Form Types
export type FormFieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel' 
  | 'url' 
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file';

export interface FormField<T extends FormFieldType = FormFieldType> {
  name: string;
  label: string;
  type: T;
  required?: boolean;
  placeholder?: string;
  validation?: (value: string) => string | null;
  options?: T extends 'select' | 'radio' ? Array<{ value: string; label: string }> : never;
// Grid Column Configuration with Advanced Types
export interface GridColumn<T = any> {
  id: string;
  field: keyof T;
  headerName: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
  type?: 'string' | 'number' | 'date' | 'boolean' | 'actions';
  renderCell?: (params: { value: T[keyof T]; row: T; field: keyof T }) => React.ReactNode;
  valueGetter?: (row: T) => unknown;
  valueFormatter?: (value: unknown) => string;
// Theme Configuration Types
export interface ThemeConfig {
  readonly colors: {
    readonly primary: TailwindColorClass;
    readonly secondary: TailwindColorClass;
    readonly success: TailwindColorClass;
    readonly warning: TailwindColorClass;
    readonly error: TailwindColorClass;
  };
  readonly spacing: {
    readonly xs: SpacingSize;
    readonly sm: SpacingSize;
    readonly md: SpacingSize;
    readonly lg: SpacingSize;
    readonly xl: SpacingSize;
  };
  readonly typography: {
    readonly fontFamily: string;
    readonly sizes: Record<ComponentSize, string>;
  };
// Component Variant System
export interface ComponentVariants {
  variant?: {
    primary: string;
    secondary: string;
    outline: string;
    ghost: string;
  };
  size?: {
    sm: string;
    md: string;
    lg: string;
  };
  color?: {
    default: string;
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
  };
// Performance Monitoring Types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: Timestamp;
  category: 'render' | 'network' | 'memory' | 'interaction';
export interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  memoryUsage?: number;
  metrics: PerformanceMetric[];
// Data Table Types with Advanced Filtering
export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between';

export interface FilterCondition<T = any> {
  field: keyof T;
  operator: FilterOperator;
  value: unknown;
  caseSensitive?: boolean;
export interface SortCondition<T = any> {
  field: keyof T;
  direction: 'asc' | 'desc';
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
export interface DataTableState<T = any> {
  data: T[];
  filteredData: T[];
  filters: FilterCondition<T>[];
  sorting: SortCondition<T>[];
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
// Utility type for exact object matching
export type Exact<T, U> = T extends U ? (U extends T ? T : never) : never;

// Advanced React Component Types
export type ComponentWithRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>;
export type ComponentWithoutRef<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>;

// Polymorphic Component Types
export interface PolymorphicProps<T extends React.ElementType = 'div'> {
  as?: T;
  children?: React.ReactNode;
export type PolymorphicComponent<T extends React.ElementType> = PolymorphicProps<T> & 
  Omit<React.ComponentPropsWithoutRef<T>, keyof PolymorphicProps>;

// Hook Return Types
export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  reset: () => void;
export interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
// Configuration objects with satisfies operator
export const defaultTheme = {
  colors: {
    primary: 'techno-500',
    secondary: 'gray-600',
    success: 'green-500',
    warning: 'yellow-500',
    error: 'red-500',
  },
  spacing: {
    xs: '1',
    sm: '2',
    md: '4',
    lg: '6',
    xl: '8',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
    },
  },
} as const satisfies ThemeConfig;

// Type-safe configuration
export const componentVariants = {
  button: {
    variant: {
      primary: 'bg-techno-500 text-white hover:bg-techno-600',
      secondary: 'bg-gray-500 text-white hover:bg-gray-600',
      outline: 'border border-techno-500 text-techno-500 hover:bg-techno-500 hover:text-white',
      ghost: 'text-techno-500 hover:bg-techno-50',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
  input: {
    variant: {
      default: 'border-gray-300 focus:border-techno-500 focus:ring-techno-500',
      error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    },
  },
} as const satisfies Record<string, ComponentVariants>;

// Export the type for use in components
export type ButtonVariants = typeof componentVariants.button;
export type InputVariants = typeof componentVariants.input;
