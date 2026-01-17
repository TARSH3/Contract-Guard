/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 * Adds user object to req.user if token is valid
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token - user not found'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Account is deactivated'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }
    
    return res.status(500).json({
      error: 'Server error',
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to check if user has remaining contract analyses
 */
const checkContractLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to continue'
      });
    }
    
    // Skip limit check in development mode
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    if (!req.user.canAnalyzeContract()) {
      return res.status(403).json({
        error: 'Limit exceeded',
        message: 'No contract analyses remaining. Please upgrade your plan.',
        contractsRemaining: req.user.subscription.contractsRemaining,
        plan: req.user.subscription.plan
      });
    }
    
    next();
  } catch (error) {
    console.error('Contract limit check error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'Failed to check contract limit'
    });
  }
};

/**
 * Middleware to check subscription plan access
 * @param {string[]} allowedPlans - Array of allowed subscription plans
 */
const checkSubscriptionPlan = (allowedPlans) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please log in to continue'
        });
      }
      
      const userPlan = req.user.subscription.plan;
      
      if (!allowedPlans.includes(userPlan)) {
        return res.status(403).json({
          error: 'Upgrade required',
          message: `This feature requires a ${allowedPlans.join(' or ')} subscription`,
          currentPlan: userPlan,
          requiredPlans: allowedPlans
        });
      }
      
      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      return res.status(500).json({
        error: 'Server error',
        message: 'Failed to check subscription'
      });
    }
  };
};

/**
 * Optional authentication middleware
 * Adds user to req.user if token is provided and valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return next(); // No token provided, continue without user
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @param {string} expiresIn - Token expiration time (default: 7d)
 * @returns {string} JWT token
 */
const generateToken = (user, expiresIn = '7d') => {
  return jwt.sign(
    { 
      userId: user._id,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Generate refresh token for user
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = {
  authenticateToken,
  checkContractLimit,
  checkSubscriptionPlan,
  optionalAuth,
  generateToken,
  generateRefreshToken
};