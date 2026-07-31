const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const ResumeTemplateReference = require('../models/ResumeTemplateReference');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Pre-defined seed templates for instant fallback
const DEFAULT_TEMPLATES = [
  {
    name: 'Modern Clean',
    slug: 'modern',
    description: 'Clean single-column layout optimized for tech & corporate roles.',
    category: 'Modern',
    previewImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=600',
    config: {
      defaultPrimaryColor: '#0B192C',
      defaultSecondaryColor: '#1E3E62',
      defaultFont: 'Inter',
      supportedFonts: ['Inter', 'Plus Jakarta Sans', 'Roboto'],
      layout: 'single-column',
    },
    isPremium: false,
  },
  {
    name: 'Executive Elite',
    slug: 'executive',
    description: 'Sophisticated two-column format designed for senior management.',
    category: 'Executive',
    previewImage: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&q=80&w=600',
    config: {
      defaultPrimaryColor: '#0F172A',
      defaultSecondaryColor: '#475569',
      defaultFont: 'Playfair Display',
      supportedFonts: ['Playfair Display', 'Merriweather', 'Inter'],
      layout: 'two-column',
    },
    isPremium: false,
  },
  {
    name: 'Minimal Mono',
    slug: 'minimalist',
    description: 'High typography contrast with generous spacing.',
    category: 'Minimalist',
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    config: {
      defaultPrimaryColor: '#18181B',
      defaultSecondaryColor: '#52525B',
      defaultFont: 'Space Grotesk',
      supportedFonts: ['Space Grotesk', 'Inter'],
      layout: 'single-column',
    },
    isPremium: false,
  },
  {
    name: 'Creative Studio',
    slug: 'creative',
    description: 'Left sidebar header with vibrant accent highlights.',
    category: 'Creative',
    previewImage: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=600',
    config: {
      defaultPrimaryColor: '#2563EB',
      defaultSecondaryColor: '#1D4ED8',
      defaultFont: 'Plus Jakarta Sans',
      supportedFonts: ['Plus Jakarta Sans', 'Inter'],
      layout: 'left-sidebar',
    },
    isPremium: true,
  },
];

/**
 * @desc    List available resume templates
 * @route   GET /api/v1/templates
 * @access  Public
 */
const listTemplates = asyncHandler(async (req, res) => {
  let templates = await ResumeTemplateReference.find({ isActive: true });

  if (!templates || templates.length === 0) {
    // Return seed defaults if database collection is empty
    templates = DEFAULT_TEMPLATES;
  }

  return ApiResponse.success(res, 200, templates, 'Available resume templates fetched successfully');
});

/**
 * @desc    Switch resume template
 * @route   PUT /api/v1/resumes/:id/template
 * @access  Private
 */
const switchTemplate = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw ApiError.badRequest('Invalid Resume ID format');
  }

  const { template, theme } = req.body;
  if (!template) {
    throw ApiError.badRequest('Template identifier is required');
  }

  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    throw ApiError.notFound('Resume not found');
  }
  if (resume.owner.toString() !== req.user.id.toString()) {
    throw ApiError.forbidden('Unauthorized access');
  }

  resume.template = template;
  if (theme) {
    resume.theme = { ...resume.theme, ...theme };
  }
  resume.lastEdited = new Date();
  await resume.save();

  return ApiResponse.success(res, 200, resume, `Resume template updated to '${template}'`);
});

module.exports = {
  listTemplates,
  switchTemplate,
};
