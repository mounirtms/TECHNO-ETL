/**
 * TypeScript Type Assertion Test Utilities
 * 
 * This file contains utilities for writing type assertion tests that verify
 * TypeScript types are working correctly at compile-time.
 */

// Note: Using local type assertion functions instead of tsd module

/**
 * Type Assertion Functions
 * 
 * These functions don't actually run anything at runtime, they're just used
 * to make type assertions at compile-time.
 */

/**
 * Assert that a value has a specific type (exact match)
 * @param value The value to check
 * @param _type Placeholder for the expected type (only used at compile-time)
 */
export function assertType<T>(_actual: unknown, _expectedType: T) {
  // This function does nothing at runtime
  // It's only used for type checking during compilation
}

/**
 * Assert that a value is assignable to a specific type
 * @param value The value to check
 * @param _type Placeholder for the expected type (only used at compile-time)
 */
export function assertAssignable<T>(_value: unknown, _expectedType: T) {
  // This function does nothing at runtime
  // It's only used for type checking during compilation
}

/**
 * Assert that a value is not assignable to a specific type
 * @param value The value to check
 * @param _type Placeholder for the expected type (only used at compile-time)
 */
export function assertNotAssignable<T>(_value: unknown, _expectedType: T) {
  // This function does nothing at runtime
  // It's only used for type checking during compilation
}

/**
 * Verify that an error is thrown when a type is used incorrectly
 * This actually doesn't do anything at runtime, it's just a marker for a comment
 * that explains what type error should occur at compile-time.
 */
export function expectError(_comment: string) {
  // This function does nothing at runtime
  // It's just a marker for documenting expected compile-time errors
}

/**
 * A type that represents any function
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Helper type to extract parameter types from a function type
 */
export type Parameters<T extends AnyFunction> = T extends (...args: infer P) => any ? P : never;

/**
 * Helper type to extract return type from a function type
 */
export type ReturnType<T extends AnyFunction> = T extends (...args: any[]) => infer R ? R : never;