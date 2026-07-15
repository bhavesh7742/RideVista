const express = require('express');
const router = express.Router();
const { getCityTravelGuide } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// All AI routes require authentication
router.use(protect);

// POST /api/ai/travel — City Travel Guide powered by Gemini
router.post('/travel', getCityTravelGuide);

module.exports = router;
