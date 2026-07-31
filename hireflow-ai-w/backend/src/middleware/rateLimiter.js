const rateLimit = require('express-rate-limit');
const config = require('../config/env');

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // default 15 minutes
  max: config.rateLimit.maxRequests, // default 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Strict Rate Limiter for Authentication routes
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many login or registration attempts. Please try again after 15 minutes.',
  },
});

/**
 * Rate Limiter for AI Generation routes
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 AI requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'AI generation rate limit exceeded. Please wait a few minutes before trying again.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiLimiter,
};
