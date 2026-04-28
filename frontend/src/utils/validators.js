/**
 * Utility functions for form validation
 */

export const validators = {
  // String validation
  required: (value, fieldName) => {
    if (!value || value.toString().trim() === '') {
      return `${fieldName} is required`;
    }
    return '';
  },

  minLength: (value, min, fieldName) => {
    if (value && value.toString().trim().length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return '';
  },

  maxLength: (value, max, fieldName) => {
    if (value && value.toString().trim().length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return '';
  },

  // Email validation
  email: (value) => {
    if (!value) return '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  // Phone validation
  phone: (value) => {
    if (!value) return '';
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/; // Allow various formats
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return 'Please enter a valid phone number';
    }
    return '';
  },

  // Password validation
  password: (value, fieldName = 'Password') => {
    if (!value) return `${fieldName} is required`;
    if (value.length < 6) return `${fieldName} must be at least 6 characters`;
    return '';
  },



  // NIC validation (Sri Lanka format)
  nic: (value) => {
    if (!value) return 'NIC is required';
    const nicRegex = /^[\d]{9}[VvXx]?$|^[\d]{12}$/;
    if (!nicRegex.test(value)) {
      return 'Please enter a valid NIC (e.g., 123456789V or 123456789012345)';
    }
    return '';
  },

  // Blood type validation
  bloodType: (value) => {
    const validTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    if (!value || !validTypes.includes(value)) {
      return 'Please select a valid blood type';
    }
    return '';
  },

  // Date validation
  date: (value, fieldName = 'Date') => {
    if (!value) return `${fieldName} is required`;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `${fieldName} must be a valid date`;
    }
    return '';
  },

  // Future date validation
  futureDate: (value, fieldName = 'Date') => {
    const error = validators.date(value, fieldName);
    if (error) return error;
    const date = new Date(value);
    if (date <= new Date()) {
      return `${fieldName} must be in the future`;
    }
    return '';
  },

  // URL validation
  url: (value) => {
    if (!value) return '';
    try {
      new URL(value);
      return '';
    } catch {
      return 'Please enter a valid URL';
    }
  },

  // Match field validation (for password confirmation)
  match: (value, otherValue, fieldName) => {
    if (value !== otherValue) {
      return `${fieldName} does not match`;
    }
    return '';
  }
};

/**
 * Validate multiple fields
 * @param {Object} data - Form data object
 * @param {Object} rules - Validation rules object
 * @returns {Object} - Object with field errors
 */
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = data[field];

    // Handle array of validation functions
    if (Array.isArray(fieldRules)) {
      for (let rule of fieldRules) {
        const error = rule(value);
        if (error) {
          errors[field] = error;
          break; // Stop at first error
        }
      }
    } else if (typeof fieldRules === 'function') {
      const error = fieldRules(value);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

/**
 * Create validation rules for a field
 * @param {...Array} validations - Validation functions
 * @returns {Array} - Array of validation functions
 */
export const createRule = (...validations) => {
  return validations;
};

export default validators;
