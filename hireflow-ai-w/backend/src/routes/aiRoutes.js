const express = require('express');
const router = express.Router();
const {
  analyzeAts,
  matchJd,
  getAiSuggestions,
  coachChat,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// All AI routes require authentication
router.use(protect);

// Apply specific rate limiting for AI generation routes
router.post('/ats-analyze', aiLimiter, analyzeAts);
router.post('/jd-match', aiLimiter, matchJd);
router.post('/suggest', aiLimiter, getAiSuggestions);
router.post('/career-coach', aiLimiter, coachChat);

module.exports = router;
