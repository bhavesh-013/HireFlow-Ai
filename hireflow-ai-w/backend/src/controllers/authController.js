const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { sendTokenResponse } = require('../utils/jwt');
const { handleGoogleAuth } = require('../services/authService');
const { sendEmail } = require('../services/emailService');
const config = require('../config/env');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    throw ApiError.conflict('An account with this email address already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    authProvider: 'local',
  });

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

/**
 * @desc    Login user with email & password
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user (include password in query)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

/**
 * @desc    Authenticate with Google OAuth ID Token
 * @route   POST /api/v1/auth/google
 * @access  Public
 */
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw ApiError.badRequest('Google ID token is required');
  }

  const user = await handleGoogleAuth(idToken);

  sendTokenResponse(user, 200, res, 'Google authentication successful');
});

/**
 * @desc    Request password reset token email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw ApiError.notFound('There is no user registered with this email address');
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;

  const message = `You are receiving this email because you requested a password reset for your HireFlow AI account. Please make a PUT request to reset your password or visit:\n\n${resetUrl}\n\nThis token is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'HireFlow AI - Password Reset Token',
      message,
    });

    return ApiResponse.success(
      res,
      200,
      { resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined },
      'Password reset email sent successfully'
    );
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    throw ApiError.internal('Email could not be sent. Please try again later.');
  }
});

/**
 * @desc    Reset password using valid reset token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token) {
    throw ApiError.badRequest('Reset token is required');
  }

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Invalid or expired password reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password has been reset successfully');
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  return ApiResponse.success(res, 200, null, 'Logged out successfully');
});

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  return ApiResponse.success(res, 200, user, 'Current user profile fetched successfully');
});

/**
 * @desc    Update user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, headline, bio, skills, avatar } = req.body;

  const fieldsToUpdate = {};
  if (name !== undefined) fieldsToUpdate.name = name;
  if (headline !== undefined) fieldsToUpdate.headline = headline;
  if (bio !== undefined) fieldsToUpdate.bio = bio;
  if (skills !== undefined) fieldsToUpdate.skills = skills;
  if (avatar !== undefined) fieldsToUpdate.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  return ApiResponse.success(res, 200, user, 'User profile updated successfully');
});

module.exports = {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
  updateProfile,
};
