const { body } = require('express-validator');

const createDriverValidator = [
  // User account credentials (needed to create driver user account)
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Driver name is required')
    .isLength({ max: 50 })
    .withMessage('Driver name cannot exceed 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Driver email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Driver temporary login password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Driver phone number is required')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  // Driver details
  body('licenseNumber')
    .trim()
    .notEmpty()
    .withMessage('Driving license number is required'),
];

const updateDriverValidator = [
  body('licenseNumber')
    .optional()
    .trim(),

  body('status')
    .optional()
    .isIn(['available', 'on-tour', 'inactive'])
    .withMessage('Status must be available, on-tour, or inactive'),
];

module.exports = { createDriverValidator, updateDriverValidator };
