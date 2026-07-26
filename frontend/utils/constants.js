/**
 * HireFlow AI — Application Constants
 */

const API_BASE_URL = 'http://localhost:3000/api';

const ROUTES = {
  LANDING: '/frontend/pages/landing/index.html',
  LOGIN: '/frontend/pages/login/login.html',
  SIGNUP: '/frontend/pages/signup/signup.html',
  DASHBOARD: '/frontend/pages/dashboard/dashboard.html',
  TEMPLATES: '/frontend/pages/templates/templates.html',
  FORGOT_PASSWORD: '/frontend/pages/login/forgot-password.html',
};

const RESUME_SECTIONS = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'achievements',
  'positions',
  'languages',
  'interests',
];

const USER_TYPES = {
  STUDENT: 'student',
  FRESHER: 'fresher',
  EXPERIENCED: 'experienced',
};

const ATS_WEIGHTS = {
  formatting: 0.15,
  keywords: 0.25,
  readability: 0.15,
  sections: 0.20,
  grammar: 0.10,
  length: 0.15,
};

const PASSWORD_MIN_LENGTH = 8;

const TOAST_DURATION = 4000;

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'Session expired. Please log in again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
};

const TEMPLATE_TYPES = {
  ATS: 'ats',
  MODERN: 'modern',
  MINIMAL: 'minimal',
  PROFESSIONAL: 'professional',
};
