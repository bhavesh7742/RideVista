const User = require('../models/User');
const Company = require('../models/Company');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const TourRequest = require('../models/TourRequest');

/**
 * @desc    Get complete system analytics for admin dashboard
 * @route   GET /api/analytics/admin-dashboard
 * @access  Private (Admin only)
 */
const getAdminAnalytics = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCompanies = await Company.countDocuments();
    const totalDrivers = await Driver.countDocuments();
    const totalVehicles = await Vehicle.countDocuments();
    const totalDriverRequests = await TourRequest.countDocuments();

    // Specific request stats
    const pendingRequests = await TourRequest.countDocuments({ status: 'pending' });
    const acceptedRequests = await TourRequest.countDocuments({ status: 'accepted' });
    const rejectedRequests = await TourRequest.countDocuments({ status: 'rejected' });
    const completedTours = await TourRequest.countDocuments({ status: 'completed' });

    // Specific company stats
    const verifiedCompanies = await Company.countDocuments({ isVerified: true });
    const pendingCompanies = totalCompanies - verifiedCompanies;

    // Advanced analytics
    
    // 1. Drivers per company (Top 5)
    const driversPerCompany = await Driver.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'companyData' } },
      { $unwind: '$companyData' },
      { $project: { companyName: '$companyData.name', count: 1 } }
    ]);

    // 2. Vehicles per company (Top 5)
    const vehiclesPerCompany = await Vehicle.aggregate([
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'companyData' } },
      { $unwind: '$companyData' },
      { $project: { companyName: '$companyData.name', count: 1 } }
    ]);

    // 3. Most requested vehicle types
    const mostRequestedVehicleTypes = await Vehicle.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    // 4. Most active companies (by requests)
    const mostActiveCompanies = await TourRequest.aggregate([
      { $group: { _id: '$company', requestCount: { $sum: 1 } } },
      { $sort: { requestCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'companyData' } },
      { $unwind: '$companyData' },
      { $project: { companyName: '$companyData.name', requestCount: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalCompanies,
          totalDrivers,
          totalVehicles,
          totalDriverRequests,
          pendingRequests,
          acceptedRequests,
          rejectedRequests,
          completedTours,
          verifiedCompanies,
          pendingCompanies,
        },
        charts: {
          driversPerCompany,
          vehiclesPerCompany,
          mostRequestedVehicleTypes,
          mostActiveCompanies,
        }
      },
    });
  } catch (error) {
    console.error('Admin Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating admin analytics',
    });
  }
};

module.exports = {
  getAdminAnalytics,
};
