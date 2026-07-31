const { check } = require('express-validator');

const registerValidation = [
  check('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  check('email')
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
  check('email')
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  check('password').notEmpty().withMessage('Password is required'),
];

const googleLoginValidation = [
  check('idToken')
    .notEmpty()
    .withMessage('Google ID token or credential is required'),
];

const forgotPasswordValidation = [
  check('email')
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

const resetPasswordValidation = [
  check('token').notEmpty().withMessage('Reset token is required'),
  check('password')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

const updateProfileValidation = [
  check('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  check('headline')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Headline cannot exceed 150 characters'),

  check('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),

  check('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array of strings'),
];

module.exports = {
  registerValidation,
  loginValidation,
  googleLoginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
};
