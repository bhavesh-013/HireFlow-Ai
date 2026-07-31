const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const config = require('../config/env');

const googleClient = new OAuth2Client(config.googleClientId);

/**
 * Verify Google ID Token or Access Token and return user profile payload
 * @param {string} idToken - Token provided by client frontend
 * @returns {object} - User profile information
 */
const verifyGoogleToken = async (idToken) => {
  try {
    if (config.googleClientId && config.googleClientId !== 'your-google-client-id.apps.googleusercontent.com') {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: config.googleClientId,
      });
      const payload = ticket.getPayload();
      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        emailVerified: payload.email_verified,
      };
    } else {
      // Development fallback if GOOGLE_CLIENT_ID is placeholder or testing token
      console.log('[Dev Notice]: Using simulated Google Token verification');
      // Simple base64 token parse attempt or synthetic user payload
      return {
        googleId: `google_mock_${Date.now()}`,
        email: `google_user_${Date.now()}@example.com`,
        name: 'Google User',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        emailVerified: true,
      };
    }
  } catch (error) {
    throw ApiError.badRequest(`Invalid or expired Google Token: ${error.message}`);
  }
};

/**
 * Authenticate or Register user with Google OAuth credentials
 * @param {string} idToken - Token from frontend
 * @returns {object} - Mongoose User Document
 */
const handleGoogleAuth = async (idToken) => {
  const googleData = await verifyGoogleToken(idToken);

  let user = await User.findOne({
    $or: [{ googleId: googleData.googleId }, { email: googleData.email }],
  });

  if (user) {
    // If user exists with local account, link Google ID
    if (!user.googleId) {
      user.googleId = googleData.googleId;
      if (googleData.avatar) user.avatar = googleData.avatar;
      await user.save();
    }
  } else {
    // Create new user for Google Auth
    user = await User.create({
      name: googleData.name,
      email: googleData.email,
      googleId: googleData.googleId,
      avatar: googleData.avatar,
      authProvider: 'google',
      isVerified: googleData.emailVerified || true,
    });
  }

  return user;
};

module.exports = {
  verifyGoogleToken,
  handleGoogleAuth,
};
