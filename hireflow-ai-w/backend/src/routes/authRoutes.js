const express = require('express');
const router = express.Router();

const {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  updateProfile,
} = require('../controllers/authController');

const {
  registerValidation,
  loginValidation,
  googleLoginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
} = require('../validators/authValidator');

const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting & validation
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/google', authLimiter, googleLoginValidation, validate, googleLogin);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidation, validate, resetPassword);

// Protected routes (Requires valid JWT)
router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);

module.exports = router;
