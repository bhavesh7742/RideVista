const Review = require('../models/Review');
const Company = require('../models/Company');

// Helper to recalculate and update company ratings
const updateCompanyRatingStats = async (companyId) => {
  try {
    const reviews = await Review.find({ company: companyId });
    const numRatings = reviews.length;
    const rating = numRatings > 0 
      ? Number((reviews.reduce((acc, curr) => acc + curr.rating, 0) / numRatings).toFixed(1))
      : 0;

    await Company.findByIdAndUpdate(companyId, { rating, numRatings });
  } catch (error) {
    console.error('Error updating company rating stats:', error);
  }
};

/**
 * @desc    Leave a review for a rental company
 * @route   POST /api/reviews
 * @access  Private (Tourist/User only)
 */
const createReview = async (req, res) => {
  try {
    const { company: companyId, rating, comment } = req.body;

    // 1. Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Rental company not found',
      });
    }

    // 2. Check if user already reviewed this company
    const existingReview = await Review.findOne({ company: companyId, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this company',
      });
    }

    // 3. Create review
    const review = await Review.create({
      user: req.user.id,
      company: companyId,
      rating,
      comment,
    });

    // 4. Update company average rating & rating count
    await updateCompanyRatingStats(companyId);

    // Populate user details for response
    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview,
    });
  } catch (error) {
    console.error('Create Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting review',
    });
  }
};

/**
 * @desc    Get all reviews for a specific company
 * @route   GET /api/reviews/company/:companyId
 * @access  Public
 */
const getCompanyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ company: req.params.companyId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('Get Company Reviews Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving reviews',
    });
  }
};

/**
 * @desc    Delete a review (Admin or Owner only)
 * @route   DELETE /api/reviews/:id
 * @access  Private (Admin or review author)
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Auth check: Admin or author of review
    if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    const companyId = review.company;
    await Review.deleteOne({ _id: req.params.id });

    // Recalculate company stats
    await updateCompanyRatingStats(companyId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete Review Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting review',
    });
  }
};

module.exports = {
  createReview,
  getCompanyReviews,
  deleteReview,
};
