const mongoose = require('mongoose');
const ResumeUpload = require('../models/ResumeUpload');
const ImportHistory = require('../models/ImportHistory');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { extractTextFromBuffer } = require('../services/textExtractionService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { parseResumeWithGemini } = require('../services/geminiService');
const { validateResume } = require('../services/resumeValidationService');

/**
 * @desc    Upload & parse resume file (PDF / DOCX)
 * @route   POST /api/v1/upload/resume (or /api/upload/resume)
 * @access  Private
 */
const uploadAndParseResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload a resume file (PDF or DOCX)');
  }

  const { originalname, buffer, mimetype, size } = req.file;

  // File size check (10MB max)
  if (size > 10 * 1024 * 1024) {
    throw ApiError.badRequest('File size exceeds the 10MB limit.');
  }

  const extension = originalname.split('.').pop().toLowerCase();
  if (!['pdf', 'docx'].includes(extension)) {
    throw ApiError.badRequest('Invalid file format. Only PDF (.pdf) and DOCX (.docx) files are supported.');
  }

  // 1. Upload original file to Cloudinary
  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadToCloudinary(buffer, 'hireflow_resumes/documents', 'raw');
  } catch (error) {
    console.error('[Upload Controller Cloudinary Error]:', error.message);
    cloudinaryResult = {
      url: '',
      publicId: '',
    };
  }

  // 2. Create pending ResumeUpload record
  const uploadRecord = await ResumeUpload.create({
    user: req.user.id,
    originalName: originalname,
    fileName: `resume_${Date.now()}.${extension}`,
    fileType: extension,
    fileSize: size,
    cloudinaryUrl: cloudinaryResult.url,
    cloudinaryPublicId: cloudinaryResult.publicId,
    status: 'uploading',
  });

  try {
    // 3. Extract text from document buffer
    const rawText = await extractTextFromBuffer(buffer, mimetype, originalname);

    // 4. Parse raw text into structured JSON using Gemini AI
    const parsedData = await parseResumeWithGemini(rawText);

    // 5. Run validation on parsed resume data
    const validationResult = validateResume(parsedData);

    // 6. Generate title from parsed name or original file
    const fullName = `${parsedData.personalInfo?.firstName || ''} ${parsedData.personalInfo?.lastName || ''}`.trim();
    const resumeTitle = fullName ? `${fullName}'s Resume` : originalname.replace(/\.[^/.]+$/, '');

    // Placeholder resume thumbnail preview
    const thumbnailPreview = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600';

    // 7. Save parsed resume into MongoDB
    const newResume = await Resume.create({
      owner: req.user.id,
      title: resumeTitle,
      template: 'modern',
      thumbnail: {
        url: thumbnailPreview,
        publicId: '',
      },
      atsScore: Math.round(validationResult.healthScore * 0.9), // Initial ATS estimate
      healthScore: validationResult.healthScore,
      validation: validationResult,
      resumeData: parsedData,
    });

    // 8. Create initial Version snapshot
    await ResumeVersion.create({
      resume: newResume._id,
      versionNumber: 1,
      name: 'Uploaded File Snapshot',
      notes: `Parsed automatically from ${originalname}`,
      snapshot: {
        title: newResume.title,
        template: newResume.template,
        theme: newResume.theme,
        resumeData: newResume.resumeData,
        atsScore: newResume.atsScore,
        healthScore: newResume.healthScore,
      },
    });

    // 9. Update ResumeUpload record status
    uploadRecord.status = 'parsed';
    uploadRecord.parsedResume = newResume._id;
    await uploadRecord.save();

    // 10. Record in ImportHistory
    await ImportHistory.create({
      user: req.user.id,
      importType: 'file_upload',
      status: 'success',
      sourceDetails: {
        originalName: originalname,
        fileType: extension,
        fileSize: size,
        cloudinaryUrl: cloudinaryResult.url,
      },
      resume: newResume._id,
      itemsImportedCount: (parsedData.experience?.length || 0) + (parsedData.skills?.length || 0),
    });

    return ApiResponse.created(
      res,
      {
        resume: newResume,
        uploadRecord,
        validation: validationResult,
      },
      'Resume file uploaded and parsed successfully'
    );
  } catch (error) {
    console.error('[Upload Controller Error]:', error);
    uploadRecord.status = 'failed';
    uploadRecord.errorDetails = error.message;
    await uploadRecord.save();

    await ImportHistory.create({
      user: req.user.id,
      importType: 'file_upload',
      status: 'failed',
      sourceDetails: { originalName: originalname, fileType: extension },
      errorDetails: error.message,
    });

    throw ApiError.badRequest(`Resume processing failed: ${error.message}`);
  }
});

/**
 * @desc    Get user upload & import history
 * @route   GET /api/v1/upload/history (or /api/upload/history)
 * @access  Private
 */
const getUploadHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [uploads, imports, totalUploads] = await Promise.all([
    ResumeUpload.find({ user: req.user.id })
      .populate('parsedResume', 'title template lastEdited')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ImportHistory.find({ user: req.user.id })
      .populate('resume', 'title template lastEdited')
      .sort({ createdAt: -1 })
      .limit(20),
    ResumeUpload.countDocuments({ user: req.user.id }),
  ]);

  return ApiResponse.success(
    res,
    200,
    { uploads, imports },
    'Upload and import history fetched successfully',
    {
      total: totalUploads,
      page,
      limit,
      totalPages: Math.ceil(totalUploads / limit) || 1,
    }
  );
});

/**
 * @desc    Delete uploaded file metadata & Cloudinary file
 * @route   DELETE /api/v1/upload/:id (or /api/upload/:id)
 * @access  Private
 */
const deleteUpload = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Upload ID format');
  }

  const uploadRecord = await ResumeUpload.findById(req.params.id);
  if (!uploadRecord) {
    throw ApiError.notFound('Upload record not found');
  }

  if (uploadRecord.user.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden('Unauthorized access');
  }

  // Delete file from Cloudinary if exists
  if (uploadRecord.cloudinaryPublicId) {
    await deleteFromCloudinary(uploadRecord.cloudinaryPublicId, 'raw');
  }

  await ResumeUpload.findByIdAndDelete(uploadRecord._id);

  return ApiResponse.success(res, 200, null, 'Upload record and Cloudinary document deleted successfully');
});

module.exports = {
  uploadAndParseResume,
  getUploadHistory,
  deleteUpload,
};
