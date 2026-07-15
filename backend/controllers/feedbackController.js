const Feedback = require('../models/Feedback');

/**
 * @desc    Submit new feedback
 * @route   POST /api/feedback
 * @access  Private (Any logged-in user)
 */
const submitFeedback = async (req, res) => {
  try {
    const { subject, category, description } = req.body;

    const feedback = await Feedback.create({
      user: req.user.id,
      subject,
      category,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { feedback },
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting feedback',
    });
  }
};

/**
 * @desc    Get all feedback
 * @route   GET /api/feedback
 * @access  Private (Admin only)
 */
const getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbackList.length,
      data: { feedback: feedbackList },
    });
  } catch (error) {
    console.error('Get Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feedback',
    });
  }
};

/**
 * @desc    Resolve feedback
 * @route   PATCH /api/feedback/:id/resolve
 * @access  Private (Admin only)
 */
const resolveFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    feedback.status = 'resolved';
    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Feedback marked as resolved',
      data: { feedback },
    });
  } catch (error) {
    console.error('Resolve Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error resolving feedback',
    });
  }
};

/**
 * @desc    Delete feedback
 * @route   DELETE /api/feedback/:id
 * @access  Private (Admin only)
 */
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    await feedback.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    console.error('Delete Feedback Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting feedback',
    });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
  resolveFeedback,
  deleteFeedback,
};
