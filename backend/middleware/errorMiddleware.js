/**
 * Global Error Handler Middleware
 *
 * WHY A GLOBAL ERROR HANDLER?
 * - Without this, unhandled errors crash the server
 * - With this, errors are caught and sent as proper JSON responses
 * - Centralizes error formatting (consistent error response structure)
 *
 * HOW EXPRESS KNOWS THIS IS AN ERROR HANDLER:
 * - It has 4 parameters (err, req, res, next) instead of 3
 * - Express automatically routes errors here when next(error) is called
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific Mongoose errors
  // These are common errors you'll encounter during development

  // 1. Mongoose Bad ObjectId (invalid MongoDB ID format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // 2. Mongoose Duplicate Key Error (unique constraint violation)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for '${field}'. This ${field} already exists.`;
  }

  // 3. Mongoose Validation Error (required fields, enum violations, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('. ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Show error stack trace only in development (helps debugging)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
