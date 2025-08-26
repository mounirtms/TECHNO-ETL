import { isObject, isString, isNumber, isBoolean, isArray, isFunction } from '../utils/typeUtils';

describe('Type Utility Functions', () => {
  it('should correctly identify an object', () => {
    expect(isObject({})).toBe(true);
    expect(isObject([])).toBe(false);
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject('string')).toBe(false);
  });

  it('should correctly identify a string', () => {
    expect(isString('hello')).toBe(true);
    expect(isString(123)).toBe(false);
  });

  it('should correctly identify a number', () => {
    expect(isNumber(123)).toBe(true);
    expect(isNumber('123')).toBe(false);
  });

  it('should correctly identify a boolean', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(0)).toBe(false);
  });

  it('should correctly identify an array', () => {
    expect(isArray([])).toBe(true);
    expect(isArray({})).toBe(false);
  });

  it('should correctly identify a function', () => {
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction(function() {})).toBe(true);
    expect(isFunction({})).toBe(false);
  });
});
