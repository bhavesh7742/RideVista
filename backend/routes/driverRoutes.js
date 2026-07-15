const express = require('express');
const router = express.Router();


const {
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
} = require('../controllers/driverController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');

const {
  createDriverValidator,
  updateDriverValidator,
} = require('../validators/driverValidator');

// All driver routes require login
router.use(protect);

router.get(
  '/me',
  authorize('driver'),
  getMeDriver
);

// Admin-only global drivers route
router.get(
  '/admin/all',
  authorize('admin'),
  getAllDrivers
);

// Publicly available to authenticated users (tourists) to pick available drivers of a company
router.get(
  '/company/:companyId',
  authorize('user', 'rental_company'),
  getAvailableDriversByCompany
);

// Independent driver registration route (Tourist pilot self onboarding)
router.post(
  '/register-independent',
  authorize('driver'),
  upload.single('avatar'),
  createDriverValidator,
  validate,
  registerIndependentDriver
);

// Company-only operations
router.post(
  '/',
  authorize('rental_company'),
  upload.single('avatar'),
  createDriverValidator,
  validate,
  addDriver
);

router.get(
  '/',
  authorize('rental_company'),
  getCompanyDrivers
);

router.delete(
  '/:id',
  authorize('rental_company', 'admin'),
  deleteDriver
);

// Driver registration approvals
router.patch(
  '/:id/approve',
  authorize('rental_company'),
  approveDriver
);

router.patch(
  '/:id/reject',
  authorize('rental_company'),
  rejectDriver
);

// Updates can be made by company owner OR driver themselves
router.put(
  '/:id',
  authorize('rental_company', 'driver'),
  upload.single('avatar'),
  updateDriverValidator,
  validate,
  updateDriver
);

module.exports = router;
