const cloudinary = require('../config/cloudinary');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * Upload raw document (PDF, DOCX) or image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Destination folder
 * @param {string} resourceType - 'auto', 'raw', or 'image'
 * @returns {Promise<{url: string, publicId: string, secureUrl: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'hireflow_resumes', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    // Dev fallback if Cloudinary credentials are not set
    if (!config.cloudinary.cloudName || config.cloudinary.cloudName === 'your_cloudinary_cloud_name') {
      const devUrl = `https://res.cloudinary.com/demo/image/upload/sample.png`;
      console.log('[Dev Notice]: Cloudinary credentials not configured. Returning mock Cloudinary URL.');
      return resolve({
        url: devUrl,
        secureUrl: devUrl,
        publicId: `dev_mock_${Date.now()}`,
      });
    }

    const uploadOptions = {
      folder,
      resource_type: resourceType,
    };

    if (resourceType === 'image') {
      uploadOptions.transformation = [{ width: 1200, crop: 'limit' }, { quality: 'auto' }];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          return reject(ApiError.internal(`Cloudinary upload failed: ${error.message}`));
        }
        resolve({
          url: result.secure_url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete asset from Cloudinary
 * @param {string} publicId - Cloudinary asset public ID
 * @param {string} resourceType - 'image' or 'raw'
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId || publicId.startsWith('dev_mock_')) return;
  if (!config.cloudinary.cloudName || config.cloudinary.cloudName === 'your_cloudinary_cloud_name') return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error(`[Cloudinary Delete Error]: ${error.message}`);
  }
};

/**
 * Replace file in Cloudinary (deletes old and uploads new)
 * @param {Buffer} newFileBuffer
 * @param {string} oldPublicId
 * @param {string} folder
 * @param {string} resourceType
 */
const replaceInCloudinary = async (newFileBuffer, oldPublicId, folder = 'hireflow_resumes', resourceType = 'auto') => {
  if (oldPublicId) {
    await deleteFromCloudinary(oldPublicId, resourceType);
  }
  return await uploadToCloudinary(newFileBuffer, folder, resourceType);
};

/**
 * Generate secure HTTPS URL for publicId
 */
const getSecureUrl = (publicId, options = {}) => {
  if (!publicId || publicId.startsWith('dev_mock_')) return '';
  return cloudinary.url(publicId, { secure: true, ...options });
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  replaceInCloudinary,
  getSecureUrl,
};
