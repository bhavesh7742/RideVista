const User = require('../models/User');
const Company = require('../models/Company');
const Driver = require('../models/Driver');
const generateToken = require('../utils/generateToken');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 *
 * FLOW:
 * 1. Extract fields from request body
 * 2. Check if email already exists
 * 3. Create user (password gets hashed automatically by pre-save hook)
 * 4. Generate JWT token
 * 5. Return user data + token
 */
const register = async (req, res) => {
  try {
    const { role } = req.body;

    if (role === 'rental_company') {
      const {
        ownerName,
        email,
        password,
        ownerPhone,
        
        name,
        city,
        address,
        googleMapsLink,
        gpsTrackingAvailable,
        description,
        managerName,
        managerPhone,
        companyEmail,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (req.files) {
          Object.values(req.files).flat().forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        }
        return res.status(400).json({
          success: false,
          message: 'An account with this owner email already exists',
        });
      }

      // Check if company name already exists
      const nameExists = await Company.findOne({ name });
      if (nameExists) {
        if (req.files) {
          Object.values(req.files).flat().forEach((file) => {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          });
        }
        return res.status(400).json({
          success: false,
          message: 'A company with this name is already registered',
        });
      }

      // Handle logo file upload
      let logoUrl = '';
      if (req.files && req.files['logo'] && req.files['logo'][0]) {
        const file = req.files['logo'][0];
        logoUrl = await uploadToCloudinary(file.path, 'ridevista/companies/logos');
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }

      // Handle verification documents file upload
      const verificationUrls = [];
      if (req.files && req.files['verificationDocs']) {
        for (const file of req.files['verificationDocs']) {
          const url = await uploadToCloudinary(file.path, 'ridevista/companies/documents');
          if (url) verificationUrls.push(url);
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
      }

      // Create user
      const user = await User.create({
        name: ownerName,
        email,
        password,
        role: 'rental_company',
        phone: ownerPhone,
      });

      // Create company
      const company = await Company.create({
        name,
        owner: user._id,
        city,
        address,
        phone: ownerPhone,
        googleMapsLink,
        gpsTrackingAvailable: gpsTrackingAvailable === 'true' || gpsTrackingAvailable === true,
        description: description || 'Premium local vehicle rentals and coordination partner.',
        ownerName,
        ownerPhone,
        managerName,
        managerPhone,
        email: companyEmail,
        verificationDocs: verificationUrls,
        logo: logoUrl || '',
      });

      // Update the User document with the company ID reference
      user.company = company._id;
      await user.save();

      return res.status(201).json({
        success: true,
        message: 'Rental Business registration successful! Please log in with your credentials.',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
          },
          company,
        },
      });
    }

    // Default tourist registration
    const { name, email, password, phone } = req.body;

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      phone,
    });

    // Generate JWT token with user's ID
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    if (req.files) {
      Object.values(req.files).flat().forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    // Handle MongoDB duplicate key error (race condition on email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 *
 * FLOW:
 * 1. Extract email and password from request body
 * 2. Find user by email (explicitly select password since it's hidden by default)
 * 3. Compare entered password with hashed password
 * 4. If match → generate token and return user data
 * 5. If no match → return generic error (don't reveal which field is wrong)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fixed credentials check for single admin
    if (email === 'admin@ridevista.com') {
      if (password === 'admin@123') {
        let adminUser = await User.findOne({ email: 'admin@ridevista.com' });
        if (!adminUser) {
          adminUser = await User.create({
            name: 'RideVista System Administrator',
            email: 'admin@ridevista.com',
            password: 'admin@123',
            role: 'admin',
            phone: '+91 9999999999'
          });
        }
        
        const token = generateToken(adminUser._id);
        return res.status(200).json({
          success: true,
          message: 'Admin login successful',
          data: {
            user: {
              _id: adminUser._id,
              name: adminUser.name,
              email: adminUser.email,
              role: adminUser.role,
              phone: adminUser.phone,
              avatar: adminUser.avatar,
            },
            token,
          },
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }
    }

    // Find user by email and explicitly include password field
    // Remember: select: false in the model means we must use +password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // SECURITY: Don't say "email not found" - that reveals valid emails to attackers
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords using the instance method we defined in User model
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // If the user's role is driver, verify they belong to the company matching the supplied companyId
    if (user.role === 'driver') {
      const { companyId } = req.body;
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required for driver login',
        });
      }

      const company = await Company.findOne({ companyId });
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'No rental company found with this ID',
        });
      }

      const driverProfile = await Driver.findOne({ user: user._id, company: company._id });
      if (!driverProfile) {
        return res.status(400).json({
          success: false,
          message: 'You are not registered under this rental company',
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private (requires JWT token)
 *
 * This route is called after the auth middleware has verified the token
 * and attached the user to req.user
 */
const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware after token verification
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * @desc    Change password for logged-in user
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current, new, and confirm password fields',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Fetch user including the hidden password field
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password (pre-save middleware will auto-hash this)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating password',
    });
  }
};

module.exports = { register, login, getMe, changePassword };
