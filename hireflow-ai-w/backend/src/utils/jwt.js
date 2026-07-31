const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {string} userId - User ID
 * @returns {string} - Signed JWT
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_hireflow_ai';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ id: userId }, secret, {
    expiresIn,
  });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token string
 * @returns {object} - Decoded payload
 */
const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key_hireflow_ai';
  return jwt.verify(token, secret);
};

/**
 * Send token response with cookie options
 * @param {object} user - User document
 * @param {number} statusCode - HTTP status code
 * @param {object} res - Express response object
 * @param {string} message - Success message
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  // Omit password from user payload
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpire;

  return res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      statusCode,
      message,
      data: {
        token,
        user: userObj,
      },
    });
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenResponse,
};
