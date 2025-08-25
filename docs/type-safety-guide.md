# TypeScript Type Safety Guide

This document provides guidelines and best practices for maintaining type safety in the Techno-ETL project.

## Core Principles

1. **Explicit Types**: Always declare explicit types rather than relying on inference when the intention isn't obvious.
2. **No Any**: Avoid using `any` type. Use `unknown` or specific types instead.
3. **Strict Null Checking**: Always handle null/undefined values explicitly.
4. **Interface Hierarchies**: Use interface extension to create clear hierarchies.
5. **Documentation**: Document complex types with JSDoc comments.

## Type Definitions

### Where to Define Types

- **Component Props**: Define interfaces in the same file as the component
- **Shared Types**: Define in dedicated type files:
  - `/src/types/index.ts`: Core application types
  - `/src/types/components.ts`: Shared component types
  - `/src/types/baseComponents.ts`: Base component types
  - `/src/types/api.ts`: API request/response types

### Naming Conventions

- **Interfaces**: Use PascalCase, prefixed with purpose:
  - Props interfaces: `ComponentNameProps`
  - State interfaces: `ComponentNameState`
  - Context interfaces: `ContextNameContextProps`
  - Hook return interfaces: `HookNameResult`

- **Type Aliases**: Use PascalCase for complex types, camelCase for simple types

## Best Practices

### Components

```typescript
// Props interface at the top of file
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

// React.FC with explicit props
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  children
}) => {
  // Component logic
};
```

### Hooks

```typescript
// Return type interface
interface UseFormResult<T> {
  values: T;
  errors: Record<keyof T, string | undefined>;
  touched: Record<keyof T, boolean>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  resetForm: () => void;
}

// Generic hook with explicit return type
function useForm<T extends Record<string, any>>(
  initialValues: T, 
  validate?: (values: T) => Partial<Record<keyof T, string>>
): UseFormResult<T> {
  // Hook implementation
}
```

### Context API

```typescript
// Context value interface
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

// Default context value
const defaultAuthContext: AuthContextProps = {
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  signup: async () => {},
};

// Context creation
const AuthContext = createContext<AuthContextProps>(defaultAuthContext);
```

## Event Handling

Use specific event types for event handlers:

```typescript
// Button click event
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {};

// Input change event
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
};

// Form submit event
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
};
```

## API Service Layer

Use strongly-typed API functions:

```typescript
async function fetchUsers(): Promise<ApiResponse<User[]>> {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
```

## Type Assertion Tests

We use type assertion tests to verify that our types work as expected:

```typescript
import { assertType, assertAssignable } from '../__tests__/typeUtils';

it('AuthContextProps has correct structure', () => {
  const contextValue: AuthContextProps = {
    user: null,
    loading: false,
    error: null,
    login: async () => {},
    logout: async () => {},
    signup: async () => {},
  };
  
  assertType(contextValue, {} as AuthContextProps);
});
```

## Running Type Checks

```bash
# Basic type checking
npm run type-check

# Continuous type checking during development
npm run type-check:watch

# Detailed diagnostics
npm run type-check:detailed

# Generate error reports
npm run type-check:ci

# Run type assertion tests
npm run test:types

# Verify final build type safety
npm run build:verify
```

## Common Issues and Solutions

### Handling Nullable Values

```typescript
// Bad: potential null reference
function getUserName(user: User | null) {
  return user.name; // Error: user might be null
}

// Good: check for null
function getUserName(user: User | null) {
  return user ? user.name : "Guest";
}

// Also good: use optional chaining and nullish coalescing
function getUserName(user: User | null) {
  return user?.name ?? "Guest";
}
```

### Type Narrowing

```typescript
// Using type guards
function processValue(value: string | number) {
  if (typeof value === 'string') {
    // value is now treated as string
    return value.toUpperCase();
  } else {
    // value is now treated as number
    return value.toFixed(2);
  }
}

// Using discriminated unions
type Result = 
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

function handleResult(result: Result) {
  if (result.status === 'success') {
    // result.data is available here
    console.log(result.data);
  } else {
    // result.error is available here
    console.error(result.error);
  }
}
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## Contact

For questions about TypeScript implementation in this project, contact:
- Mounir Abderrahmani <mounir.ab@techno-dz.com>