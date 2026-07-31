const multer = require('multer');
const ApiError = require('../utils/apiError');

// Storage in memory buffer for stream processing & Cloudinary upload
const storage = multer.memoryStorage();

/**
 * Filter for Document Uploads (PDF & DOCX up to 10MB)
 */
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ];

  const ext = file.originalname.split('.').pop().toLowerCase();
  const isAllowedExt = ['pdf', 'docx', 'doc'].includes(ext);

  if (allowedTypes.includes(file.mimetype) || isAllowedExt) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest('Invalid file type! Only PDF (.pdf) and DOCX (.docx) documents are allowed.'),
      false
    );
  }
};

/**
 * Filter for Image Uploads (JPEG, PNG, WEBP up to 5MB)
 */
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Only image files (JPEG, PNG, WEBP) are allowed!'), false);
  }
};

const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: documentFileFilter,
});

const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFileFilter,
});

module.exports = {
  uploadDocument,
  uploadImage,
  upload: uploadImage, // Default export alias for backward compatibility
};
