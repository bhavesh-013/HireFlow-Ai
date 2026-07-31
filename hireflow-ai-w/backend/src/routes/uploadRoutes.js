const express = require('express');
const router = express.Router();
const {
  uploadAndParseResume,
  getUploadHistory,
  deleteUpload,
} = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { uploadDocument } = require('../middleware/uploadMiddleware');

// Protect all upload routes
router.use(protect);

/**
 * Custom middleware to handle both 'file' and 'resume' form-data field names
 */
const handleFileUpload = (req, res, next) => {
  const uploadSingle = uploadDocument.single('file');
  uploadSingle(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) {
      // Try 'resume' as field name fallback
      const uploadResume = uploadDocument.single('resume');
      return uploadResume(req, res, next);
    }
    next();
  });
};

router.post('/resume', handleFileUpload, uploadAndParseResume);
router.get('/history', getUploadHistory);
router.delete('/:id', deleteUpload);

module.exports = router;
