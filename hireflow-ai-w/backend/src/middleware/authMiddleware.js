const User = require('../models/User');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/jwt');

/**
 * Protect routes by validating JWT from Authorization header or cookies
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback to token cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized('Not authorized to access this route, token missing');
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('The user belonging to this token no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid authorization token');
    }
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Authorization token has expired');
    }
    throw err;
  }
});

/**
 * Authorize user roles
 * @param  {...string} roles - Permitted roles (e.g. 'admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
