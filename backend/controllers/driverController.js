const Driver = require('../models/Driver');
const Company = require('../models/Company');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

/**
 * @desc    Add a driver to the rental company (by company owner)
 * @route   POST /api/drivers
 * @access  Private (rental_company owner only)
 */
const addDriver = async (req, res) => {
  let createdUser = null;
  try {
    // 1. Verify owner has a company
    const company = await Company.findOne({ owner: req.user.id });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Please register your company profile first before adding drivers',
      });
    }

    const { name, email, password, phone, licenseNumber, experience, languages, tourDescription } = req.body;

    // Profile photo is mandatory
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Driver profile photo is mandatory',
      });
    }

    // 2. Check if user credentials already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'A user account with this email already exists',
      });
    }

    // 3. Check if license number already exists
    const existingLicense = await Driver.findOne({ licenseNumber });
    if (existingLicense) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'This driving license number is already registered',
      });
    }

    // Upload profile photo
    const avatarUrl = await uploadToCloudinary(req.file.path, 'ridevista/avatars');

    // 4. Create User account for driver
    createdUser = await User.create({
      name,
      email,
      password,
      role: 'driver',
      phone,
      avatar: avatarUrl || '',
    });

    // 5. Create Driver profile document (status available immediately for added drivers)
    const driver = await Driver.create({
      user: createdUser._id,
      company: company._id,
      licenseNumber,
      experience: experience ? Number(experience) : 0,
      languages: languages ? (Array.isArray(languages) ? languages : languages.split(',')) : ['Hindi'],
      tourDescription: tourDescription || '',
      status: 'available', // Direct additions are active immediately
    });

    res.status(201).json({
      success: true,
      message: 'Driver added and registered successfully',
      data: {
        driver: {
          _id: driver._id,
          licenseNumber: driver.licenseNumber,
          status: driver.status,
          experience: driver.experience,
          languages: driver.languages,
          tourDescription: driver.tourDescription,
          user: {
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            phone: createdUser.phone,
            avatar: createdUser.avatar,
          },
        },
      },
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // Cleanup created User if driver profile creation failed
    if (createdUser && createdUser._id) {
      await User.deleteOne({ _id: createdUser._id });
    }

    console.error('Add Driver Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error registering driver',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all drivers of the company
 * @route   GET /api/drivers
 * @access  Private (rental_company owner only)
 */
const getCompanyDrivers = async (req, res) => {
  try {
    // Find company of logged in user
    const company = await Company.findOne({ owner: req.user.id });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'No rental company profile found for this account',
      });
    }

    // Fetch drivers (all statuses - available, on-tour, inactive, pending_approval)
    const drivers = await Driver.find({ company: company._id }).populate({
      path: 'user',
      select: 'name email phone avatar',
    });

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error('Get Company Drivers Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching drivers',
    });
  }
};

/**
 * @desc    Get all drivers globally
 * @route   GET /api/drivers/admin/all
 * @access  Private (Admin only)
 */
const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate({
        path: 'user',
        select: 'name email phone avatar',
      })
      .populate('company', 'name');

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: { drivers },
    });
  } catch (error) {
    console.error('Get All Drivers Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching drivers globally',
    });
  }
};

/**
 * @desc    Update driver profile (status, experience, languages, license etc.)
 * @route   PUT /api/drivers/:id
 * @access  Private (company owner OR the driver themselves)
 */
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).populate('user');
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    // Authorization: Must be company owner or the driver user themselves
    const isSelf = req.user.id.toString() === driver.user._id.toString();
    
    let isOwner = false;
    if (req.user.role === 'rental_company') {
      const company = await Company.findOne({ owner: req.user.id });
      if (company && driver.company.toString() === company._id.toString()) {
        isOwner = true;
      }
    }

    if (!isSelf && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this driver profile',
      });
    }

    const { licenseNumber, status, experience, languages, tourDescription, name, phone } = req.body;

    if (licenseNumber) driver.licenseNumber = licenseNumber;
    if (status) driver.status = status;
    if (experience !== undefined) driver.experience = Number(experience);
    if (languages) {
      driver.languages = Array.isArray(languages) ? languages : languages.split(',');
    }
    if (tourDescription !== undefined) driver.tourDescription = tourDescription;

    await driver.save();

    // Support updating user name/phone if file/data is passed
    const userUpdate = {};
    if (name) userUpdate.name = name;
    if (phone) userUpdate.phone = phone;

    if (req.file) {
      const avatarUrl = await uploadToCloudinary(req.file.path, 'ridevista/avatars');
      if (avatarUrl) userUpdate.avatar = avatarUrl;
    }

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(driver.user._id, userUpdate);
    }

    const updatedDriver = await Driver.findById(driver._id).populate({
      path: 'user',
      select: 'name email phone avatar',
    });

    res.status(200).json({
      success: true,
      message: 'Driver profile updated successfully',
      data: { driver: updatedDriver },
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update Driver Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating driver details',
    });
  }
};

/**
 * @desc    Delete/Remove driver from company
 * @route   DELETE /api/drivers/:id
 * @access  Private (rental_company owner only)
 */
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    // Check authorization: Must be admin or owner of the driver's company
    if (req.user.role !== 'admin') {
      const company = await Company.findOne({ owner: req.user.id });
      if (!company || company._id.toString() !== driver.company.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to remove this driver',
        });
      }
    }

    // Capture user ID to delete user credentials too
    const driverUserId = driver.user;

    // Delete driver profile
    await Driver.deleteOne({ _id: driver._id });
    
    // Delete driver user credentials
    await User.deleteOne({ _id: driverUserId });

    res.status(200).json({
      success: true,
      message: 'Driver removed and credentials deleted successfully',
    });
  } catch (error) {
    console.error('Delete Driver Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting driver',
    });
  }
};

/**
 * @desc    Get available drivers by company ID (for tourist selection)
 * @route   GET /api/drivers/company/:companyId
 * @access  Private (any authenticated user)
 */
const getAvailableDriversByCompany = async (req, res) => {
  try {
    const drivers = await Driver.find({
      company: req.params.companyId,
      status: 'available',
    }).populate('user', 'name phone avatar');

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error('Get Available Drivers Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching drivers',
    });
  }
};

/**
 * @desc    Get driver profile for logged in driver
 * @route   GET /api/drivers/me
 * @access  Private (driver role only)
 */
const getMeDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ user: req.user.id })
      .populate({
        path: 'user',
        select: 'name email phone avatar'
      })
      .populate('company');
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error('Get Me Driver Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching driver profile',
    });
  }
};

/**
 * @desc    Register driver profile independently
 * @route   POST /api/drivers/register-independent
 * @access  Private (driver role only)
 */
const registerIndependentDriver = async (req, res) => {
  try {
    if (req.user.role !== 'driver') {
      return res.status(403).json({
        success: false,
        message: 'Only driver accounts can register independent profiles',
      });
    }

    const existingProfile = await Driver.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered a driver profile',
      });
    }

    const { companyId, licenseNumber, experience, languages, tourDescription } = req.body;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the rental company ID you want to register under',
      });
    }

    const company = await Company.findOne({ companyId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Rental company profile not found for this Company ID',
      });
    }

    const existingLicense = await Driver.findOne({ licenseNumber });
    if (existingLicense) {
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'This driving license number is already registered',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Driver profile photo is mandatory',
      });
    }

    const avatarUrl = await uploadToCloudinary(req.file.path, 'ridevista/avatars');
    await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });

    const driver = await Driver.create({
      user: req.user.id,
      company: company._id,
      licenseNumber,
      experience: experience ? Number(experience) : 0,
      languages: languages ? (Array.isArray(languages) ? languages : languages.split(',')) : ['Hindi'],
      tourDescription: tourDescription || '',
      status: 'pending_approval', // Needs owner activation
    });

    res.status(201).json({
      success: true,
      message: 'Driver profile registered successfully. Awaiting company approval.',
      data: { driver },
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Register Independent Driver Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error registering driver profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Approve independent driver registration
 * @route   PATCH /api/drivers/:id/approve
 * @access  Private (company owner only)
 */
const approveDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    const company = await Company.findOne({ owner: req.user.id });
    if (!company || driver.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve drivers for this company',
      });
    }

    driver.status = 'available';
    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Driver registration request approved successfully',
      data: { driver },
    });
  } catch (error) {
    console.error('Approve Driver Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving driver registration',
    });
  }
};

/**
 * @desc    Reject independent driver registration
 * @route   PATCH /api/drivers/:id/reject
 * @access  Private (company owner only)
 */
const rejectDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found',
      });
    }

    const company = await Company.findOne({ owner: req.user.id });
    if (!company || driver.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject drivers for this company',
      });
    }

    driver.status = 'inactive';
    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Driver registration request rejected successfully',
      data: { driver },
    });
  } catch (error) {
    console.error('Reject Driver Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting driver registration',
    });
  }
};

module.exports = {
  addDriver,
  getCompanyDrivers,
  updateDriver,
  deleteDriver,
  getAvailableDriversByCompany,
  registerIndependentDriver,
  approveDriver,
  rejectDriver,
  getMeDriver,
  getAllDrivers,
};
