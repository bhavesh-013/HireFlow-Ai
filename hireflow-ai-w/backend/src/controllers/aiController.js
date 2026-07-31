const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const {
  analyzeAtsMatch,
  matchJobDescription,
  generateAiSuggestions,
  careerCoachChat,
} = require('../services/geminiService');

/**
 * @desc    Analyze resume for ATS score & keywords
 * @route   POST /api/v1/ai/ats-analyze
 * @access  Private
 */
const analyzeAts = asyncHandler(async (req, res) => {
  const { resumeId, resumeData, targetRole = 'Software Engineer' } = req.body;

  let activeData = resumeData;

  if (resumeId) {
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      throw ApiError.badRequest('Invalid Resume ID format');
    }
    const resume = await Resume.findById(resumeId);
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.owner.toString() !== req.user.id.toString()) {
      throw ApiError.forbidden('Unauthorized access to resume');
    }
    activeData = resume.resumeData;
  }

  if (!activeData) {
    throw ApiError.badRequest('Please provide either resumeId or resumeData object for ATS analysis.');
  }

  const result = await analyzeAtsMatch(activeData, targetRole);

  // If resumeId provided, update stored atsScore in MongoDB
  if (resumeId && result.atsScore) {
    await Resume.findByIdAndUpdate(resumeId, {
      atsScore: result.atsScore,
      lastEdited: new Date(),
    });
  }

  return ApiResponse.success(res, 200, result, 'ATS score and keyword analysis completed successfully');
});

/**
 * @desc    Match resume against Job Description
 * @route   POST /api/v1/ai/jd-match
 * @access  Private
 */
const matchJd = asyncHandler(async (req, res) => {
  const { resumeId, resumeData, jobDescription } = req.body;

  if (!jobDescription || !jobDescription.trim()) {
    throw ApiError.badRequest('Please provide the target Job Description (jobDescription).');
  }

  let activeData = resumeData;

  if (resumeId) {
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      throw ApiError.badRequest('Invalid Resume ID format');
    }
    const resume = await Resume.findById(resumeId);
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.owner.toString() !== req.user.id.toString()) {
      throw ApiError.forbidden('Unauthorized access to resume');
    }
    activeData = resume.resumeData;
  }

  if (!activeData) {
    throw ApiError.badRequest('Please provide either resumeId or resumeData object.');
  }

  const result = await matchJobDescription(activeData, jobDescription);

  return ApiResponse.success(res, 200, result, 'Job Description match and gap analysis completed successfully');
});

/**
 * @desc    Get AI suggestions for resume bullet points & sections
 * @route   POST /api/v1/ai/suggest
 * @access  Private
 */
const getAiSuggestions = asyncHandler(async (req, res) => {
  const { resumeId, resumeData, section = 'summary', promptDetails = '' } = req.body;

  let activeData = resumeData;

  if (resumeId) {
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      throw ApiError.badRequest('Invalid Resume ID format');
    }
    const resume = await Resume.findById(resumeId);
    if (!resume) throw ApiError.notFound('Resume not found');
    if (resume.owner.toString() !== req.user.id.toString()) {
      throw ApiError.forbidden('Unauthorized access to resume');
    }
    activeData = resume.resumeData;
  }

  if (!activeData) {
    activeData = {};
  }

  const result = await generateAiSuggestions(activeData, section, promptDetails);

  return ApiResponse.success(res, 200, result, 'AI section suggestions generated successfully');
});

/**
 * @desc    Interactive Career Coach advice chat
 * @route   POST /api/v1/ai/career-coach
 * @access  Private
 */
const coachChat = asyncHandler(async (req, res) => {
  const { message, conversationHistory = [], resumeId } = req.body;

  if (!message || !message.trim()) {
    throw ApiError.badRequest('Please provide a message for your Career Coach.');
  }

  let activeData = {};

  if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
    const resume = await Resume.findById(resumeId);
    if (resume && resume.owner.toString() === req.user.id.toString()) {
      activeData = resume.resumeData;
    }
  }

  const result = await careerCoachChat(message, conversationHistory, activeData);

  return ApiResponse.success(res, 200, result, 'Career Coach response generated successfully');
});

module.exports = {
  analyzeAts,
  matchJd,
  getAiSuggestions,
  coachChat,
};
