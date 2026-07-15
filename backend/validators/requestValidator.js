const { body } = require('express-validator');
const mongoose = require('mongoose');

const createRequestValidator = [
  body('vehicle')
    .notEmpty()
    .withMessage('Vehicle ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Vehicle ID format'),

  body('driver')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Driver ID format'),

  body('pickupLocation')
    .trim()
    .notEmpty()
    .withMessage('Pickup location or Google Maps link is required'),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
];

const respondRequestValidator = [
  body('status')
    .notEmpty()
    .withMessage('Response status is required')
    .isIn(['accepted', 'rejected'])
    .withMessage('Status must be accepted or rejected'),
];

module.exports = { createRequestValidator, respondRequestValidator };
