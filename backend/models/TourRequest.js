const mongoose = require('mongoose');

const tourRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must belong to a user (tourist)'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Request must be sent to a rental company'],
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'Please specify the vehicle being requested'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    pickupLocation: {
      type: String,
      required: [true, 'Please provide your pickup location or a Google Maps link'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'completed'],
        message: 'Status must be pending, accepted, rejected, or completed',
      },
      default: 'pending',
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up queries for user requests history and driver incoming requests
tourRequestSchema.index({ user: 1 });
tourRequestSchema.index({ driver: 1, status: 1 });

const TourRequest = mongoose.model('TourRequest', tourRequestSchema);

module.exports = TourRequest;
