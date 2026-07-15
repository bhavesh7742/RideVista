const express = require('express');
const router = express.Router();

const {
  sendRequest,
  getTouristRequests,
  getCompanyRequests,
  getIncomingRequests,
  respondToRequest,
  getAllRequests,
  completeRequest,
} = require('../controllers/requestController');

const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const {
  createRequestValidator,
  respondRequestValidator,
} = require('../validators/requestValidator');

// All request routes require authentication
router.use(protect);

// Tourist routes
router.post(
  '/',
  authorize('user'),
  createRequestValidator,
  validate,
  sendRequest
);

router.get(
  '/tourist',
  authorize('user'),
  getTouristRequests
);

router.patch(
  '/:id/complete',
  authorize('user'),
  completeRequest
);

// Rental company owner route to fetch requests
router.get(
  '/company',
  authorize('rental_company'),
  getCompanyRequests
);

// Driver route to fetch requests
router.get(
  '/incoming',
  authorize('driver'),
  getIncomingRequests
);

// Driver response route
router.patch(
  '/:id/respond',
  authorize('driver'),
  respondRequestValidator,
  validate,
  respondToRequest
);

// Admin only global route
router.get(
  '/admin/all',
  authorize('admin'),
  getAllRequests
);

module.exports = router;
