const express = require('express');
const router = express.Router();

const {
  addVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicles,
  getVehicleById,
  getCompanyVehicles,
  getAllVehicles,
} = require('../controllers/vehicleController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');

const {
  createVehicleValidator,
  updateVehicleValidator,
} = require('../validators/vehicleValidator');

/**
 * VEHICLE ROUTES
 *
 * NOTE ON ORDERING (Interview Alert):
 * Public routes or static sub-routes like `/search` MUST be defined BEFORE dynamic parameter routes like `/:id`.
 * If router.get('/:id') was defined first, a request to GET /search would map to GET /:id with id="search",
 * breaking the endpoint.
 */

// Admin only global route
router.get(
  '/admin/all',
  protect,
  authorize('admin'),
  getAllVehicles
);

// Protected company routes (require login)
router.get('/my-fleet', protect, authorize('rental_company'), getCompanyVehicles);

// Public route to search vehicles (accessible to tourists)
router.get('/search', searchVehicles);
router.get('/:id', getVehicleById);

router.post(
  '/',
  protect,
  authorize('rental_company'),
  upload.single('image'), // Handles a single multipart file upload
  createVehicleValidator,
  validate,
  addVehicle
);

router.put(
  '/:id',
  protect,
  authorize('rental_company'),
  upload.single('image'),
  updateVehicleValidator,
  validate,
  updateVehicle
);

router.delete(
  '/:id',
  protect,
  authorize('rental_company', 'admin'),
  deleteVehicle
);

module.exports = router;
