/**
 * Global Error Handler Middleware
 * Handles all errors in the application and returns consistent error responses
 */

/**
 * Global error handling middleware
 * Must be the last middleware in the application
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Maximum size is 10MB';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = { message, statusCode: 400 };
  }

  // OpenAI API errors
  if (err.type === 'insufficient_quota') {
    const message = 'AI service temporarily unavailable. Please try again later.';
    error = { message, statusCode: 503 };
  }

  if (err.type === 'rate_limit_exceeded') {
    const message = 'Too many requests. Please try again in a moment.';
    error = { message, statusCode: 429 };
  }

  // PDF processing errors
  if (err.message && err.message.includes('PDF')) {
    const message = 'Failed to process PDF file. Please ensure it\'s a valid PDF document.';
    error = { message, statusCode: 400 };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // Don't expose internal errors in production
  const errorResponse = {
    success: false,
    error: message
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  // Add request ID for tracking (if available)
  if (req.id) {
    errorResponse.requestId = req.id;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors and pass them to error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found middleware
 * Handles 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Validation error helper
 * Creates a standardized validation error response
 */
const validationError = (errors) => {
  const message = errors.map(error => error.msg).join(', ');
  return new AppError(message, 400);
};

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  notFound,
  validationError
};