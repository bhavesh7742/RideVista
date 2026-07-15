const { body } = require('express-validator');

const createVehicleValidator = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isIn(['car', 'bike', 'scooty', 'tempo', 'auto'])
    .withMessage('Vehicle type must be car, bike, scooty, tempo, or auto'),

  body('modelName')
    .trim()
    .notEmpty()
    .withMessage('Vehicle model name is required'),

  body('seatingCapacity')
    .notEmpty()
    .withMessage('Seating capacity is required')
    .isInt({ min: 1 })
    .withMessage('Seating capacity must be an integer of at least 1'),


  body('pricingPerDay')
    .notEmpty()
    .withMessage('Pricing per day is required')
    .isFloat({ min: 0 })
    .withMessage('Pricing per day must be a positive number'),

  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),

  body('withDriver')
    .optional()
    .isBoolean()
    .withMessage('withDriver option must be a boolean (true/false)'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable status must be a boolean (true/false)'),

  body('totalQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a positive integer'),

  body('availableQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available quantity must be a positive integer'),
];

const updateVehicleValidator = [
  body('type')
    .optional()
    .trim()
    .isIn(['car', 'bike', 'scooty', 'tempo', 'auto'])
    .withMessage('Vehicle type must be car, bike, scooty, tempo, or auto'),

  body('modelName')
    .optional()
    .trim(),

  body('seatingCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Seating capacity must be an integer of at least 1'),


  body('pricingPerDay')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Pricing per day must be a positive number'),

  body('securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit must be a positive number'),

  body('withDriver')
    .optional()
    .isBoolean()
    .withMessage('withDriver option must be a boolean (true/false)'),

  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable status must be a boolean (true/false)'),

  body('totalQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a positive integer'),

  body('availableQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available quantity must be a positive integer'),
];

module.exports = { createVehicleValidator, updateVehicleValidator };
