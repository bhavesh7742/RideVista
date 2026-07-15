const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the rental business name'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One user can own at most one rental company
    },
    city: {
      type: String,
      required: [true, 'Please provide the city where your rental business is located'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide the physical address of the company'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide the contact phone number'],
      trim: true,
    },
    googleMapsLink: {
      type: String,
      trim: true,
      required: [true, 'Please provide the Google Maps location link for document verification'],
    },
    gpsTrackingAvailable: {
      type: Boolean,
      default: false, // Indicates if they have external GPS tracking in their fleet
    },
    isVerified: {
      type: Boolean,
      default: false, // Managed by Admin only
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
    description: {
      type: String,
      trim: true,
      default: 'Premium local vehicle rentals and coordination partner.',
    },
    companyId: {
      type: String,
      unique: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Please provide the owner name'],
      trim: true,
    },
    ownerPhone: {
      type: String,
      required: [true, 'Please provide the owner phone number'],
      trim: true,
    },
    managerName: {
      type: String,
      required: [true, 'Please provide the manager name'],
      trim: true,
    },
    managerPhone: {
      type: String,
      required: [true, 'Please provide the manager phone number'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide the business email'],
      trim: true,
    },
    verificationDocs: {
      type: [String],
      default: [],
    },
    logo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate unique companyId RV-COMP-XXXXX
companySchema.pre('save', async function () {
  if (!this.companyId) {
    const num = Math.floor(10000 + Math.random() * 90000);
    this.companyId = `RV-COMP-${num}`;
  }
});

// Indexing city for quick searches
companySchema.index({ city: 1 });

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
