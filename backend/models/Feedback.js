const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['feedback', 'suggestion', 'bug_report', 'support_request'],
      default: 'feedback',
    },
    description: {
      type: String,
      required: [true, 'Please provide feedback description'],
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
