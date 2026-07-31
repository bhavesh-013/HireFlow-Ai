const Resume = require('../models/Resume');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get dashboard metrics and statistics for authenticated user
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalResumes, favoriteResumes, archivedResumes, recentResumes, scoreStats] = await Promise.all([
    Resume.countDocuments({ owner: userId, isArchived: false }),
    Resume.countDocuments({ owner: userId, isFavorite: true, isArchived: false }),
    Resume.countDocuments({ owner: userId, isArchived: true }),
    Resume.find({ owner: userId, isArchived: false }).sort({ lastEdited: -1 }).limit(1),
    Resume.aggregate([
      { $match: { owner: userId, isArchived: false } },
      {
        $group: {
          _id: null,
          avgAtsScore: { $avg: '$atsScore' },
          avgHealthScore: { $avg: '$healthScore' },
        },
      },
    ]),
  ]);

  const avgAts = scoreStats.length > 0 ? Math.round(scoreStats[0].avgAtsScore || 0) : 0;
  const avgHealth = scoreStats.length > 0 ? Math.round(scoreStats[0].avgHealthScore || 0) : 0;
  const lastEdited = recentResumes.length > 0 ? recentResumes[0].lastEdited : null;

  const stats = {
    totalResumes,
    favoriteResumes,
    archivedResumes,
    averageAtsScore: avgAts,
    averageHealthScore: avgHealth,
    lastEdited,
  };

  return ApiResponse.success(res, 200, stats, 'Dashboard statistics calculated successfully');
});

/**
 * @desc    Get recent resumes for authenticated user
 * @route   GET /api/v1/dashboard/recent
 * @access  Private
 */
const getRecentResumes = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;

  const recentResumes = await Resume.find({ owner: req.user.id, isArchived: false })
    .sort({ lastEdited: -1 })
    .limit(limit);

  return ApiResponse.success(res, 200, recentResumes, 'Recent resumes fetched successfully');
});

module.exports = {
  getDashboardStats,
  getRecentResumes,
};
