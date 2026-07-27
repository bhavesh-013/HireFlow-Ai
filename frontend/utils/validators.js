/**
 * HireFlow AI — Form Validators
 */

const Validators = {
  /**
   * Check if value is not empty
   * @param {string} value
   * @returns {{ valid: boolean, message: string }}
   */
  required(value) {
    const valid = value !== null && value !== undefined && value.toString().trim().length > 0;
    return { valid, message: valid ? '' : 'This field is required' };
  },

  /**
   * Validate email format
   * @param {string} email
   * @returns {{ valid: boolean, message: string }}
   */
  email(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = regex.test(email);
    return { valid, message: valid ? '' : 'Please enter a valid email address' };
  },

  /**
   * Validate password strength
   * @param {string} password
   * @returns {{ valid: boolean, message: string, strength: number }}
   */
  password(password) {
    if (!password || password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters', strength: 0 };
    }

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const messages = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const valid = strength >= 2;

    return {
      valid,
      message: valid ? '' : 'Password must contain uppercase, number, or special character',
      strength,
      strengthLabel: messages[strength],
    };
  },

  /**
   * Check if passwords match
   * @param {string} password
   * @param {string} confirmPassword
   * @returns {{ valid: boolean, message: string }}
   */
  passwordMatch(password, confirmPassword) {
    const valid = password === confirmPassword;
    return { valid, message: valid ? '' : 'Passwords do not match' };
  },

  /**
   * Validate minimum length
   * @param {string} value
   * @param {number} min
   * @returns {{ valid: boolean, message: string }}
   */
  minLength(value, min) {
    const valid = value && value.length >= min;
    return { valid, message: valid ? '' : `Must be at least ${min} characters` };
  },

  /**
   * Validate URL format
   * @param {string} url
   * @returns {{ valid: boolean, message: string }}
   */
  url(url) {
    try {
      new URL(url);
      return { valid: true, message: '' };
    } catch {
      return { valid: false, message: 'Please enter a valid URL' };
    }
  },

  /**
   * Validate phone number
   * @param {string} phone
   * @returns {{ valid: boolean, message: string }}
   */
  phone(phone) {
    const regex = /^\+?[\d\s\-()]{10,15}$/;
    const valid = regex.test(phone);
    return { valid, message: valid ? '' : 'Please enter a valid phone number' };
  },

  /**
   * Validate a full form
   * @param {HTMLFormElement} form
   * @param {Object} rules - { fieldName: [validatorFn, ...] }
   * @returns {{ valid: boolean, errors: Object }}
   */
  validateForm(form, rules) {
    const errors = {};
    let formValid = true;

    for (const [field, validators] of Object.entries(rules)) {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input) continue;

      const value = input.value;
      const group = input.closest('.form-group');

      for (const validator of validators) {
        const result = typeof validator === 'function' ? validator(value) : validator;
        if (!result.valid) {
          errors[field] = result.message;
          formValid = false;
          if (group) {
            group.classList.add('form-group--error');
            const errorEl = group.querySelector('.form-group__error');
            if (errorEl) errorEl.textContent = result.message;
          }
          break;
        } else {
          if (group) group.classList.remove('form-group--error');
        }
      }
    }

    return { valid: formValid, errors };
  },

  /**
   * Clear all form errors
   * @param {HTMLFormElement} form
   */
  clearErrors(form) {
    form.querySelectorAll('.form-group--error').forEach((group) => {
      group.classList.remove('form-group--error');
    });
  },
};
