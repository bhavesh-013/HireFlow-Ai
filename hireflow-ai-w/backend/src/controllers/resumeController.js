const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

/**
 * Helper to verify resume ownership
 */
const verifyOwnership = (resume, userId) => {
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }
  if (resume.owner.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have permission to access or modify this resume');
  }
};

/**
 * @desc    Create a new resume
 * @route   POST /api/v1/resumes
 * @access  Private
 */
const createResume = asyncHandler(async (req, res) => {
  const { title, template = 'modern', theme, resumeData } = req.body;

  const newResume = await Resume.create({
    owner: req.user.id,
    title: title || 'Untitled Resume',
    template,
    theme: theme || {
      primaryColor: '#0B192C',
      secondaryColor: '#1E3E62',
      accentColor: '#3B82F6',
      font: 'Inter',
      fontSize: 'medium',
      layoutSpacing: 'normal',
    },
    resumeData: resumeData || {
      personalInfo: {
        firstName: req.user.name ? req.user.name.split(' ')[0] : '',
        lastName: req.user.name ? req.user.name.split(' ').slice(1).join(' ') : '',
        email: req.user.email || '',
        phone: '',
        location: '',
        jobTitle: req.user.headline || '',
        website: '',
        linkedin: '',
        github: '',
        photoUrl: req.user.avatar || '',
        customFields: [],
      },
      summary: req.user.bio || '',
      experience: [],
      education: [],
      projects: [],
      skills: req.user.skills ? req.user.skills.map((s, idx) => ({ id: `skill_${idx}`, name: s, category: 'General', level: 'Intermediate', keywords: [] })) : [],
      certifications: [],
      achievements: [],
      languages: [],
      links: [],
      customSections: [],
    },
  });

  // Create Version 1 automatically
  await ResumeVersion.create({
    resume: newResume._id,
    versionNumber: 1,
    name: 'Initial Creation',
    notes: 'Initial version generated upon resume creation',
    snapshot: {
      title: newResume.title,
      template: newResume.template,
      theme: newResume.theme,
      resumeData: newResume.resumeData,
      atsScore: newResume.atsScore,
      healthScore: newResume.healthScore,
    },
  });

  return ApiResponse.created(res, newResume, 'Resume created successfully');
});

/**
 * @desc    Get all user resumes with pagination, filter, search & sorting
 * @route   GET /api/v1/resumes
 * @access  Private
 */
const getMyResumes = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    favorite = '',
    archived = 'false',
    status = '',
    sortBy = 'lastEdited',
    sortOrder = 'desc',
  } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Build filter query
  const query = { owner: req.user.id };

  if (archived === 'true') {
    query.isArchived = true;
  } else if (archived === 'false') {
    query.isArchived = false;
  }

  if (favorite === 'true') {
    query.isFavorite = true;
  }

  if (status) {
    query.status = status;
  }

  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { 'resumeData.personalInfo.jobTitle': searchRegex },
      { 'resumeData.personalInfo.firstName': searchRegex },
      { 'resumeData.personalInfo.lastName': searchRegex },
    ];
  }

  // Sorting setup
  const sort = {};
  const validSortFields = ['lastEdited', 'createdAt', 'title', 'atsScore', 'healthScore'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'lastEdited';
  sort[sortField] = sortOrder === 'asc' ? 1 : -1;

  const [resumes, total] = await Promise.all([
    Resume.find(query).sort(sort).skip(skip).limit(limitNum),
    Resume.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return ApiResponse.success(
    res,
    200,
    resumes,
    'Resumes fetched successfully',
    {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    }
  );
});

/**
 * @desc    Get resume by ID
 * @route   GET /api/v1/resumes/:id
 * @access  Private
 */
const getResumeById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  return ApiResponse.success(res, 200, resume, 'Resume fetched successfully');
});

/**
 * @desc    Update full resume
 * @route   PUT /api/v1/resumes/:id
 * @access  Private
 */
const updateResume = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  const { title, template, theme, visibility, status, resumeData, isFavorite } = req.body;

  if (title !== undefined) resume.title = title;
  if (template !== undefined) resume.template = template;
  if (theme !== undefined) resume.theme = theme;
  if (visibility !== undefined) resume.visibility = visibility;
  if (status !== undefined) resume.status = status;
  if (resumeData !== undefined) resume.resumeData = resumeData;
  if (isFavorite !== undefined) resume.isFavorite = isFavorite;

  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.success(res, 200, resume, 'Resume updated successfully');
});

/**
 * @desc    Delete resume and associated versions
 * @route   DELETE /api/v1/resumes/:id
 * @access  Private
 */
const deleteResume = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  // Delete thumbnail from Cloudinary if exists
  if (resume.thumbnail && resume.thumbnail.publicId) {
    await deleteFromCloudinary(resume.thumbnail.publicId);
  }

  // Delete versions & resume document
  await Promise.all([
    ResumeVersion.deleteMany({ resume: resume._id }),
    Resume.findByIdAndDelete(resume._id),
  ]);

  return ApiResponse.success(res, 200, null, 'Resume and all associated history deleted successfully');
});

/**
 * @desc    Duplicate an existing resume
 * @route   POST /api/v1/resumes/:id/duplicate
 * @access  Private
 */
const duplicateResume = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const originalResume = await Resume.findById(req.params.id);
  verifyOwnership(originalResume, req.user.id);

  const duplicatedResume = await Resume.create({
    owner: req.user.id,
    title: `${originalResume.title} (Copy)`,
    template: originalResume.template,
    theme: originalResume.theme,
    resumeData: originalResume.resumeData,
    visibility: 'private',
    status: 'draft',
    atsScore: originalResume.atsScore,
    healthScore: originalResume.healthScore,
  });

  // Create Version 1 for duplicated resume
  await ResumeVersion.create({
    resume: duplicatedResume._id,
    versionNumber: 1,
    name: 'Duplicated Copy',
    notes: `Duplicated from "${originalResume.title}"`,
    snapshot: {
      title: duplicatedResume.title,
      template: duplicatedResume.template,
      theme: duplicatedResume.theme,
      resumeData: duplicatedResume.resumeData,
      atsScore: duplicatedResume.atsScore,
      healthScore: duplicatedResume.healthScore,
    },
  });

  return ApiResponse.created(res, duplicatedResume, 'Resume duplicated successfully');
});

/**
 * @desc    Archive resume
 * @route   POST /api/v1/resumes/:id/archive
 * @access  Private
 */
const archiveResume = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  resume.isArchived = true;
  resume.status = 'archived';
  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.success(res, 200, resume, 'Resume archived successfully');
});

/**
 * @desc    Restore archived resume
 * @route   POST /api/v1/resumes/:id/restore
 * @access  Private
 */
const restoreResume = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  resume.isArchived = false;
  resume.status = 'draft';
  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.success(res, 200, resume, 'Resume restored from archive');
});

/**
 * @desc    Favorite / Unfavorite resume
 * @route   POST /api/v1/resumes/:id/favorite
 * @access  Private
 */
const toggleFavorite = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  resume.isFavorite = !resume.isFavorite;
  resume.lastEdited = new Date();
  await resume.save();

  const msg = resume.isFavorite ? 'Resume added to favorites' : 'Resume removed from favorites';
  return ApiResponse.success(res, 200, resume, msg);
});

/**
 * @desc    Autosave resume changes (lightweight update)
 * @route   PUT /api/v1/resumes/:id/autosave
 * @access  Private
 */
const autosaveResume = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  const { title, theme, resumeData, template } = req.body;

  if (title !== undefined) resume.title = title;
  if (template !== undefined) resume.template = template;
  if (theme !== undefined) {
    resume.theme = { ...resume.theme, ...theme };
  }
  if (resumeData !== undefined) {
    // Deep merge or update passed sub-fields of resumeData
    Object.keys(resumeData).forEach((key) => {
      resume.resumeData[key] = resumeData[key];
    });
  }

  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.success(res, 200, {
    _id: resume._id,
    title: resume.title,
    lastEdited: resume.lastEdited,
    currentVersion: resume.currentVersion,
  }, 'Resume autosaved successfully');
});

/**
 * @desc    Update specific section independently
 * @route   PUT /api/v1/resumes/:id/section/:sectionName
 * @access  Private
 */
const updateSection = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const { sectionName } = req.params;
  const validSections = [
    'personalInfo',
    'summary',
    'experience',
    'education',
    'projects',
    'skills',
    'certifications',
    'achievements',
    'languages',
    'links',
    'customSections',
  ];

  if (!validSections.includes(sectionName)) {
    throw ApiError.badRequest(`Invalid section name. Allowed sections: ${validSections.join(', ')}`);
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  // Update specified section data
  resume.resumeData[sectionName] = req.body;
  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.success(
    res,
    200,
    { section: sectionName, data: resume.resumeData[sectionName], lastEdited: resume.lastEdited },
    `Section '${sectionName}' updated successfully`
  );
});

/**
 * @desc    Upload thumbnail image for resume
 * @route   POST /api/v1/resumes/:id/thumbnail
 * @access  Private
 */
const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  if (!req.file) {
    throw ApiError.badRequest('Please upload an image file');
  }

  const resume = await Resume.findById(req.params.id);
  verifyOwnership(resume, req.user.id);

  // Remove old thumbnail from Cloudinary if exists
  if (resume.thumbnail && resume.thumbnail.publicId) {
    await deleteFromCloudinary(resume.thumbnail.publicId);
  }

  // Upload to Cloudinary
  const result = await uploadToCloudinary(req.file.buffer, 'hireflow_resumes/thumbnails');

  resume.thumbnail = {
    url: result.url,
    publicId: result.publicId,
  };
  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.success(res, 200, resume.thumbnail, 'Thumbnail uploaded successfully');
});

module.exports = {
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
};
