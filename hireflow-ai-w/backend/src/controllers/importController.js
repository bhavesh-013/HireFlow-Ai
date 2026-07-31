const mongoose = require('mongoose');
const ImportHistory = require('../models/ImportHistory');
const Resume = require('../models/Resume');
const ResumeVersion = require('../models/ResumeVersion');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { extractTextFromPdf } = require('../services/textExtractionService');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { parseLinkedInPdfWithGemini } = require('../services/geminiService');
const { fetchGitHubData, exchangeGitHubCodeForToken } = require('../services/githubService');
const { validateResume } = require('../services/resumeValidationService');

/**
 * @desc    Import LinkedIn profile from exported PDF
 * @route   POST /api/v1/import/linkedin (or /api/import/linkedin)
 * @access  Private
 */
const importLinkedInPdf = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please upload your exported LinkedIn Profile PDF file.');
  }

  const { originalname, buffer, mimetype, size } = req.file;

  if (size > 10 * 1024 * 1024) {
    throw ApiError.badRequest('File size exceeds the 10MB limit.');
  }

  // 1. Upload to Cloudinary
  let cloudinaryResult;
  try {
    cloudinaryResult = await uploadToCloudinary(buffer, 'hireflow_resumes/linkedin_imports', 'raw');
  } catch (error) {
    cloudinaryResult = { url: '', publicId: '' };
  }

  try {
    // 2. Extract text from LinkedIn PDF
    const rawText = await extractTextFromPdf(buffer);

    // 3. Parse LinkedIn structured sections using Gemini AI
    const parsedData = await parseLinkedInPdfWithGemini(rawText);

    // 4. Run validation on parsed data
    const validationResult = validateResume(parsedData);

    const fullName = `${parsedData.personalInfo?.firstName || ''} ${parsedData.personalInfo?.lastName || ''}`.trim();
    const resumeTitle = fullName ? `${fullName}'s LinkedIn Resume` : 'LinkedIn Import Resume';

    // 5. Create new Resume document
    const newResume = await Resume.create({
      owner: req.user.id,
      title: resumeTitle,
      template: 'modern',
      healthScore: validationResult.healthScore,
      atsScore: Math.round(validationResult.healthScore * 0.88),
      validation: validationResult,
      resumeData: parsedData,
    });

    // 6. Create Version 1 snapshot
    await ResumeVersion.create({
      resume: newResume._id,
      versionNumber: 1,
      name: 'LinkedIn Import Snapshot',
      notes: 'Imported from LinkedIn exported profile PDF',
      snapshot: {
        title: newResume.title,
        template: newResume.template,
        theme: newResume.theme,
        resumeData: newResume.resumeData,
        atsScore: newResume.atsScore,
        healthScore: newResume.healthScore,
      },
    });

    // 7. Save ImportHistory
    const importRecord = await ImportHistory.create({
      user: req.user.id,
      importType: 'linkedin_pdf',
      status: 'success',
      sourceDetails: {
        originalName: originalname,
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
        importHistory: importRecord,
        validation: validationResult,
      },
      'LinkedIn profile imported and converted into Resume successfully'
    );
  } catch (error) {
    console.error('[LinkedIn Import Error]:', error);
    await ImportHistory.create({
      user: req.user.id,
      importType: 'linkedin_pdf',
      status: 'failed',
      sourceDetails: { originalName: originalname },
      errorDetails: error.message,
    });

    throw ApiError.badRequest(`LinkedIn PDF import failed: ${error.message}`);
  }
});

/**
 * @desc    Import GitHub repositories, profile & tech stack
 * @route   POST /api/v1/import/github (or /api/import/github)
 * @access  Private
 */
const importGitHubData = asyncHandler(async (req, res) => {
  const { username, code, resumeId } = req.body;

  if (!username && !code) {
    throw ApiError.badRequest('Please provide either a GitHub username or an OAuth authorization code.');
  }

  let githubData;
  let isToken = false;

  try {
    if (code) {
      // Exchange OAuth code for access token
      const accessToken = await exchangeGitHubCodeForToken(code);
      githubData = await fetchGitHubData(accessToken, true);
    } else {
      githubData = await fetchGitHubData(username, false);
    }

    let targetResume;

    if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      // Merge into existing resume
      targetResume = await Resume.findById(resumeId);
      if (targetResume && targetResume.owner.toString() === req.user.id.toString()) {
        // Append GitHub projects to existing projects
        const existingProjects = targetResume.resumeData.projects || [];
        const existingSkills = targetResume.resumeData.skills || [];

        targetResume.resumeData.projects = [...existingProjects, ...githubData.projects];

        // Merge unique skills
        const skillNames = new Set(existingSkills.map((s) => s.name.toLowerCase()));
        githubData.skills.forEach((s) => {
          if (!skillNames.has(s.name.toLowerCase())) {
            existingSkills.push(s);
          }
        });
        targetResume.resumeData.skills = existingSkills;

        if (githubData.profile.github) {
          targetResume.resumeData.personalInfo.github = githubData.profile.github;
        }

        const validationResult = validateResume(targetResume.resumeData);
        targetResume.healthScore = validationResult.healthScore;
        targetResume.validation = validationResult;
        targetResume.lastEdited = new Date();
        await targetResume.save();
      }
    }

    if (!targetResume) {
      // Create a brand new Resume document from GitHub import
      const initialResumeData = {
        personalInfo: {
          firstName: githubData.profile.firstName,
          lastName: githubData.profile.lastName,
          email: githubData.profile.email,
          phone: '',
          location: githubData.profile.location,
          jobTitle: githubData.profile.jobTitle,
          website: githubData.profile.website,
          github: githubData.profile.github,
          photoUrl: githubData.profile.photoUrl,
        },
        summary: githubData.summary,
        experience: [],
        education: [],
        projects: githubData.projects,
        skills: githubData.skills,
        certifications: [],
        achievements: [],
        languages: [],
        links: [],
        customSections: [],
      };

      const validationResult = validateResume(initialResumeData);

      targetResume = await Resume.create({
        owner: req.user.id,
        title: `${githubData.profile.username}'s GitHub Portfolio Resume`,
        template: 'modern',
        healthScore: validationResult.healthScore,
        atsScore: Math.round(validationResult.healthScore * 0.85),
        validation: validationResult,
        resumeData: initialResumeData,
      });

      // Create Version 1 snapshot
      await ResumeVersion.create({
        resume: targetResume._id,
        versionNumber: 1,
        name: 'GitHub Import Snapshot',
        notes: `Imported from GitHub user "${githubData.profile.username}"`,
        snapshot: {
          title: targetResume.title,
          template: targetResume.template,
          theme: targetResume.theme,
          resumeData: targetResume.resumeData,
          atsScore: targetResume.atsScore,
          healthScore: targetResume.healthScore,
        },
      });
    }

    // Save ImportHistory record
    const importRecord = await ImportHistory.create({
      user: req.user.id,
      importType: 'github',
      status: 'success',
      sourceDetails: {
        username: githubData.profile.username,
        publicRepos: githubData.repoCount,
      },
      resume: targetResume._id,
      itemsImportedCount: githubData.projects.length + githubData.skills.length,
    });

    return ApiResponse.created(
      res,
      {
        resume: targetResume,
        importHistory: importRecord,
        githubData,
      },
      'GitHub portfolio imported successfully into Resume'
    );
  } catch (error) {
    console.error('[GitHub Import Controller Error]:', error);

    await ImportHistory.create({
      user: req.user.id,
      importType: 'github',
      status: 'failed',
      sourceDetails: { username, codeProvided: !!code },
      errorDetails: error.message,
    });

    throw ApiError.badRequest(`GitHub import failed: ${error.message}`);
  }
});

module.exports = {
  importLinkedInPdf,
  importGitHubData,
};
