const Vehicle = require('../models/Vehicle');
const Company = require('../models/Company');
const { uploadToCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

/**
 * @desc    Add a vehicle to rental company fleet
 * @route   POST /api/vehicles
 * @access  Private (rental_company role only)
 */
const addVehicle = async (req, res) => {
  try {
    // 1. Check if user has a company profile registered
    const company = await Company.findOne({ owner: req.user.id });
    if (!company) {
      return res.status(400).json({
        success: false,
        message: 'Please register your company profile first before adding vehicles',
      });
    }

    const {
      type,
      modelName,
      seatingCapacity,
      pricingPerDay,
      securityDeposit,
      withDriver,
      totalQuantity,
      availableQuantity,
    } = req.body;

    // Check for duplicate vehicle modelName within the same company fleet
    const duplicateVehicle = await Vehicle.findOne({ company: company._id, modelName });
    if (duplicateVehicle) {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this model name already exists in your fleet',
      });
    }

    // 2. Handle image uploads
    let imageUrl = '';
    if (req.body.image) {
      imageUrl = typeof req.body.image === 'string' ? req.body.image.trim() : req.body.image;
    }

    if (req.file) {
      const url = await uploadToCloudinary(req.file.path, 'ridevista/vehicles');
      if (url) {
        imageUrl = url;
      }
    }

    const tQty = totalQuantity !== undefined ? Number(totalQuantity) : 1;
    const aQty = availableQuantity !== undefined ? Number(availableQuantity) : tQty;

    // 3. Create the vehicle
    const vehicle = await Vehicle.create({
      company: company._id,
      type,
      modelName,
      seatingCapacity,
      pricingPerDay,
      securityDeposit,
      withDriver: withDriver === 'true' || withDriver === true,
      image: imageUrl,
      totalQuantity: tQty,
      availableQuantity: aQty,
      isAvailable: aQty > 0,
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added to fleet successfully',
      data: { vehicle },
    });
  } catch (error) {
    // Clean up uploaded files from temp disk if error occurred during creation
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    } else if (req.file) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }

    console.error('Add Vehicle Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding vehicle to fleet',
      error: error.message,
    });
  }
};

/**
 * @desc    Update vehicle details
 * @route   PUT /api/vehicles/:id
 * @access  Private (rental_company owner only)
 */
const updateVehicle = async (req, res) => {
  try {
    let vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Check if the company owning this vehicle belongs to the logged-in user
    const company = await Company.findOne({ owner: req.user.id });
    if (!company || vehicle.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update vehicles for this company',
      });
    }

    const {
      type,
      modelName,
      seatingCapacity,
      pricingPerDay,
      securityDeposit,
      isAvailable,
      withDriver,
      totalQuantity,
      availableQuantity,
    } = req.body;

    // Handle new image uploads if provided
    let imageUrl = '';
    if (req.body.image !== undefined) {
      imageUrl = typeof req.body.image === 'string' ? req.body.image.trim() : req.body.image;
    } else {
      imageUrl = vehicle.image;
    }

    if (req.file) {
      const url = await uploadToCloudinary(req.file.path, 'ridevista/vehicles');
      if (url) imageUrl = url;
    }

    // Update fields
    if (type) vehicle.type = type;
    if (modelName) vehicle.modelName = modelName;
    if (seatingCapacity) vehicle.seatingCapacity = seatingCapacity;
    if (pricingPerDay) vehicle.pricingPerDay = pricingPerDay;
    if (securityDeposit !== undefined) vehicle.securityDeposit = securityDeposit;
    if (totalQuantity !== undefined) vehicle.totalQuantity = Number(totalQuantity);

    if (availableQuantity !== undefined) {
      vehicle.availableQuantity = Number(availableQuantity);
      vehicle.isAvailable = Number(availableQuantity) > 0;
    } else if (isAvailable !== undefined) {
      vehicle.isAvailable = isAvailable === 'true' || isAvailable === true;
      if (!vehicle.isAvailable) {
        vehicle.availableQuantity = 0;
      }
    }

    if (withDriver !== undefined) {
      vehicle.withDriver = withDriver === 'true' || withDriver === true;
    }
    vehicle.image = imageUrl;

    await vehicle.save();

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { vehicle },
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
    }
    console.error('Update Vehicle Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating vehicle details',
    });
  }
};

/**
 * @desc    Delete a vehicle from the fleet
 * @route   DELETE /api/vehicles/:id
 * @access  Private (rental_company owner OR Admin only)
 */
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    // Check authorization
    if (req.user.role !== 'admin') {
      // If not admin, must be the owner of the company
      const company = await Company.findOne({ owner: req.user.id });
      if (!company || vehicle.company.toString() !== company._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete vehicles from this company',
        });
      }
    }

    // Delete the vehicle using deleteOne
    await Vehicle.deleteOne({ _id: vehicle._id });

    res.status(200).json({
      success: true,
      message: 'Vehicle removed from fleet successfully',
    });
  } catch (error) {
    console.error('Delete Vehicle Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting vehicle',
    });
  }
};

/**
 * @desc    Search and filter vehicles (Only in Jodhpur)
 * @route   GET /api/vehicles/search
 * @access  Public
 */
const searchVehicles = async (req, res) => {
  try {
    const { city, type, seating, maxBudget, withDriver, rating, availability, page = 1, limit = 10, sortBy, sortOrder = 'asc' } = req.query;

    // 1. Get matching companies based on city and rating (if provided)
    const companyQuery = {};
    if (city) {
      // Case-insensitive regex search
      companyQuery.city = { $regex: new RegExp(city, 'i') };
    }
    if (rating) {
      companyQuery.rating = { $gte: Number(rating) };
    }

    const matchingCompanies = await Company.find(companyQuery).populate('owner', 'name');
    const companyIds = matchingCompanies.map((c) => c._id);

    if (companyIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        totalPages: 0,
        currentPage: Number(page),
        data: [],
      });
    }

    // 2. Build search query object
    const query = {
      company: { $in: companyIds },
    };

    if (availability !== undefined) {
      query.isAvailable = availability === 'true' || availability === true;
    } else {
      query.isAvailable = true; // Default to available only
    }

    // Apply filters
    if (type) {
      query.type = type;
    }

    if (seating) {
      query.seatingCapacity = { $gte: Number(seating) }; // Seating capacity greater than or equal to requested
    }

    if (maxBudget) {
      query.pricingPerDay = { $lte: Number(maxBudget) }; // Pricing less than or equal to budget
    }

    if (withDriver !== undefined) {
      query.withDriver = withDriver === 'true' || withDriver === true;
    }

    // 3. Execute query with pagination and population
    let vehicles = await Vehicle.find(query)
      .populate({
        path: 'company',
        populate: {
          path: 'owner',
          select: 'name email phone'
        }
      });

    // Apply sorting in memory
    const order = sortOrder === 'desc' ? -1 : 1;

    if (sortBy === 'budget') {
      vehicles.sort((a, b) => {
        const valA = a.pricingPerDay || 0;
        const valB = b.pricingPerDay || 0;
        return (valA - valB) * order;
      });
    } else if (sortBy === 'rating') {
      vehicles.sort((a, b) => {
        const valA = a.company?.rating || 0;
        const valB = b.company?.rating || 0;
        return (valA - valB) * order;
      });
    } else if (sortBy === 'city') {
      vehicles.sort((a, b) => {
        const valA = (a.company?.city || '').toLowerCase();
        const valB = (b.company?.city || '').toLowerCase();
        if (valA < valB) return -1 * order;
        if (valA > valB) return 1 * order;
        return 0;
      });
    } else {
      // Default: Sort by pricingPerDay asc
      vehicles.sort((a, b) => (a.pricingPerDay - b.pricingPerDay));
    }

    const totalCount = vehicles.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedVehicles = vehicles.slice(skip, skip + Number(limit));

    res.status(200).json({
      success: true,
      count: paginatedVehicles.length,
      totalCount,
      totalPages: Math.ceil(totalCount / Number(limit)),
      currentPage: Number(page),
      data: paginatedVehicles,
    });
  } catch (error) {
    console.error('Search Vehicles Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching vehicles',
      error: error.message,
    });
  }
};

/**
 * @desc    Get vehicle details by ID (Public)
 * @route   GET /api/vehicles/:id
 * @access  Public
 */
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate({
      path: 'company',
      populate: {
        path: 'owner',
        select: 'name email phone'
      }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { vehicle },
    });
  } catch (error) {
    console.error('Get Vehicle By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving vehicle details',
    });
  }
};

const getCompanyVehicles = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user.id });
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Rental company profile not found',
      });
    }

    const vehicles = await Vehicle.find({ company: company._id }).populate('company');
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error('Get Company Vehicles Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving company vehicles',
    });
  }
};

/**
 * @desc    Get all vehicles (Admin feature)
 * @route   GET /api/vehicles/admin/all
 * @access  Private (Admin only)
 */
const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('company');
    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error('Get All Vehicles Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving all vehicles',
    });
  }
};

module.exports = {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicles,
  getVehicleById,
  getCompanyVehicles,
  getAllVehicles,
};
