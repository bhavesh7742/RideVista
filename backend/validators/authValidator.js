const { body } = require('express-validator');

/**
 * Validation rules for user registration
 *
 * WHY express-validator?
 * - Validates BEFORE your controller logic runs
 * - Returns consistent, user-friendly error messages
 * - Sanitizes input (trim, escape) to prevent XSS attacks
 *
 * Alternative: Joi library - more powerful but heavier
 * We chose express-validator because it integrates directly with Express middleware chain
 */
const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(), // Converts to lowercase, removes dots in gmail, etc.

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('role')
    .optional()
    .isIn(['user', 'rental_company', 'driver', 'admin'])
    .withMessage('Role must be user, rental_company, driver, or admin'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

/**
 * Validation rules for user login
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
