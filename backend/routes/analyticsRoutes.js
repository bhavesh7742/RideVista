const express = require('express');
const router = express.Router();

const { getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Only admin can access analytics
router.get('/admin-dashboard', authorize('admin'), getAdminAnalytics);

module.exports = router;
