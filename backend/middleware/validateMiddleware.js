const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 *
 * HOW IT WORKS:
 * 1. express-validator rules run first (they add errors to the request)
 * 2. This middleware checks if any errors were collected
 * 3. If errors exist → return 400 with error details (request never reaches controller)
 * 4. If no errors → call next() to pass request to controller
 *
 * This pattern is called "Validation Middleware Chain":
 * Route → [validator rules] → [validate middleware] → Controller
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Extract just the error messages for a clean response
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  }

  next();
};

module.exports = validate;
