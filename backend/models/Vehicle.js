const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Vehicle must belong to a rental company'],
    },
    type: {
      type: String,
      required: [true, 'Please specify vehicle type'],
      enum: {
        values: ['car', 'bike', 'scooty', 'tempo', 'auto'],
        message: 'Vehicle type must be car, bike, scooty, tempo, or auto',
      },
    },
    modelName: {
      type: String,
      required: [true, 'Please specify the vehicle model name'],
      trim: true,
    },
    seatingCapacity: {
      type: Number,
      required: [true, 'Please specify seating capacity'],
      min: [1, 'Seating capacity must be at least 1'],
    },
    pricingPerDay: {
      type: Number,
      required: [true, 'Please specify pricing per day'],
      min: [0, 'Pricing per day cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Please specify security deposit amount'],
      min: [0, 'Security deposit cannot be negative'],
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Please specify total quantity'],
      default: 1,
      min: [0, 'Total quantity cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Please specify available quantity'],
      default: 1,
      min: [0, 'Available quantity cannot be negative'],
    },
    withDriver: {
      type: Boolean,
      default: false, // User can select if they want a driver (tour coordination)
    },
    image: {
      type: String,
      default: '', // Cloudinary image URL
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for search optimizations (filters: type, seating, budget, availability)
vehicleSchema.index({ type: 1, seatingCapacity: 1, pricingPerDay: 1, isAvailable: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;
