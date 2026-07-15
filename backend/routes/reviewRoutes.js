const express = require('express');
const router = express.Router();

const { 
  createReview, 
  getCompanyReviews, 
  deleteReview 
} = require('../controllers/reviewController');

const { protect } = require('../middleware/authMiddleware');

// Public route to fetch reviews for a company
router.get('/company/:companyId', getCompanyReviews);

// Protected routes (Login required)
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
