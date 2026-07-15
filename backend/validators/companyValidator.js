const { body } = require('express-validator');

const createCompanyValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ max: 100 })
    .withMessage('Business name cannot exceed 100 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Physical address is required'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Contact phone number is required'),

  body('googleMapsLink')
    .trim()
    .notEmpty()
    .withMessage('Google Maps link is required')
    .custom((value) => {
      return value.includes('google.com/maps') || value.includes('maps.google') || value.includes('goo.gl');
    })
    .withMessage('Please provide a valid Google Maps location link (e.g., google.com/maps or goo.gl)'),

  body('ownerName')
    .trim()
    .notEmpty()
    .withMessage('Owner name is required'),

  body('ownerPhone')
    .trim()
    .notEmpty()
    .withMessage('Owner phone number is required'),

  body('managerName')
    .trim()
    .notEmpty()
    .withMessage('Manager name is required'),

  body('managerPhone')
    .trim()
    .notEmpty()
    .withMessage('Manager phone number is required'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Business email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Company description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('gpsTrackingAvailable')
    .notEmpty()
    .withMessage('GPS tracking status option is required')
    .isBoolean()
    .withMessage('GPS tracking status must be a boolean (true/false)'),
];

const updateCompanyValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Business name cannot exceed 100 characters'),

  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty if provided'),

  body('address')
    .optional()
    .trim(),

  body('phone')
    .optional()
    .trim(),

  body('googleMapsLink')
    .optional()
    .trim()
    .custom((value) => {
      return value.includes('google.com/maps') || value.includes('maps.google') || value.includes('goo.gl');
    })
    .withMessage('Please provide a valid Google Maps location link (e.g., google.com/maps or goo.gl)'),

  body('ownerName')
    .optional()
    .trim(),

  body('ownerPhone')
    .optional()
    .trim(),

  body('managerName')
    .optional()
    .trim(),

  body('managerPhone')
    .optional()
    .trim(),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('gpsTrackingAvailable')
    .optional()
    .isBoolean()
    .withMessage('GPS tracking status must be a boolean (true/false)'),
];

module.exports = { createCompanyValidator, updateCompanyValidator };
