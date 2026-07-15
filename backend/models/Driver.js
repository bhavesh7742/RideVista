const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver must be linked to a user account'],
      unique: true, // One user can only have one driver profile
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Driver must belong to a rental company'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide driver license number'],
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: {
        values: ['available', 'on-tour', 'inactive', 'pending_approval'],
        message: 'Status must be available, on-tour, inactive, or pending_approval',
      },
      default: 'pending_approval',
    },
    experience: {
      type: Number,
      default: 0, // Experience in years
    },
    languages: {
      type: [String],
      default: ['Hindi'],
    },
    tourDescription: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    numRatings: {
      type: Number,
      default: 0,
    },
    acceptedRequestsCount: {
      type: Number,
      default: 0,
    },
    completedToursCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick searches of available drivers within a company
driverSchema.index({ company: 1, status: 1 });

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
