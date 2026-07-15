const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true, // Automatically converts to lowercase
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // IMPORTANT: Never return password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'rental_company', 'driver', 'admin'],
        message: 'Role must be either user, rental_company, driver, or admin',
      },
      default: 'user',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '', // Will store Cloudinary URL
    },
    // For rental_company role - reference to their Company document
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ---------------------
// PRE-SAVE MIDDLEWARE
// ---------------------
// This runs BEFORE every .save() call
// It hashes the password so we never store plain text
userSchema.pre('save', async function () {
  // Only hash if password was modified (not on every save)
  // Without this check, password gets re-hashed on profile updates
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt (random data added to password before hashing)
  // Cost factor 12 = good balance between security and speed
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ---------------------
// INSTANCE METHODS
// ---------------------
// Compare entered password with hashed password in database
// Used during login - we can't "decrypt" bcrypt, we can only compare
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
