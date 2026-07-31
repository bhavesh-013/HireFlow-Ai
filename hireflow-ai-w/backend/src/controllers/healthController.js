const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get API health & database connection status
 * @route   GET /api/v1/health
 * @access  Public
 */
const getHealthStatus = asyncHandler(async (req, res) => {
  const dbStateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const dbStateCode = mongoose.connection.readyState;
  const dbStatus = dbStateMap[dbStateCode] || 'Unknown';

  const healthData = {
    status: 'healthy',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    service: 'HireFlow AI Phase 1 Backend API',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      isConnected: dbStateCode === 1,
    },
  };

  return ApiResponse.success(res, 200, healthData, 'Server health status check passed');
});

module.exports = {
  getHealthStatus,
};
