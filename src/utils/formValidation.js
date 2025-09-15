/**
 * Form Validation Utilities
 *
 * Modern form validation system with TypeScript support
 * Features:
 * - Field-level validation
 * - Form-level validation
 * - Custom validation rules
 * - Async validation support
 * - Internationalization ready
 *
 * @author Techno-ETL Team
 * @version 2.0.0
 */

/**
 * Built-in validation rules
 */
export const VALIDATION_RULES = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }

    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }

    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return `Must be at least ${min} characters long`;
    }

    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return `Must be no more than ${max} characters long`;
    }

    return null;
  },

  minValue: (min) => (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);

    if (isNaN(numValue) || numValue < min) {
      return `Must be at least ${min}`;
    }

    return null;
  },

  maxValue: (max) => (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);

    if (isNaN(numValue) || numValue > max) {
      return `Must be no more than ${max}`;
    }

    return null;
  },

  numeric: (value) => {
    if (!value) return null;
    if (isNaN(Number(value))) {
      return 'Must be a valid number';
    }

    return null;
  },

  integer: (value) => {
    if (!value) return null;
    const numValue = Number(value);

    if (isNaN(numValue) || !Number.isInteger(numValue)) {
      return 'Must be a valid integer';
    }

    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;

    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number';
    }

    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);

      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  pattern: (regex, message = 'Invalid format') => (value) => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message;
    }

    return null;
  },

  custom: (validatorFn, message = 'Invalid value') => (value) => {
    try {
      const isValid = validatorFn(value);

      if (!isValid) {
        return message;
      }

      return null;
    } catch (error) {
      return message;
    }
  },
};

/**
 * Validate a single field
 * @param {any} value - The field value
 * @param {Object|Array} rules - Validation rules
 * @returns {string|null} Error message or null if valid
 */
export const validateField = (value, rules) => {
  if (!rules) return null;

  // Convert single rule to array
  const ruleArray = Array.isArray(rules) ? rules : [rules];

  for (const rule of ruleArray) {
    let validator;

    if (typeof rule === 'string') {
      // Built-in rule name
      validator = VALIDATION_RULES[rule];
    } else if (typeof rule === 'function') {
      // Custom validator function
      validator = rule;
    } else if (typeof rule === 'object' && rule.type) {
      // Rule object with type and parameters
      const { type, ...params } = rule;

      if (VALIDATION_RULES[type]) {
        if (Object.keys(params).length > 0) {
          // Rule with parameters (e.g., minLength: { type: 'minLength', min: 5 })
          const paramValues = Object.values(params);

          validator = VALIDATION_RULES[type](...paramValues);
        } else {
          validator = VALIDATION_RULES[type];
        }
      }
    }

    if (validator) {
      const error = validator(value);

      if (error) {
        return error;
      }
    }
  }

  return null;
};

/**
 * Validate an entire form
 * @param {Object} formData - The form data object
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Object with errors for each invalid field
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  for (const [fieldName, rules] of Object.entries(validationRules)) {
    const value = formData[fieldName];
    const error = validateField(value, rules);

    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
};

/**
 * Check if form has any errors
 * @param {Object} errors - Errors object from validateForm
 * @returns {boolean} True if form is valid (no errors)
 */
export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0;
};

/**
 * Async field validation
 * @param {any} value - The field value
 * @param {Function} asyncValidator - Async validation function
 * @returns {Promise<string|null>} Promise resolving to error message or null
 */
export const validateFieldAsync = async (value, asyncValidator) => {
  try {
    const result = await asyncValidator(value);

    return result;
  } catch (error) {
    return error.message || 'Validation error';
  }
};

/**
 * Debounced validation for real-time validation
 * @param {Function} validationFn - Validation function
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced validation function
 */
export const createDebouncedValidator = (validationFn, delay = 500) => {
  let timeoutId;

  return (...args) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const result = await validationFn(...args);

        resolve(result);
      }, delay);
    });
  };
};

/**
 * Common validation rule sets for typical use cases
 */
export const COMMON_VALIDATIONS = {
  name: [
    VALIDATION_RULES.required,
    VALIDATION_RULES.minLength(2),
    VALIDATION_RULES.maxLength(50),
  ],

  email: [
    VALIDATION_RULES.required,
    VALIDATION_RULES.email,
  ],

  password: [
    VALIDATION_RULES.required,
    VALIDATION_RULES.minLength(8),
    VALIDATION_RULES.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    ),
  ],

  phone: [
    VALIDATION_RULES.required,
    VALIDATION_RULES.phone,
  ],

  url: [
    VALIDATION_RULES.url,
  ],

  price: [
    VALIDATION_RULES.required,
    VALIDATION_RULES.numeric,
    VALIDATION_RULES.minValue(0),
  ],

  quantity: [
    VALIDATION_RULES.required,
    VALIDATION_RULES.integer,
    VALIDATION_RULES.minValue(1),
  ],

  sku: [
    VALIDATION_RULES.required,
    VALIDATION_RULES.minLength(3),
    VALIDATION_RULES.maxLength(20),
    VALIDATION_RULES.pattern(
      /^[A-Z0-9\-_]+$/,
      'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
    ),
  ],
};

/**
 * Create custom validation rule
 * @param {Function} validator - Validation function
 * @param {string} message - Error message
 * @returns {Function} Validation rule function
 */
export const createValidationRule = (validator, message) => {
  return (value) => {
    try {
      const isValid = validator(value);

      return isValid ? null : message;
    } catch (error) {
      return message;
    }
  };
};

/**
 * Validation rule builder for complex scenarios
 */
export class ValidationRuleBuilder {
  constructor() {
    this.rules = [];
  }

  required(message = 'This field is required') {
    this.rules.push(createValidationRule(
      (value) => value !== null && value !== undefined && value !== '',
      message,
    ));

    return this;
  }

  minLength(min, message = `Must be at least ${min} characters long`) {
    this.rules.push(createValidationRule(
      (value) => !value || value.length >= min,
      message,
    ));

    return this;
  }

  maxLength(max, message = `Must be no more than ${max} characters long`) {
    this.rules.push(createValidationRule(
      (value) => !value || value.length <= max,
      message,
    ));

    return this;
  }

  pattern(regex, message = 'Invalid format') {
    this.rules.push(createValidationRule(
      (value) => !value || regex.test(value),
      message,
    ));

    return this;
  }

  custom(validator, message) {
    this.rules.push(createValidationRule(validator, message));

    return this;
  }

  build() {
    return this.rules;
  }
}

export default {
  validateField,
  validateForm,
  isFormValid,
  validateFieldAsync,
  createDebouncedValidator,
  VALIDATION_RULES,
  COMMON_VALIDATIONS,
  createValidationRule,
  ValidationRuleBuilder,
};
