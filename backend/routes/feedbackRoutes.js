const express = require('express');
const router = express.Router();

const {
  submitFeedback,
  getAllFeedback,
  resolveFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');

const { protect, authorize } = require('../middleware/authMiddleware');

// All feedback routes require login
router.use(protect);

router.post('/', submitFeedback);

// Admin only routes
router.use(authorize('admin'));

router.get('/', getAllFeedback);
router.patch('/:id/resolve', resolveFeedback);
router.delete('/:id', deleteFeedback);

module.exports = router;
