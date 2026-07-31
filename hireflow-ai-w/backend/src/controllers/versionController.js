const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a manual version snapshot of resume
 * @route   POST /api/v1/resumes/:id/version
 * @access  Private
 */
const createVersion = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }
  if (resume.owner.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden('Unauthorized access');
  }

  const nextVersionNumber = resume.currentVersion + 1;
  const { name, notes } = req.body;

  const newVersion = await ResumeVersion.create({
    resume: resume._id,
    versionNumber: nextVersionNumber,
    name: name || `Version ${nextVersionNumber}`,
    notes: notes || '',
    snapshot: {
      title: resume.title,
      template: resume.template,
      theme: resume.theme,
      resumeData: resume.resumeData,
      atsScore: resume.atsScore,
      healthScore: resume.healthScore,
    },
  });

  // Increment currentVersion on resume
  resume.currentVersion = nextVersionNumber;
  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.created(res, newVersion, 'Resume version snapshot created successfully');
});

/**
 * @desc    Get version history for a resume
 * @route   GET /api/v1/resumes/:id/history
 * @access  Private
 */
const getVersionHistory = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }
  if (resume.owner.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden('Unauthorized access');
  }

  const versions = await ResumeVersion.find({ resume: resume._id }).sort({ versionNumber: -1 });

  return ApiResponse.success(res, 200, versions, 'Resume version history fetched successfully');
});

/**
 * @desc    Restore resume to a specific historical version snapshot
 * @route   POST /api/v1/resumes/:id/version/:versionId/restore
 * @access  Private
 */
const restoreVersion = asyncHandler(async (req, res) => {
  const { id, versionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(versionId)) {
    throw ApiError.badRequest('Invalid ID format');
  }

  const resume = await Resume.findById(id);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }
  if (resume.owner.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden('Unauthorized access');
  }

  const targetVersion = await ResumeVersion.findById(versionId);
  if (!targetVersion || targetVersion.resume.toString() !== resume._id.toString()) {
    throw ApiError.notFound('Version snapshot not found for this resume');
  }

  // Restore fields from snapshot
  resume.title = targetVersion.snapshot.title;
  resume.template = targetVersion.snapshot.template;
  resume.theme = targetVersion.snapshot.theme;
  resume.resumeData = targetVersion.snapshot.resumeData;
  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.success(res, 200, resume, `Resume restored to Version ${targetVersion.versionNumber}`);
});

/**
 * @desc    Delete a version snapshot
 * @route   DELETE /api/v1/resumes/:id/version/:versionId
 * @access  Private
 */
const deleteVersion = asyncHandler(async (req, res) => {
  const { id, versionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(versionId)) {
    throw ApiError.badRequest('Invalid ID format');
  }

  const resume = await Resume.findById(id);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }
  if (resume.owner.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden('Unauthorized access');
  }

  const targetVersion = await ResumeVersion.findById(versionId);
  if (!targetVersion || targetVersion.resume.toString() !== resume._id.toString()) {
    throw ApiError.notFound('Version snapshot not found');
  }

  await ResumeVersion.findByIdAndDelete(versionId);

  return ApiResponse.success(res, 200, null, 'Version snapshot deleted successfully');
});

module.exports = {
  createVersion,
  getVersionHistory,
  restoreVersion,
  deleteVersion,
};
