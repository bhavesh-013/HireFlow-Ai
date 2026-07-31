const { check, param } = require('express-validator');

const createResumeValidation = [
  check('title')
    .notEmpty()
    .withMessage('Resume title is required')
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Resume title must be between 1 and 120 characters'),

  check('template')
    .optional()
    .trim()
    .isString()
    .withMessage('Template must be a string identifier'),
];

const updateResumeValidation = [
  check('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Resume title must be between 1 and 120 characters'),

  check('template')
    .optional()
    .trim()
    .isString()
    .withMessage('Template must be a valid template string'),

  check('visibility')
    .optional()
    .isIn(['private', 'public', 'unlisted'])
    .withMessage('Visibility must be private, public, or unlisted'),

  check('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
];

const autosaveValidation = [
  check('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Title cannot exceed 120 characters'),

  check('resumeData')
    .optional()
    .isObject()
    .withMessage('resumeData must be an object'),
];

const sectionUpdateValidation = [
  param('sectionName')
    .isIn([
      'personalInfo',
      'summary',
      'experience',
      'education',
      'projects',
      'skills',
      'certifications',
      'achievements',
      'languages',
      'links',
      'customSections',
    ])
    .withMessage('Invalid section name provided'),
];

const versionValidation = [
  check('name')
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage('Version name cannot exceed 80 characters'),

  check('notes')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Version notes cannot exceed 300 characters'),
];

const templateSwitchValidation = [
  check('template')
    .notEmpty()
    .withMessage('Template identifier is required')
    .trim(),
];

module.exports = {
  createResumeValidation,
  updateResumeValidation,
  autosaveValidation,
  sectionUpdateValidation,
  versionValidation,
  templateSwitchValidation,
};
