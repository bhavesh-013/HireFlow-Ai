const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentResumes } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/recent', getRecentResumes);

module.exports = router;
