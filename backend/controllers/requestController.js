const TourRequest = require('../models/TourRequest');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Company = require('../models/Company');

/**
 * @desc    Send a driver-tour request
 * @route   POST /api/requests
 * @access  Private (user/tourist role only)
 */
const sendRequest = async (req, res) => {
  try {
    const { vehicle: vehicleId, driver: driverId, pickupLocation, message } = req.body;

    // 1. Verify vehicle exists, is available, and has "withDriver" option enabled
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    if (!vehicle.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This vehicle is currently unavailable',
      });
    }

    if (!vehicle.withDriver) {
      return res.status(400).json({
        success: false,
        message: 'This vehicle does not support driver-tour booking',
      });
    }

    // 2. Verify driver exists and is available (if driverId is provided)
    let finalDriverId = null;
    if (driverId) {
      const driver = await Driver.findById(driverId).populate('user', 'name');
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found',
        });
      }

      if (driver.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: `Driver ${driver.user.name} is currently busy or unavailable`,
        });
      }
      finalDriverId = driver._id;
    }

    // 3. Create the request
    const tourRequest = await TourRequest.create({
      user: req.user.id,
      company: vehicle.company,
      vehicle: vehicleId,
      driver: finalDriverId,
      pickupLocation,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Driver tour request sent successfully. Awaiting driver response.',
      data: { tourRequest },
    });
  } catch (error) {
    console.error('Send Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending request',
      error: error.message,
    });
  }
};

/**
 * @desc    Get sent requests history (For Tourist)
 * @route   GET /api/requests/tourist
 * @access  Private (user/tourist role only)
 */
const getTouristRequests = async (req, res) => {
  try {
    const requests = await TourRequest.find({ user: req.user.id })
      .populate('company', 'name phone city address')
      .populate('vehicle', 'modelName pricingPerDay type')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone email avatar',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Get Tourist Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching requests history',
    });
  }
};

/**
 * @desc    Get incoming requests (For Driver or Company Owner)
 * @route   GET /api/requests/incoming
 * @access  Private (driver or rental_company owner only)
 */
const getIncomingRequests = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'driver') {
      // Find driver profile first
      const driver = await Driver.findOne({ user: req.user.id });
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found',
        });
      }
      // Query requests belonging to the driver's company:
      // either specifically assigned to this driver, or unassigned (driver: null) and pending
      query.company = driver.company;
      query.$or = [
        { driver: driver._id },
        { driver: null, status: 'pending' }
      ];
    } else if (req.user.role === 'rental_company') {
      // Find company profile first
      const company = await Company.findOne({ owner: req.user.id });
      if (!company) {
        return res.status(404).json({
          success: false,
          message: 'Rental company profile not found',
        });
      }
      query.company = company._id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const requests = await TourRequest.find(query)
      .populate('user', 'name phone email')
      .populate('vehicle', 'modelName pricingPerDay type')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name phone',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Get Incoming Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching incoming requests',
    });
  }
};

/**
 * @desc    Respond to a tour request (Accept or Reject)
 * @route   PATCH /api/requests/:id/respond
 * @access  Private (driver role only)
 *
 * HOW IT WORKS (Interview Flow Detail):
 * 1. Driver must be logged in. Find their Driver profile.
 * 2. Fetch the TourRequest. Verify that it was assigned to this specific driver.
 * 3. Make sure the request is still pending.
 * 4. Update the request status ('accepted' or 'rejected') and respondedAt date.
 * 5. If accepted:
 *    - Update Driver status to 'on-tour' (no overlapping bookings).
 *    - The response automatically exposes user's pickup details and phone number to the driver,
 *      and client gets driver's phone number in their dashboard.
 */
const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'

    // 1. Find the driver profile of the logged-in user
    const driverProfile = await Driver.findOne({ user: req.user.id });
    if (!driverProfile) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found for this account',
      });
    }

    // 2. Find request
    const tourRequest = await TourRequest.findById(req.params.id);
    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: 'Tour request not found',
      });
    }

    // 3. Verify driver ownership of this request or check if it's unassigned for the same company
    if (tourRequest.driver && tourRequest.driver.toString() !== driverProfile._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this request',
      });
    }

    if (tourRequest.company.toString() !== driverProfile.company.toString()) {
      return res.status(403).json({
        success: false,
        message: 'This request belongs to another company',
      });
    }

    // 4. Ensure request status transitions are correct
    if (tourRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request has already been ${tourRequest.status}`,
      });
    }

    // 5. Update statuses
    tourRequest.status = status;
    tourRequest.respondedAt = Date.now();
    tourRequest.driver = driverProfile._id; // Assign this driver

    if (status === 'accepted') {
      // Set driver availability to 'on-tour' and increment accepted requests count
      driverProfile.status = 'on-tour';
      driverProfile.acceptedRequestsCount = (driverProfile.acceptedRequestsCount || 0) + 1;
      await driverProfile.save();
    }

    await tourRequest.save();

    // Populate tourist user information to send in response
    const populatedRequest = await TourRequest.findById(tourRequest._id)
      .populate('user', 'name phone email')
      .populate('vehicle', 'modelName pricingPerDay');

    res.status(200).json({
      success: true,
      message: `Request successfully ${status}`,
      data: {
        tourRequest: populatedRequest,
      },
    });
  } catch (error) {
    console.error('Respond Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing request response',
    });
  }
};

/**
 * @desc    Get company requests
 * @route   GET /api/requests/company
 * @access  Private (rental_company only)
 */
const getCompanyRequests = async (req, res) => {
  try {
    const company = await Company.findOne({ owner: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    const requests = await TourRequest.find({ company: company._id })
      .populate('user', 'name email phone avatar')
      .populate('driver', 'status')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name email phone avatar' } })
      .populate('vehicle', 'modelName pricingPerDay type')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    console.error('Get Company Requests Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all tour requests globally (Admin feature)
 * @route   GET /api/requests/admin/all
 * @access  Private (Admin only)
 */
const getAllRequests = async (req, res) => {
  try {
    const requests = await TourRequest.find()
      .populate('user', 'name email phone avatar')
      .populate('driver', 'status')
      .populate({
        path: 'driver',
        populate: {
          path: 'user',
          select: 'name email phone avatar',
        },
      })
      .populate('company', 'name email phone')
      .populate('vehicle', 'name brand type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: { requests },
    });
  } catch (error) {
    console.error('Get All Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching all tour requests',
    });
  }
};

/**
 * @desc    Mark a tour request as completed (Tourist only)
 * @route   PATCH /api/requests/:id/complete
 * @access  Private (tourist role only)
 */
const completeRequest = async (req, res) => {
  try {
    const tourRequest = await TourRequest.findById(req.params.id);
    if (!tourRequest) {
      return res.status(404).json({
        success: false,
        message: 'Tour request not found',
      });
    }

    // Verify user ownership
    if (tourRequest.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this request',
      });
    }

    if (tourRequest.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted tours can be marked as completed',
      });
    }

    tourRequest.status = 'completed';
    tourRequest.completedAt = Date.now();
    await tourRequest.save();

    // Increment driver's completed tours count and set them back to 'available'
    const driver = await Driver.findById(tourRequest.driver);
    if (driver) {
      driver.completedToursCount = (driver.completedToursCount || 0) + 1;
      driver.status = 'available';
      await driver.save();
    }

    res.status(200).json({
      success: true,
      message: 'Tour completed successfully',
      data: { tourRequest },
    });
  } catch (error) {
    console.error('Complete Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing tour request',
    });
  }
};

module.exports = {
  sendRequest,
  getTouristRequests,
  getCompanyRequests,
  getIncomingRequests,
  respondToRequest,
  getAllRequests,
  completeRequest,
};
