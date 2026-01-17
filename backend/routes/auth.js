/**
 * Authentication Routes
 * Handles user registration, login, logout, and profile management
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, generateToken, generateRefreshToken } = require('../middleware/auth');
const { asyncHandler, AppError, validationError } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', [
  // Validation middleware
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { firstName, lastName, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email,
    password
  });

  await user.save();

  // Generate tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscription: user.subscription,
        createdAt: user.createdAt
      },
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { email, password } = req.body;

  // Find user by email
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AppError('Account is deactivated. Please contact support.', 401);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscription: user.subscription,
        lastLogin: user.lastLogin
      },
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // In a more sophisticated setup, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscription: user.subscription,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    }
  });
}));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be true or false'),
  
  body('preferences.riskTolerance')
    .optional()
    .isIn(['conservative', 'moderate', 'aggressive'])
    .withMessage('Risk tolerance must be conservative, moderate, or aggressive')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const user = req.user;
  const { firstName, lastName, preferences } = req.body;

  // Update allowed fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (preferences) {
    if (preferences.emailNotifications !== undefined) {
      user.preferences.emailNotifications = preferences.emailNotifications;
    }
    if (preferences.riskTolerance) {
      user.preferences.riskTolerance = preferences.riskTolerance;
    }
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscription: user.subscription,
        preferences: user.preferences,
        updatedAt: user.updatedAt
      }
    }
  });
}));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const user = req.user;
  const { currentPassword, newPassword } = req.body;

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

/**
 * @route   GET /api/auth/subscription
 * @desc    Get user subscription details
 * @access  Private
 */
router.get('/subscription', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    data: {
      subscription: user.subscription,
      canAnalyzeContract: user.canAnalyzeContract()
    }
  });
}));

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw validationError(errors.array());
  }

  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid refresh token', 401);
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new access token
    const newToken = generateToken(user);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
}));

/**
 * @route   POST /api/auth/refresh-profile
 * @desc    Force refresh user profile data
 * @access  Private
 */
router.post('/refresh-profile', authenticateToken, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Profile refreshed successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        subscription: user.subscription,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    }
  });
}));

module.exports = router;