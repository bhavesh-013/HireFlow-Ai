const express = require('express');
const router = express.Router();

const {
  createResume,
  getMyResumes,
  getResumeById,
  updateResume,
  deleteResume,
  duplicateResume,
  archiveResume,
  restoreResume,
  toggleFavorite,
  autosaveResume,
  updateSection,
  uploadThumbnail,
} = require('../controllers/resumeController');

const {
  createVersion,
  getVersionHistory,
  restoreVersion,
  deleteVersion,
} = require('../controllers/versionController');

const { switchTemplate } = require('../controllers/templateController');

const {
  createResumeValidation,
  updateResumeValidation,
  autosaveValidation,
  sectionUpdateValidation,
  versionValidation,
  templateSwitchValidation,
} = require('../validators/resumeValidator');

const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { uploadImage } = require('../middleware/uploadMiddleware');

// Protect all resume routes
router.use(protect);

// Core CRUD APIs
router
  .route('/')
  .post(createResumeValidation, validate, createResume)
  .get(getMyResumes);

router
  .route('/:id')
  .get(getResumeById)
  .put(updateResumeValidation, validate, updateResume)
  .delete(deleteResume);

// Special Action APIs
router.post('/:id/duplicate', duplicateResume);
router.post('/:id/archive', archiveResume);
router.post('/:id/restore', restoreResume);
router.post('/:id/favorite', toggleFavorite);
router.put('/:id/autosave', autosaveValidation, validate, autosaveResume);

// Granular Section Update API
router.put(
  '/:id/section/:sectionName',
  sectionUpdateValidation,
  validate,
  updateSection
);

// Thumbnail Upload API
router.post('/:id/thumbnail', uploadImage.single('thumbnail'), uploadThumbnail);

// Template Switch API
router.put('/:id/template', templateSwitchValidation, validate, switchTemplate);

// Resume Versioning APIs
router.get('/:id/history', getVersionHistory);
router.post('/:id/version', versionValidation, validate, createVersion);
router.post('/:id/version/:versionId/restore', restoreVersion);
router.delete('/:id/version/:versionId', deleteVersion);

module.exports = router;
