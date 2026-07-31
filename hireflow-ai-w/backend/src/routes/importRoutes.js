const express = require('express');
const router = express.Router();
const {
  importLinkedInPdf,
  importGitHubData,
} = require('../controllers/importController');
const { protect } = require('../middleware/authMiddleware');
const { uploadDocument } = require('../middleware/uploadMiddleware');

// Protect all import routes
router.use(protect);

/**
 * Custom middleware to handle both 'file' and 'linkedinPdf' form-data field names
 */
const handleLinkedInUpload = (req, res, next) => {
  const uploadSingle = uploadDocument.single('file');
  uploadSingle(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) {
      const uploadLinkedIn = uploadDocument.single('linkedinPdf');
      return uploadLinkedIn(req, res, next);
    }
    next();
  });
};

router.post('/linkedin', handleLinkedInUpload, importLinkedInPdf);
router.post('/github', importGitHubData);

module.exports = router;
