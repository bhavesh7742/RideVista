const Company = require('../models/Company');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const TourRequest = require('../models/TourRequest');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

/**
 * @desc    Create a new rental company profile
 * @route   POST /api/companies
 * @access  Private (rental_company role only)
 */
const createCompany = async (req, res) => {
  try {
    // Check if the user already owns a company
    const existingCompany = await Company.findOne({ owner: req.user.id });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'You already have a registered rental company profile',
      });
    }

    const { 
      name, city, address, phone, googleMapsLink, gpsTrackingAvailable, description,
      ownerName, ownerPhone, managerName, managerPhone, email
    } = req.body;

    // Check if company name already exists in database
    const nameExists = await Company.findOne({ name });
    if (nameExists) {
      // Clean up uploaded files if any
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

    // Create the company
    const company = await Company.create({
      name,
      owner: req.user.id,
      city,
      address,
      phone,
      googleMapsLink,
      gpsTrackingAvailable,
      description,
      ownerName,
      ownerPhone,
      managerName,
      managerPhone,
      email,
      verificationDocs: verificationUrls,
      logo: logoUrl || '',
    });

    // Update the User document with the company ID reference
    await User.findByIdAndUpdate(req.user.id, { company: company._id });

    res.status(201).json({
      success: true,
      message: 'Rental company profile created successfully',
      data: { company },
    });
  } catch (error) {
    console.error('Create Company Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during company profile creation',
      error: error.message,
    });
  }
};

/**
 * @desc    Get logged in user's company profile
 * @route   GET /api/companies/my-company
 * @access  Private (rental_company role only)
 */
const getOwnCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'No rental company profile found for this account',
      });
    }

    res.status(200).json({
      success: true,
      data: { company },
    });
  } catch (error) {
    console.error('Get Own Company Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching company profile',
    });
  }
};

/**
 * @desc    Update own company profile
 * @route   PUT /api/companies/my-company
 * @access  Private (rental_company role only)
 */
const updateOwnCompany = async (req, res) => {
  try {
    let company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'No rental company profile found for this account',
      });
    }

    // Update fields
    const { 
      name, city, address, phone, googleMapsLink, gpsTrackingAvailable, description,
      ownerName, ownerPhone, managerName, managerPhone, email
    } = req.body;
    
    if (name) company.name = name;
    if (city) company.city = city;
    if (address) company.address = address;
    if (phone) company.phone = phone;
    if (googleMapsLink) company.googleMapsLink = googleMapsLink;
    if (gpsTrackingAvailable !== undefined) {
      company.gpsTrackingAvailable = gpsTrackingAvailable === 'true' || gpsTrackingAvailable === true;
    }
    if (description !== undefined) {
      company.description = description;
    }
    if (ownerName) company.ownerName = ownerName;
    if (ownerPhone) company.ownerPhone = ownerPhone;
    if (managerName) company.managerName = managerName;
    if (managerPhone) company.managerPhone = managerPhone;
    if (email) company.email = email;

    // Handle logo file upload
    if (req.files && req.files['logo'] && req.files['logo'][0]) {
      const file = req.files['logo'][0];
      const logoUrl = await uploadToCloudinary(file.path, 'ridevista/companies/logos');
      if (logoUrl) company.logo = logoUrl;
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    // Handle verification documents file upload
    if (req.files && req.files['verificationDocs'] && req.files['verificationDocs'].length > 0) {
      const verificationUrls = [];
      for (const file of req.files['verificationDocs']) {
        const url = await uploadToCloudinary(file.path, 'ridevista/companies/documents');
        if (url) verificationUrls.push(url);
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
      company.verificationDocs = verificationUrls;
    }

    // Save changes (triggers validation)
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Rental company profile updated successfully',
      data: { company },
    });
  } catch (error) {
    console.error('Update Company Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating company profile',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify a rental company (Admin-only feature)
 * @route   PATCH /api/companies/:id/verify
 * @access  Private (Admin only)
 */
const verifyCompany = async (req, res) => {
  try {
    const { isVerified } = req.body;

    if (isVerified === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide isVerified status (true/false) in the request body',
      });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    company.isVerified = isVerified;
    await company.save();

    res.status(200).json({
      success: true,
      message: `Company business verification updated to ${isVerified}`,
      data: { company },
    });
  } catch (error) {
    console.error('Verify Company Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating company verification status',
    });
  }
};

/**
 * @desc    Get all registered companies (Admin feature)
 * @route   GET /api/companies
 * @access  Private (Admin only)
 */
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Attach basic statistics to each company for admin dashboard
    const enrichedCompanies = await Promise.all(
      companies.map(async (company) => {
        const totalVehicles = await Vehicle.countDocuments({ company: company._id });
        const totalDrivers = await Driver.countDocuments({ company: company._id });
        const driverRequests = await TourRequest.countDocuments({ company: company._id });
        const activeDrivers = await Driver.countDocuments({ company: company._id, status: 'available' });

        return {
          ...company,
          stats: {
            totalVehicles,
            totalDrivers,
            driverRequests,
            activeDrivers,
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedCompanies.length,
      data: { companies: enrichedCompanies },
    });
  } catch (error) {
    console.error('Get All Companies Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching all companies list',
    });
  }
};

/**
 * @desc    Get company details by ID (Public)
 * @route   GET /api/companies/:id
 * @access  Public
 */
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('owner', 'name email phone');
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { company },
    });
  } catch (error) {
    console.error('Get Company By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching company details',
    });
  }
};

/**
 * @desc    Delete a company (Admin feature)
 * @route   DELETE /api/companies/:id
 * @access  Private (Admin only)
 */
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    // Cascade delete associated data
    await Vehicle.deleteMany({ company: company._id });
    await Driver.deleteMany({ company: company._id });
    await TourRequest.deleteMany({ company: company._id });
    
    // Also remove the company reference from the owner user
    if (company.owner) {
      await User.findByIdAndUpdate(company.owner, { $unset: { company: 1 } });
    }

    await company.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Company and associated resources deleted successfully',
    });
  } catch (error) {
    console.error('Delete Company Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting company',
    });
  }
};

/**
 * @desc    Verify companyId and return name & email
 * @route   GET /api/companies/verify-id/:companyId
 * @access  Public
 */
const verifyCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findOne({ companyId });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'No rental company found with this ID',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: company.name,
        email: company.email,
        _id: company._id,
      },
    });
  } catch (error) {
    console.error('Verify Company ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying Company ID',
    });
  }
};

module.exports = {
  createCompany,
  getOwnCompany,
  updateOwnCompany,
  verifyCompany,
  getAllCompanies,
  getCompanyById,
  deleteCompany,
  verifyCompanyById,
};
